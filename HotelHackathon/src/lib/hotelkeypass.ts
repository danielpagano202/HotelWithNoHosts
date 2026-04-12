// ─────────────────────────────────────────────────────────────────────────────
// Hotel Key Card — Google Wallet Pass
//
// Flow:
//   1. Guest books → gets confirmation email with "Add to Google Wallet" button
//   2. Guest taps button → pass saved to their Google Wallet
//   3. At the door, guest opens Wallet → taps "Open My Door"
//   4. Browser opens your website → verifies identity → unlocks door
//
// Setup (one time):
//   1. console.cloud.google.com → New Project → Enable "Google Wallet API"
//   2. IAM → Service Accounts → Create → download JSON key
//   3. pay.google.com/business/console → register issuer → copy Issuer ID
//   4. npm install jsonwebtoken
// ─────────────────────────────────────────────────────────────────────────────

const jwt = require('jsonwebtoken');

const ISSUER_ID             = process.env.GOOGLE_WALLET_ISSUER_ID ?? '3388000000023100732';
const SERVICE_ACCOUNT_EMAIL = (process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL ?? 'hackathone411@hackathone-493018.iam.gserviceaccount.com').replace(/\\n/g, '\n');
const PRIVATE_KEY = process.env.GOOGLE_WALLET_PRIVATE_KEY ?? "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDmxsjI7UWVl2LR\nqRr4ddTA1QFdONcKlm3eb3YwkcYPcmQPybiJEvcxbxiTLpQUp2UN6T99WdBU/J3q\nUjO9vhfQwUj0/mKA8dqFxfmfKrYcRSeBkkx6YEg5g4LgjOlr/ZkIJUIvIqjXKXF7\nSsWgBBXMErvtRYku6+3MlbA00ClsHTSRqOkGk5N1K1ee02T24x3nCP9BrmsVVChE\nqSW+6HlD/VzPYan9aEtbAWPgLO71d+l9oBaCNLjwnc6wQkmXnjaCSxqRoDrxpDC4\nTwDjcew4U1iM/EDrYWV/tEaZKB9OPCTl0aBj4vfu2mJgPgWOB9Yxkc916YYfuTFF\nJW3HzaUPAgMBAAECggEAASetiZPmbUE8tV/rSqMMVYq7XwQRz3PBSQO1y7hvDVS9\nO3b+/XCi3BR6QwJQq2nLD67DKpVwfXxmLe4LZD+3Tswo2VEMnSiYt2KuRSWpk6qk\n7/kTeOlSczc9SHJsGKZERc4p7qJ1xd3nO368Tni2wza0yhM3BI0Zu5RkNV91VZ0t\nXy4hrMcQ2gwnHZSx1PIJ8CwWQd8Kg+TK5BGMAS3tRtCZeDt+yWQDdWVe4yA9Axn4\n/iTyBQU22+875+kCm7+s5Ht1X59ntysyYcwUoKhAFus93W4UHHQ74csyJgKlnDmR\n6QT66PnLybXLQO+dRv2GBQYkplPB8wzoSko9Lii9QQKBgQD4feLNs/hqg3dVgnyf\ntG1HpiFv40n+GE+lh2g3IYELg9EWl7IHFj/Gx11Q4tZOpg+tS/VTetu09dEubRVy\nXv4p10DRo+psUCA6qgtID03J2k7OimeBNqTAJjHzs+TVkv2wtcGDwb9u1yYAA7KP\nVdqrhY4EP2xm3I1ph/DdrOXwFQKBgQDtv95qOQ1mg6ac2u0VJna1Tu8HmLIsQj2n\nh9a6iSox2s5kyaoodJUfkv5jxdNlgiaZwuLUOeWY78zAJlzTgcUDLeNff9WLD6H4\nZuEMi6asYalkBb9A2e5Vt+MmPy27AJEUghmIYAbXhtw3pTuvgOrRRN0GKa7bgoCW\nag+DTnrlkwKBgG5Laf0F0dBtM+2XcntsmUjBG3xPNUt8PPXq6T33OBEFXCwb/uAY\nZwxy9x9s39Se7rxrx6NbF+P1a/igYHGYalXl/hZPHEEhO3zudv1wFYXvySTx18lJ\nmMzU5z0Vbw/BI6tosVErES5AftRoz7vBTsLtD8Eg6Zuqb3YU6btq/9CVAoGAF1OB\n4O4kEHDOQgmAxVh2wSczcI1cvdbp8av0N20JxMZxBZZ7qWh20Rg8+VEJgqYYX3Gt\ni6D6k9zDO/8HkIDk8YDpFA+YxgIMpDCD2BVDjxot4nBl6Vj4d1SJZtFADV7q3RY+\npxC02ySSKqt9haSiZVHaVaZ1T3goYZmaWAm1KR0CgYApedyhAvCW+L8CsUKnARyq\n8ZSjZVcdt7P+jsQRIGqyE9ZTRBDuUQJPlgXeWvWq35DB5j0ZOw04iNCnTnuQd8fK\nEWRPVZp2jSd3yiQzqIHAT0YpUMoavqfO1BeDnLJg/7Jx4jYDYDy0OIt+M61g9Eku\nBMO+8ZxlnZ9/PScp+0YdAA==\n-----END PRIVATE KEY-----\n";

