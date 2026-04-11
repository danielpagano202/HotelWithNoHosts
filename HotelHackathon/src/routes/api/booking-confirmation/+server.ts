import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sendBookingConfirmation } from '$lib/mailer.js';

type BookingPayload = {
  customerEmail: string;
  bookingDetails: {
    customerName: string;
    checkIn: string;
    checkOut: string;
    roomId: string;
    bookingId: string;
  };
};

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = (await request.json().catch(() => null)) as BookingPayload | null;

    if (!body || !isNonEmptyString(body.customerEmail) || typeof body.bookingDetails !== 'object' || body.bookingDetails === null) {
      return json({ error: 'Invalid payload. Expected customerEmail and bookingDetails.' }, { status: 400 });
    }

    const { bookingDetails } = body;

    if (
      !isNonEmptyString(bookingDetails.customerName) ||
      !isNonEmptyString(bookingDetails.checkIn) ||
      !isNonEmptyString(bookingDetails.checkOut) ||
      !isNonEmptyString(bookingDetails.roomId) ||
      !isNonEmptyString(bookingDetails.bookingId)
    ) {
      return json({ error: 'Missing booking details fields.' }, { status: 400 });
    }

    await sendBookingConfirmation(body.customerEmail, bookingDetails);

    return json({ success: true, message: 'Booking confirmation email sent.' }, { status: 200 });
  } catch (error) {
    console.error('Booking confirmation email error:', error);
    return json({ error: 'Failed to send booking confirmation email.' }, { status: 500 });
  }
};
