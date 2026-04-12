import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

export const GET: RequestHandler = async ({ params }) => {
  const { code } = params;
  console.log('API called with code (reservation id):', code);

  try {
    // Fetch reservation by ID (code is actually the reservation ID)
    const reservation = await pb
      .collection('Reservation')
      .getOne(code, {
        expand: 'reservation_users'
      });

    console.log('Reservation found:', JSON.stringify(reservation, null, 2));

    if (!reservation) {
      console.log('No reservation found');
      throw error(404, 'Reservation not found');
    }

    // Get customer name from expanded relation or directly
    const customerName = reservation.expand?.reservation_users?.name || 'Guest';
    console.log('Customer name:', customerName);

    const response = {
      name: customerName,
      code: reservation.id,
      checkIn: reservation.check_in || reservation.checkIn || '',
      checkOut: reservation.check_out || reservation.checkOut || '',
      addToWalletLink: reservation.addToWalletLink || '',
      roomId: reservation.room || '',
      customerId: reservation.reservation_users || '',
      status: reservation.status || '',
      totalPrice: reservation.totalPrice || 0
    };

    console.log('Returning response:', response);
    return json(response);
  } catch (err) {
    console.error('Failed to fetch reservation:', err);
    throw error(500, `Failed to fetch reservation data: ${err}`);
  }
};

