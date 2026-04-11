import { json } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { sendBookingConfirmation } from '$lib/mailer.js';

export async function POST({ request }) {
  const { customerId, customerName, customerEmail, roomId, checkIn, checkOut } = await request.json();

  const pb = new PocketBase('http://172.28.122.231:8090');

  try {
    // Save reservation to PocketBase
    const reservation = await pb.collection('Reservation').create({
      reservation_customer: customerId,
      check_in: checkIn,
      check_out: checkOut,
    });

    // Update room to occupied
    await pb.collection('Room').update(roomId, {
      room_customer: customerId,
      status: 'occupied'
    });

    // Send confirmation email
    await sendBookingConfirmation(customerEmail, {
      customerName,
      checkIn,
      checkOut,
      roomId,
      bookingId: reservation.id
    });

    return json({ success: true });

  } catch (error) {
    console.error('Booking error:', error);
    return json({ success: false, error: error.message });
  }
}
