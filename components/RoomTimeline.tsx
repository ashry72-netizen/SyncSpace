import React from 'react';
import { useApp } from '../context/AppContext';
import type { Booking } from '../types';

interface RoomTimelineProps {
    roomId: string;
    date: Date;
    onSelectSlot: (startTime: Date, roomId: string) => void;
    onSelectBooking: (booking: Booking) => void;
}

const RoomTimeline: React.FC<RoomTimelineProps> = ({ roomId, date, onSelectSlot, onSelectBooking }) => {
    const { bookings, users, currentUser } = useApp();
    const WORK_DAY_START_HOUR = 8;
    const WORK_DAY_END_HOUR = 18;
    const SLOT_DURATION_MINUTES = 30;
    const totalSlots = (WORK_DAY_END_HOUR - WORK_DAY_START_HOUR) * (60 / SLOT_DURATION_MINUTES);

    const bookingsForRoomAndDay = bookings.filter(b => {
        const d = b.startTime;
        return b.roomId === roomId &&
            d.getFullYear() === date.getFullYear() &&
            d.getMonth() === date.getMonth() &&
            d.getDate() === date.getDate();
    });

    const renderBookings = () => {
        return bookingsForRoomAndDay.map(booking => {
            const startOfDay = new Date(date);
            startOfDay.setHours(WORK_DAY_START_HOUR, 0, 0, 0);
            
            const startOffsetMinutes = Math.max(0, (booking.startTime.getTime() - startOfDay.getTime()) / (1000 * 60));
            
            const durationMinutes = (booking.endTime.getTime() - booking.startTime.getTime()) / (1000 * 60);

            const totalDayMinutes = (WORK_DAY_END_HOUR - WORK_DAY_START_HOUR) * 60;
            const left = (startOffsetMinutes / totalDayMinutes) * 100;
            const width = (durationMinutes / totalDayMinutes) * 100;
            
            if (width <= 0 || left > 100) return null;

            const bookingUser = users.find(u => u.id === booking.userId);
            const isOwnBooking = booking.userId === currentUser?.id;

            return (
                <div
                    key={booking.id}
                    className={`absolute h-full p-2 rounded-lg cursor-pointer text-white flex flex-col justify-center overflow-hidden ${isOwnBooking ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 dark:bg-gray-600 hover:bg-gray-500 dark:hover:bg-gray-500'}`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                    onClick={() => onSelectBooking(booking)}
                    title={`${booking.title} by ${bookingUser?.name}`}
                >
                    <p className="font-bold text-sm truncate">{booking.title}</p>
                    <p className="text-xs truncate">{bookingUser?.name}</p>
                </div>
            );
        });
    };

    const renderSlots = () => {
        return Array.from({ length: totalSlots }).map((_, index) => {
            const slotStartTime = new Date(date);
            slotStartTime.setHours(WORK_DAY_START_HOUR, 0, 0, 0);
            slotStartTime.setMinutes(index * SLOT_DURATION_MINUTES);

            return (
                <div
                    key={index}
                    className="flex-1 h-full border-r border-gray-200 dark:border-gray-700 last:border-r-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
                    onClick={() => onSelectSlot(slotStartTime, roomId)}
                />
            );
        });
    };
    
    const renderTimeMarkers = () => {
        const hours = [];
        for (let i = WORK_DAY_START_HOUR; i <= WORK_DAY_END_HOUR; i++) {
             hours.push(i);
        }
        return (
             <div className="relative h-4 mt-1 flex">
                 {hours.map((hour, index) => (
                    <div
                        key={hour}
                        className="relative text-xs text-gray-400 dark:text-gray-500 text-center"
                        style={{ width: `${(1 / (hours.length -1)) * 100}%` }}
                    >
                         <span className="absolute left-0 -translate-x-1/2">{hour}:00</span>
                    </div>
                ))}
            </div>
        )
    };

    return (
        <div>
            <div className="relative h-16 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="absolute inset-0 flex">
                    {renderSlots()}
                </div>
                {renderBookings()}
            </div>
            {renderTimeMarkers()}
        </div>
    );
};

export default RoomTimeline;