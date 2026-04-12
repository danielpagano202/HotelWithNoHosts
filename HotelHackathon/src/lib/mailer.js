import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';

const EMAIL_USER = env.EMAIL_USER;
const EMAIL_PASS = env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

export async function sendBookingConfirmation(customerEmail, bookingDetails) {
  const { customerName, checkIn, checkOut, roomId, bookingId } = bookingDetails;
  const mailFrom = EMAIL_USER || env.EMAIL_USER || 'no-reply@example.com';

  await transporter.sendMail({
    from: `"Grand Hotel" <${mailFrom}>`,
    to: customerEmail,
    subject: `Reservation Confirmed - #${bookingId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>Reservation Confirmed! 🎉</h2>
        <p>Dear ${customerName},</p>
        <p>Your reservation has been successfully booked. Here are your details:</p>

        <table style="width:100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Booking ID</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">#${bookingId}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Room</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${roomId}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Check-In</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${checkIn}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Check-Out</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${checkOut}</td>
          </tr>
        </table>

        <p>We look forward to welcoming you!</p>
        <p><strong>The Grand Hotel Team</strong></p>
      </div>
    `
  });
}
