import React, { useState } from 'react';
import type { Booking } from '../types';
import { useApp } from '../context/AppContext';

interface CalendarViewProps {
    bookings: Booking[];
    onSelectBooking: (booking: Booking) => void;
    onSelectSlot: () => void;
}

type RoomStatusInfo =
    | { status: 'Busy'; booking: Booking }
    | { status: 'Upcoming'; booking: Booking }
    | { status: 'Available' };

const getRoomStatus = (roomId: string, bookings: Booking[]): RoomStatusInfo => {
    const now = new Date();

    // Find all bookings for this room that are still relevant (haven't ended yet), sorted by start time
    const relevantBookings = bookings
        .filter(b => b.roomId === roomId && b.endTime > now)
        .slice() // Create a shallow copy to sort safely without mutating the original array
        .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    // Check for a booking happening right now
    const currentBooking = relevantBookings.find(
        b => now >= b.startTime && now < b.endTime
    );

    if (currentBooking) {
        return { status: 'Busy', booking: currentBooking };
    }

    // If not busy, find the very next booking
    const nextBooking = relevantBookings.find(b => b.startTime > now);

    if (nextBooking) {
        return { status: 'Upcoming', booking: nextBooking };
    }
    
    // If no current or upcoming bookings, the room is available
    return { status: 'Available' };
};


const CalendarView: React.FC<CalendarViewProps> = ({ bookings, onSelectBooking, onSelectSlot }) => {
    const { t, rooms, language } = useApp();
    const [selectedDate, setSelectedDate] = useState(new Date());

    const bookingsForDate = bookings.filter(b => {
        const d = b.startTime;
        return d.getFullYear() === selectedDate.getFullYear() &&
               d.getMonth() === selectedDate.getMonth() &&
               d.getDate() === selectedDate.getDate();
    });

    const changeDate = (amount: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + amount);
        setSelectedDate(newDate);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeDate(-1)} className="p-2 rounded-full hover:bg-gray-200">&lt;</button>
                <h3 className="text-xl font-semibold">{selectedDate.toLocaleDateString(language, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                <button onClick={() => changeDate(1)} className="p-2 rounded-full hover:bg-gray-200">&gt;</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms.map(room => {
                    const roomBookings = bookingsForDate.filter(b => b.roomId === room.id).sort((a,b) => a.startTime.getTime() - b.startTime.getTime());
                    const statusInfo = getRoomStatus(room.id, bookings);
                    
                    let statusConfig: { color: string; textClass: string };
                    let statusText: string;
                    const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };

                    switch (statusInfo.status) {
                        case 'Busy':
                            statusConfig = { color: 'bg-red-500', textClass: 'text-red-600' };
                            statusText = t('roomStatusBusyUntil').replace('{time}', statusInfo.booking.endTime.toLocaleTimeString(language, timeOptions));
                            break;
                        case 'Upcoming':
                            statusConfig = { color: 'bg-yellow-500', textClass: 'text-yellow-600' };
                            statusText = t('roomStatusUpcomingAt').replace('{time}', statusInfo.booking.startTime.toLocaleTimeString(language, timeOptions));
                            break;
                        case 'Available':
                        default:
                            statusConfig = { color: 'bg-green-500', textClass: 'text-green-600' };
                            statusText = t('roomStatusAvailableAllDay');
                            break;
                    }

                    return (
                        <div key={room.id} className="border rounded-lg p-4 flex flex-col">
                            <div className="text-center">
                                <h4 className="font-bold">{room.name}</h4>
                                <div className={`flex items-center justify-center mt-1 text-xs font-medium ${statusConfig.textClass}`}>
                                    <span className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${statusConfig.color}`}></span>
                                    <span>{statusText}</span>
                                </div>
                            </div>
                            <div className="flex-grow mt-2">
                                {roomBookings.length > 0 ? (
                                    <ul className="space-y-2">
                                        {roomBookings.map(booking => (
                                            <li key={booking.id}
                                                onClick={() => onSelectBooking(booking)}
                                                className="bg-blue-100 text-blue-800 p-2 rounded cursor-pointer hover:bg-blue-200">
                                                <p className="font-semibold truncate">{booking.title}</p>
                                                <p className="text-sm">{`${booking.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${booking.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="h-full flex items-center justify-center">
                                        <p className="text-gray-500 text-center text-sm">{t('noBookingsForDate')}</p>
                                    </div>
                                )}
                            </div>
                             <button onClick={onSelectSlot} className="w-full mt-2 text-sm text-blue-500 hover:underline">+ {t('newBooking')}</button>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default CalendarView;