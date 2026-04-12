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
    console.log('Reservation expand data:', reservation.expand);
    console.log('Reservation reservation_users field:', reservation.reservation_users);

    if (!reservation) {
      console.log('No reservation found');
      throw error(404, 'Reservation not found');
    }

    // Get customer name from expanded relation or directly
    let userData = reservation.expand?.reservation_users;
    if (!userData && reservation.reservation_users) {
      console.log('Expand failed, fetching user directly...');
      // Try different collection names
      const collectionNames = ['_pb_users_auth_', 'users', 'User'];
      for (const collectionName of collectionNames) {
        try {
          console.log(`Trying collection: ${collectionName}`);
          userData = await pb.collection(collectionName).getOne(reservation.reservation_users);
          console.log(`User found in ${collectionName}:`, userData);
          break; // Stop trying other collections if successful
        } catch (directFetchError) {
          console.log(`Collection ${collectionName} failed:`, directFetchError.message);
        }
      }
    }

    console.log('Final user data:', userData);
    console.log('User data fields:', userData ? Object.keys(userData) : 'No user data');

    const customerName = userData?.name || userData?.username || userData?.email || 'Guest';
    console.log('Customer name extracted:', customerName);

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

