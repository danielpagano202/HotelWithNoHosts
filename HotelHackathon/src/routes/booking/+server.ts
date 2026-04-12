import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import jwt from 'jsonwebtoken';
import { pb } from '$lib/pocketbase';
import { sendBookingConfirmation } from '$lib/mailer.js';
import { GOOGLE_WALLET_ISSUER_ID, GOOGLE_WALLET_SA_EMAIL, GOOGLE_WALLET_PRIVATE_KEY } from '$env/static/private';
const ISSUER_ID             = GOOGLE_WALLET_ISSUER_ID ?? '';
const SERVICE_ACCOUNT_EMAIL = GOOGLE_WALLET_SA_EMAIL ?? '';
const PRIVATE_KEY           = (GOOGLE_WALLET_PRIVATE_KEY ?? '').replace(/\\n/g, '\n');
const HOTEL_NAME            = process.env.HOTEL_NAME ?? 'HotelNoHost';
const HOTEL_COLOR           = process.env.HOTEL_COLOR ?? '#1a1a2e';
const BASE_URL              = process.env.BASE_URL ?? 'https://your-hotel.com';

function buildAddToWalletLink({ confirmationCode, guestName, room, checkIn, checkOut }:
  { confirmationCode: string; guestName: string; room: string; checkIn: string; checkOut: string }) {
console.log("stuff:",ISSUER_ID, SERVICE_ACCOUNT_EMAIL, PRIVATE_KEY);
  if (!ISSUER_ID || !SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY) {
    console.warn('Google Wallet env is not fully configured. Skipping wallet link generation.');
    return '';
  }

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

  try {
    const token = jwt.sign({
      iss: SERVICE_ACCOUNT_EMAIL,
      aud: 'google',
      typ: 'savetowallet',
      iat: Math.floor(Date.now() / 1000),
      origins: [BASE_URL],
      payload: { genericObjects: [passObject] },
    }, PRIVATE_KEY, { algorithm: 'RS256' });

    return `https://pay.google.com/gp/v/save/${token}`;
  } catch (err) {
    console.error('Failed to generate Google Wallet link:', err);
    return '';
  }
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { guestName, guestEmail, checkIn, checkOut, userId, roomId } = await request.json();

    if (!guestName || !guestEmail || !checkIn || !checkOut || !userId || !roomId) {
      return json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const room = await pb.collection('Room').getOne(roomId);

    if (!room) {
      return json({ error: 'Selected room not found.' }, { status: 404 });
    }

    if (room.Status === 'Occupied') {
      return json({ error: 'Selected room is no longer available.' }, { status: 400 });
    }

    const roomKey = await pb.collection('Roomkey').create({
      user: userId,
      room: roomId,
    });

    await pb.collection('Room').update(roomId, {
      Status: 'Occupied',
      room_user: userId,
    });

    const reservation = await pb.collection('Reservation').create({
      check_in: checkIn,
      check_out: checkOut,
      reservation_users: userId,
      reservation_roomkey: roomKey.id,
      guestName,
      guestEmail,
    });

    const confirmationCode = reservation.id;
    const roomLabel = room.roomNumber ?? roomId;
    const addToWalletLink = buildAddToWalletLink({ confirmationCode, guestName, room: roomLabel, checkIn, checkOut });

    try {
      await sendBookingConfirmation(guestEmail, {
        customerName: guestName,
        checkIn,
        checkOut,
        roomId: roomLabel,
        bookingId: confirmationCode,
      });
    } catch (emailError) {
      console.warn('Booking created, but email failed:', emailError);
    }

    return json({ confirmationCode, room: roomLabel, addToWalletLink }, { status: 201 });
  } catch (err) {
    console.error('Booking error:', err);
    return json({ error: 'Internal server error.' }, { status: 500 });
  }
};