const HOTEL_NAME  = process.env.HOTEL_NAME ?? 'Hotel NoHost';
const HOTEL_COLOR = process.env.HOTEL_COLOR ?? '#1a1a2e';
const BASE_URL    = process.env.BASE_URL ?? 'https://localhost:5173';

// ─────────────────────────────────────────────────────────────────────────────

interface HotelKeyPassParams {
  guestName: string;
  confirmationCode: string;
  room: string;
  checkIn: string;
  checkOut: string;
}
 
function createHotelKeyPass({
  guestName,
  confirmationCode,
  room,
  checkIn,
  checkOut,
}: HotelKeyPassParams): string {
  const objectId = `${ISSUER_ID}.hotel_key_${confirmationCode}`;
 
  const formatDate = (d: string): string =>
    new Date(d).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });
 
  const doorUnlockUrl = `${BASE_URL}/door/${confirmationCode}`;
 
  const passObject = {
    id: objectId,
    classId: `${ISSUER_ID}.hotel_key_class`,
    genericType: 'GENERIC_TYPE_UNSPECIFIED',
    hexBackgroundColor: HOTEL_COLOR,
 
    cardTitle: { defaultValue: { language: 'en-US', value: HOTEL_NAME } },
    header:    { defaultValue: { language: 'en-US', value: guestName } },
    subheader: { defaultValue: { language: 'en-US', value: `Room ${room} · Room Key` } },
 
    textModulesData: [
      { id: 'room',         header: 'Room',         body: room },
      { id: 'confirmation', header: 'Confirmation', body: confirmationCode },
      { id: 'checkin',      header: 'Check-in',     body: formatDate(checkIn) },
      { id: 'checkout',     header: 'Check-out',    body: formatDate(checkOut) },
    ],
 
    linksModuleData: {
      uris: [
        {
          id: 'door_unlock',
          uri: doorUnlockUrl,
          description: '🚪 Open My Door',
        },
      ],
    },
 
    validTimeInterval: {
      start: { date: new Date(checkIn).toISOString() },
      end:   { date: new Date(checkOut).toISOString() },
    },
 
    notifications: {
      upcomingNotification: { enableNotification: true },
    },
  };
 
  const payload = {
    iss: SERVICE_ACCOUNT_EMAIL,
    aud: 'google',
    typ: 'savetowallet',
    iat: Math.floor(Date.now() / 1000),
    origins: [BASE_URL],
    payload: { genericObjects: [passObject] },
  };
 
  const token = jwt.sign(payload, PRIVATE_KEY, { algorithm: 'RS256' });
  return `https://pay.google.com/gp/v/save/${token}`;
}
 
export { createHotelKeyPass };