// Fix: Provide full implementation for BookingModal to allow creating and editing bookings.
import React, { useState, useEffect, useMemo } from 'react';
import type { Booking } from '../types';
import { useApp } from '../context/AppContext';
import DatePicker from './DatePicker';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking?: Booking;
    initialDate?: Date | null;
    initialRoomId?: string | null;
}

const MAX_BOOKING_DURATION_MINUTES = 4 * 60; // 4 hours

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, booking, initialDate, initialRoomId }) => {
    const { rooms, bookings, addBooking, updateBooking, t } = useApp();
    
    const getInitialState = () => {
        const date = booking?.startTime || initialDate || new Date();
        const start = new Date(date);
        if (!booking && !initialDate) {
            const minutes = start.getMinutes();
            if (minutes > 0 && minutes < 30) start.setMinutes(30,0,0);
            else if (minutes > 30) start.setHours(start.getHours() + 1, 0, 0, 0);
            else start.setHours(start.getHours() + 1, 0, 0, 0);
        } else if (initialDate) {
            start.setHours(9, 0, 0, 0); // Default to 9am for new bookings from calendar
        }

        const end = new Date(start);
        end.setHours(end.getHours() + 1);

        return {
            title: booking?.title || '',
            roomId: booking?.roomId || initialRoomId || '',
            date: start,
            startTime: start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            endTime: (booking?.endTime || end).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        };
    };
    
    const [formData, setFormData] = useState(getInitialState);
    const [durationError, setDurationError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialState());
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, booking, initialDate, initialRoomId]);

    useEffect(() => {
        if (!formData.startTime || !formData.endTime) {
            setDurationError('');
            return;
        }

        const [startHour, startMinute] = formData.startTime.split(':').map(Number);
        const [endHour, endMinute] = formData.endTime.split(':').map(Number);
        
        const startDate = new Date();
        startDate.setHours(startHour, startMinute, 0, 0);

        const endDate = new Date();
        endDate.setHours(endHour, endMinute, 0, 0);

        if (endDate <= startDate) {
            setDurationError('End time must be after start time.');
            return;
        }

        const durationMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);

        if (durationMinutes > MAX_BOOKING_DURATION_MINUTES) {
            setDurationError(`Booking cannot exceed ${MAX_BOOKING_DURATION_MINUTES / 60} hours.`);
            return;
        }

        setDurationError('');

    }, [formData.startTime, formData.endTime]);

    const dailySchedule = useMemo(() => {
        if (!formData.roomId || !formData.date) return null;
    
        const selectedDayStart = new Date(formData.date);
        selectedDayStart.setHours(0, 0, 0, 0);
    
        const selectedDayEnd = new Date(formData.date);
        selectedDayEnd.setHours(23, 59, 59, 999);
    
        const bookingsForDay = bookings.filter(b =>
            b.roomId === formData.roomId &&
            b.startTime >= selectedDayStart &&
            b.startTime <= selectedDayEnd &&
            b.id !== booking?.id // Exclude the booking being edited
        );
    
        // Generate time slots from 8 AM to 6 PM (18:00)
        const slots = [];
        for (let hour = 8; hour < 18; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const slotTime = new Date(formData.date);
                slotTime.setHours(hour, minute, 0, 0);
    
                const slotEndTime = new Date(slotTime);
                slotEndTime.setMinutes(slotTime.getMinutes() + 30);
    
                const bookingInSlot = bookingsForDay.find(b =>
                    slotTime < b.endTime && slotEndTime > b.startTime
                );
                
                slots.push({
                    time: slotTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                    date: slotTime,
                    booking: bookingInSlot || null,
                });
            }
        }
        return slots;
    }, [formData.roomId, formData.date, bookings, booking]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (newDate: Date) => {
       setFormData(prev => ({ ...prev, date: newDate }));
    };
    
    const handleSlotClick = (date: Date) => {
        const startTimeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        const endTime = new Date(date);
        endTime.setHours(date.getHours() + 1);
        const endTimeStr = endTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

        setFormData(prev => ({
            ...prev,
            startTime: startTimeStr,
            endTime: endTimeStr,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (durationError) return;

        const [startHour, startMinute] = formData.startTime.split(':').map(Number);
        const [endHour, endMinute] = formData.endTime.split(':').map(Number);
        
        const startDate = new Date(formData.date);
        startDate.setHours(startHour, startMinute, 0, 0);

        const endDate = new Date(formData.date);
        endDate.setHours(endHour, endMinute, 0, 0);
        
        if (endDate <= startDate) {
            return;
        }

        const bookingData = {
            title: formData.title,
            roomId: formData.roomId,
            startTime: startDate,
            endTime: endDate,
        };

        let success = false;
        if (booking) {
            success = await updateBooking({ ...bookingData, id: booking.id });
        } else {
            success = await addBooking(bookingData);
        }

        if (success) {
            onClose();
        }
    };
    
    const selectedRoom = rooms.find(r => r.id === formData.roomId);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">{booking ? t('editBooking') : t('addBooking')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-1">{t('title')}</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border dark:border-gray-600 rounded text-gray-900 dark:text-white bg-white dark:bg-gray-700" required />
                    </div>
                    
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-1">{t('roomName')}</label>
                        <select name="roomId" value={formData.roomId} onChange={handleChange} className="w-full p-2 border dark:border-gray-600 rounded text-gray-900 dark:text-white bg-white dark:bg-gray-700" required>
                            <option value="" disabled>{t('selectRoom')}</option>
                            {rooms.map(room => (
                                <option key={room.id} value={room.id}>{room.name}</option>
                            ))}
                        </select>
                        {selectedRoom && selectedRoom.photoUrl && (
                            <div className="mt-4">
                                <img src={selectedRoom.photoUrl} alt={selectedRoom.name} className="w-full h-48 object-cover rounded-lg" />
                            </div>
                        )}
                    </div>

                    {dailySchedule && (
                        <div className="mt-4">
                            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">{t('dailySchedule')}</label>
                            <div className="flex overflow-x-auto space-x-1 border dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-900/50 scrollbar-thin">
                                {dailySchedule.map(slot => {
                                    const isBooked = !!slot.booking;
                                    return (
                                        <button
                                            type="button"
                                            key={slot.time}
                                            onClick={() => !isBooked && handleSlotClick(slot.date)}
                                            disabled={isBooked}
                                            className={`flex-shrink-0 w-24 text-center p-2 rounded-md transition-colors ${
                                                isBooked
                                                    ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 cursor-not-allowed'
                                                    : 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/80'
                                            }`}
                                            title={isBooked ? slot.booking?.title : `Book at ${slot.time}`}
                                        >
                                            <p className="font-semibold text-sm">{slot.time}</p>
                                            {isBooked && <p className="text-xs truncate">{slot.booking?.title}</p>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}


                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                            <label className="block text-gray-700 dark:text-gray-300 mb-1">{t('date')}</label>
                            <DatePicker selected={formData.date} onChange={handleDateChange} />
                        </div>
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 mb-1">{t('startTime')}</label>
                            <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full p-2 border dark:border-gray-600 rounded text-gray-900 dark:text-white bg-white dark:bg-gray-700" required step="1800" />
                        </div>
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 mb-1">{t('endTime')}</label>
                            <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="w-full p-2 border dark:border-gray-600 rounded text-gray-900 dark:text-white bg-white dark:bg-gray-700" required step="1800" />
                        </div>
                        {durationError && <p className="text-red-600 text-sm mt-1 md:col-span-3">{durationError}</p>}
                    </div>
                    
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">{t('cancel')}</button>
                        <button 
                            type="submit" 
                            disabled={!!durationError}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {booking ? t('save') : t('addBooking')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingModal;