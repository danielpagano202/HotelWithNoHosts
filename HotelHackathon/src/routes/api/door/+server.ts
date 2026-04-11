import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const { code } = await request.json();

  try {
    // TODO: Replace with PocketBase lookup
    // const reservation = await pb.collection('reservations')
    //   .getFirstListItem(`confirmationCode = "${code}"`);
    const reservation = await lookupReservation(code);

    if (!reservation) {
      return json({ error: 'Reservation not found.' }, { status: 404 });
    }

    const now      = new Date();
    const checkIn  = new Date(reservation.checkIn);
    const checkOut = new Date(reservation.checkOut);

    if (now < checkIn)  return json({ error: 'Your check-in has not started yet.' }, { status: 403 });
    if (now > checkOut) return json({ error: 'Your reservation has expired.' }, { status: 403 });

    // TODO: Replace with your real door lock API
    // await fetch('https://your-lock-api.com/unlock', {
    //   method: 'POST',
    //   headers: { Authorization: `Bearer ${process.env.LOCK_API_KEY}` },
    //   body: JSON.stringify({ room: reservation.room, duration: 10 }),
    // });
    await simulateDoorUnlock(reservation.room);

    return json({ success: true, room: reservation.room });

  } catch (err) {
    console.error(err);
    return json({ error: 'Could not unlock door. Please contact the front desk.' }, { status: 500 });
  }
};

async function lookupReservation(code: string) {
  // Mock — swap for PocketBase
  return {
    confirmationCode: code,
    room: '304',
    checkIn:  new Date(Date.now() - 86400000).toISOString(),
    checkOut: new Date(Date.now() + 86400000 * 3).toISOString(),
  };
}

async function simulateDoorUnlock(room: string) {
  await new Promise((r) => setTimeout(r, 1000));
  console.log(`[DOOR] Room ${room} unlocked.`);
}