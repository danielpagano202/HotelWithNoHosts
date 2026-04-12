import PocketBase from 'pocketbase';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import jwt from 'jsonwebtoken';
import { sendBookingConfirmation } from '$lib/mailer.js';
import { pb } from '$lib/pocketbase';
const ISSUER_ID             = process.env.GOOGLE_WALLET_ISSUER_ID ?? '';
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_WALLET_SA_EMAIL ?? '';
const PRIVATE_KEY           = (process.env.GOOGLE_WALLET_PRIVATE_KEY ?? '').replace(/\\n/g, '\n');
const HOTEL_NAME            = process.env.HOTEL_NAME ?? 'HotelNoHost';
const HOTEL_COLOR           = process.env.HOTEL_COLOR ?? '#1a1a2e';
const BASE_URL              = process.env.BASE_URL ?? 'https://your-hotel.com';

const ROOMS = ['101', '102', '203', '204', '305', '306', '401', '402'];
let roomIdx = 0;

function generateConfirmationCode() {
  return 'HTL-' + Math.random().toString(36).toUpperCase().slice(2, 8);
}

function buildAddToWalletLink({ confirmationCode, guestName, room, checkIn, checkOut }:
  { confirmationCode: string; guestName: string; room: string; checkIn: string; checkOut: string }) {

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });

  const passObject = {
    id: `${ISSUER_ID}.hotel_key_${confirmationCode}`,
    classId: `${ISSUER_ID}.hotel_key_class`,
    genericType: 'GENERIC_TYPE_UNSPECIFIED',
    hexBackgroundColor: HOTEL_COLOR,
    cardTitle: { defaultValue: { language: 'en-US', value: HOTEL_NAME } },
    header:    { defaultValue: { language: 'en-US', value: guestName } },
    subheader: { defaultValue: { language: 'en-US', value: `Room ${room} · Room Key` } },
    textModulesData: [
      { id: 'room',         header: 'Room',         body: room },
      { id: 'confirmation', header: 'Confirmation', body: confirmationCode },
      { id: 'checkin',      header: 'Check-in',     body: fmt(checkIn) },
      { id: 'checkout',     header: 'Check-out',    body: fmt(checkOut) },
    ],
    linksModuleData: {
      uris: [{
        id: 'door_unlock',
        uri: `${BASE_URL}/door/${confirmationCode}`,
        description: '🚪 Open My Door',
      }],
    },
    validTimeInterval: {
      start: { date: new Date(checkIn).toISOString() },
      end:   { date: new Date(checkOut).toISOString() },
    },
    notifications: {
      upcomingNotification: { enableNotification: true },
    },
  };

  const token = jwt.sign({
    iss: SERVICE_ACCOUNT_EMAIL,
    aud: 'google',
    typ: 'savetowallet',
    iat: Math.floor(Date.now() / 1000),
    origins: [BASE_URL],
    payload: { genericObjects: [passObject] },
  }, PRIVATE_KEY, { algorithm: 'RS256' });

  return `https://pay.google.com/gp/v/save/${token}`;
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { guestName, guestEmail, checkIn, checkOut, userId, roomId } = await request.json();
    console.log('Received request data:', { guestName, guestEmail, checkIn, checkOut, userId, roomId });

    if (!guestName || !guestEmail || !checkIn || !checkOut || !userId || !roomId) {
      return json({ error: 'Missing required fields: guestName, guestEmail, checkIn, checkOut, userId, roomId.' }, { status: 400 });
    }

    // Verify the selected room is available
    try {
      const room = await pb.collection('Room').getOne(roomId);
      if (room.Status === 'Occupied') {
        return json({ error: 'Selected room is no longer available. Please choose another room.' }, { status: 400 });
      }
      console.log('Selected room is available:', room);
    } catch (err) {
      console.error('Error checking room availability:', err);
      return json({ error: 'Selected room not found.' }, { status: 400 });
    }

    const addToWalletLink = '';
      //  buildAddToWalletLink({ confirmationCode, guestName, room, checkIn, checkOut });


// Save to PocketBase
let roomKey: any;
let confirmationCode: string;

console.log('Creating roomkey with user:', userId, 'and room:', roomId);
try {
  roomKey = await pb.collection('Roomkey').create({
    user: userId,
    room: roomId,
  });
  console.log('✅ Roomkey created successfully with ID:', roomKey.id);
} catch (err: any) {
  console.error('❌ Roomkey creation failed:', err.message);
  console.error('Roomkey error details:', err.response?.data);
  throw err;
}

// Update room status to Occupied and set room_user
console.log('Updating room with user:', userId, 'and status: Occupied');
try {
  const updatedRoom = await pb.collection('Room').update(roomId, {
    Status: 'Occupied',
    room_user: userId
  });
  console.log('✅ Room updated successfully:', updatedRoom);
} catch (err: any) {
  console.error('❌ Room update failed:', err.message);
  console.error('Room update error details:', err.response?.data);
  throw err;
}

// Create reservation
console.log('Creating reservation with user:', userId, 'and roomkey:', roomKey.id);
try {
  const newReservation = await pb.collection('Reservation').create({
    check_in: checkIn,
    check_out: checkOut,
    reservation_users: userId,
    reservation_roomkey: roomKey.id
  });
  console.log('✅ Reservation created successfully with ID:', newReservation.id);
  confirmationCode = newReservation.id;
} catch (err: any) {
  console.error('❌ Reservation creation failed:', err.message);
  console.error('Reservation error details:', err.response?.data);
  throw err;
}


// Send confirmation email
await sendBookingConfirmation(guestEmail, {
  customerName: guestName,
  checkIn,
  checkOut,
  roomId: roomId,
  bookingId: confirmationCode
});

// Create notification record
console.log('Creating notification for user:', userId);
try {
  const notification = await pb.collection('Notification').create({
    Title: 'Reservation Confirmed',
    Body: `Your reservation has been confirmed! Booking ID: #${confirmationCode}, Room: ${roomId}, Check-in: ${checkIn}, Check-out: ${checkOut}`,
    notification_user: userId,
    room: roomId,
    read: false
  });
  console.log('✅ Notification created successfully with ID:', notification.id);
} catch (err: any) {
  console.error('❌ Notification creation failed:', err.message);
  console.error('Notification error details:', err.response?.data);
  // Don't throw here - notification failure shouldn't break the reservation
}

return json({ confirmationCode, room: roomId, addToWalletLink }, { status: 201 });
  } catch (err) {
    console.error(err);
    return json({ error: 'Internal server error.' }, { status: 500 });
  }
};
