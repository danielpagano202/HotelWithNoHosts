import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { pb } from '$lib/pocketbase';

export const GET: RequestHandler = async () => {
  try {
    // Fetch all rooms and filter for available ones
    const allRooms = await pb.collection('Room').getFullList();
    console.log('Total rooms in database:', allRooms.length);

    // Filter for rooms that are not occupied
    const availableRooms = allRooms.filter(room => room.Status !== 'Occupied');
    console.log('Available rooms:', availableRooms.length);

    // Return room data for the dropdown
    const roomOptions = availableRooms.map(room => ({
      id: room.id,
      roomNumber: room.Room_Number,
      location: room.Location,
      numBeds: room.num_beds
    }));

    console.log('Returning room options:', roomOptions);
    return json(roomOptions);
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    return json({ error: 'Failed to fetch available rooms' }, { status: 500 });
  }
};