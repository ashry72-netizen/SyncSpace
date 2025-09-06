import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Booking } from '../types';
import BookingModal from './BookingModal';

const CalendarPage: React.FC = () => {
    const { bookings, t, language } = useApp();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | undefined>(undefined);
    const [selectedDateForNew, setSelectedDateForNew] = useState<Date | null>(null);

    // Modal handling
    const handleEditBooking = (booking: Booking) => {
        setSelectedBooking(booking);
        setSelectedDateForNew(null);
        setIsModalOpen(true);
    };

    const handleNewBooking = (date: Date) => {
        setSelectedBooking(undefined);
        setSelectedDateForNew(date);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedBooking(undefined);
        setSelectedDateForNew(null);
    };

    // Calendar logic
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday of the first week

    const endDate = new Date(endOfMonth);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // End on Saturday of the last week

    const dates: Date[] = [];
    let date = new Date(startDate);
    while (date <= endDate) {
        dates.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }
    
    const isSameDay = (d1: Date, d2: Date) => 
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

    const weekdays = [...Array(7).keys()].map(i => {
        const d = new Date(2024, 0, i+1); // A known Sunday-starting week
        return d.toLocaleDateString(language, { weekday: 'short' });
    });

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t('calendar')}</h2>
                <div className="flex items-center space-x-4">
                    <button 
                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} 
                        className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm text-gray-700 dark:text-gray-200 font-medium border border-gray-200 dark:border-gray-700"
                    >
                        {t('previousMonth')}
                    </button>
                    <span className="text-lg font-semibold text-gray-700 dark:text-gray-200 w-48 text-center">{currentDate.toLocaleDateString(language, { month: 'long', year: 'numeric' })}</span>
                    <button 
                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} 
                        className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm text-gray-700 dark:text-gray-200 font-medium border border-gray-200 dark:border-gray-700"
                    >
                        {t('nextMonth')}
                    </button>
                </div>
            </div>
            
            {/* Calendar Grid */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md grid grid-cols-7">
                {/* Weekdays */}
                {weekdays.map(day => (
                    <div key={day} className="text-center font-semibold text-sm text-gray-500 dark:text-gray-400 py-3 border-b border-gray-200 dark:border-gray-700">{day}</div>
                ))}

                {/* Days */}
                {dates.map((day, index) => {
                    const bookingsForDay = bookings.filter(b => isSameDay(b.startTime, day));
                    const isToday = isSameDay(day, new Date());
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();

                    return (
                        <div 
                            key={index} 
                            onClick={() => handleNewBooking(day)}
                            className={`relative p-2 border-r border-b border-gray-200 dark:border-gray-700 cursor-pointer min-h-[120px] transition-colors duration-200 ${isCurrentMonth ? 'hover:bg-blue-50 dark:hover:bg-blue-900/30' : 'bg-gray-50 dark:bg-gray-800/50 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                        >
                            <span className={`absolute top-2 right-2 font-medium text-sm w-7 h-7 flex items-center justify-center ${isToday ? 'bg-blue-500 text-white rounded-full' : (isCurrentMonth ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500')}`}>{day.getDate()}</span>
                            <div className="mt-8 space-y-1 overflow-y-auto text-xs">
                                {bookingsForDay.map(booking => (
                                    <div 
                                        key={booking.id} 
                                        onClick={(e) => { e.stopPropagation(); handleEditBooking(booking); }}
                                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/70 text-blue-800 dark:text-blue-200 rounded-md truncate hover:bg-blue-200 dark:hover:bg-blue-900"
                                    >
                                        {booking.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {isModalOpen && (
                <BookingModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    booking={selectedBooking}
                    initialDate={selectedDateForNew}
                />
            )}
        </div>
    );
};

export default CalendarPage;