import type { Booking, User, Room } from '../types';

const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

const sendEmail = (to: string, subject: string, body: string) => {
    console.log(`
    --- SIMULATED EMAIL ---
    To: ${to}
    Subject: ${subject}
    -------------------------
    ${body}
    -------------------------
    `);
};

export const sendBookingConfirmationEmail = (booking: Booking, users: User[], rooms: Room[]) => {
    const user = users.find(u => u.id === booking.userId);
    const room = rooms.find(r => r.id === booking.roomId);

    if (!user || !room) {
        console.error("Could not send confirmation email: User or Room not found.");
        return;
    }

    const subject = `Booking Confirmation: ${booking.title}`;
    const body = `
    Hello ${user.name},

    Your booking for "${booking.title}" has been confirmed.

    Details:
    - Room: ${room.name}
    - Date: ${formatDate(booking.startTime)}
    - Time: ${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}

    Thank you,
    Room Booker
    `;

    sendEmail(user.name, subject, body);
};


export const sendBookingUpdateEmail = (booking: Booking, users: User[], rooms: Room[]) => {
    const user = users.find(u => u.id === booking.userId);
    const room = rooms.find(r => r.id === booking.roomId);

    if (!user || !room) {
        console.error("Could not send update email: User or Room not found.");
        return;
    }

    const subject = `Booking Updated: ${booking.title}`;
    const body = `
    Hello ${user.name},

    Your booking for "${booking.title}" has been updated.

    New Details:
    - Room: ${room.name}
    - Date: ${formatDate(booking.startTime)}
    - Time: ${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}

    Thank you,
    Room Booker
    `;

    sendEmail(user.name, subject, body);
};

export const sendBookingCancellationEmail = (booking: Booking, users: User[], rooms: Room[]) => {
    const user = users.find(u => u.id === booking.userId);
    const room = rooms.find(r => r.id === booking.roomId);

    if (!user || !room) {
        console.error("Could not send cancellation email: User or Room not found.");
        return;
    }

    const subject = `Booking Cancelled: ${booking.title}`;
    const body = `
    Hello ${user.name},

    Your booking for "${booking.title}" has been cancelled.

    Details of the cancelled booking:
    - Room: ${room.name}
    - Date: ${formatDate(booking.startTime)}
    - Time: ${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}

    Thank you,
    Room Booker
    `;

    sendEmail(user.name, subject, body);
};
