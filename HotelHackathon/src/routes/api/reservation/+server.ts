import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import jwt from 'jsonwebtoken';

const ISSUER_ID             = process.env.GOOGLE_WALLET_ISSUER_ID ?? '';
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_WALLET_SA_EMAIL ?? '';
const PRIVATE_KEY           = (process.env.GOOGLE_WALLET_PRIVATE_KEY ?? '').replace(/\\n/g, '\n');
const HOTEL_NAME            = process.env.HOTEL_NAME ?? 'HotelNoHost';
const HOTEL_COLOR           = process.env.HOTEL_COLOR ?? '#1a1a2e';
const BASE_URL              = process.env.BASE_URL ?? 'https://your-hotel.com';

const ROOMS = ['101', '102', '203', '204', '305', '306', '401', '402'];
let roomIdx = 0;

function assignRoom() {
  const room = ROOMS[roomIdx % ROOMS.length];
  roomIdx++;
  return room;
}

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
    const { guestName, guestEmail, checkIn, checkOut } = await request.json();

    if (!guestName || !guestEmail || !checkIn || !checkOut) {
      return json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const confirmationCode = generateConfirmationCode();
    const room = assignRoom();
    const addToWalletLink = buildAddToWalletLink({ confirmationCode, guestName, room, checkIn, checkOut });

    // TODO: Save to PocketBase
    // await pb.collection('reservations').create({ guestName, guestEmail, confirmationCode, room, checkIn, checkOut });

    // TODO: Send confirmation email
    // await sendConfirmationEmail({ guestName, guestEmail, confirmationCode, room, checkIn, checkOut, addToWalletLink });

    return json({ confirmationCode, room, addToWalletLink }, { status: 201 });
  } catch (err) {
    console.error(err);
    return json({ error: 'Internal server error.' }, { status: 500 });
  }
};