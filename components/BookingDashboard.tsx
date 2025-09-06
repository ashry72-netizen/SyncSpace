import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import type { Booking } from '../types';
import BookingModal from './BookingModal';
import Icon from './Icon';
import ConfirmationModal from './ConfirmationModal';
import RoomTimeline from './RoomTimeline';

const BookingDashboard: React.FC = () => {
    const { currentUser, bookings, users, rooms, deleteBooking, t, language, hasPermission } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | undefined>(undefined);
    const [modalInitialData, setModalInitialData] = useState<{ date: Date | null, roomId: string | null }>({ date: null, roomId: null });
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const upcomingBookings = useMemo(() => bookings
        .filter(b => b.startTime >= new Date())
        .sort((a, b) => a.startTime.getTime() - b.startTime.getTime()), [bookings]);
    
    const displayedBookings = useMemo(() => hasPermission('viewAllBookings')
        ? upcomingBookings
        : upcomingBookings.filter(b => b.userId === currentUser?.id), [hasPermission, upcomingBookings, currentUser]);

    // Modal Handlers
    const handleSelectSlot = (startTime: Date, roomId: string) => {
        setSelectedBooking(undefined);
        setModalInitialData({ date: startTime, roomId });
        setIsModalOpen(true);
    };

    const handleSelectBooking = (booking: Booking) => {
        const canModify = hasPermission('manageRooms') || booking.userId === currentUser?.id;
        if (canModify) {
            setSelectedBooking(booking);
            setModalInitialData({ date: null, roomId: null });
            setIsModalOpen(true);
        }
    };
    
    const handleAddNew = () => {
        setSelectedBooking(undefined);
        // Use selectedDate for the modal, not necessarily new Date()
        setModalInitialData({ date: selectedDate, roomId: null });
        setIsModalOpen(true);
    }
    
    const handleEditUpcoming = (booking: Booking) => {
        setSelectedBooking(booking);
        setModalInitialData({ date: null, roomId: null });
        setIsModalOpen(true);
    };

    const handleDelete = (bookingId: string) => {
        setBookingToDelete(bookingId);
        setConfirmModalOpen(true);
    };
    
    const confirmDelete = () => {
        if (bookingToDelete) {
            deleteBooking(bookingToDelete);
        }
        setBookingToDelete(null);
    };

    // Date navigation
    const changeDate = (amount: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + amount);
        setSelectedDate(newDate);
    };

    const getRoomName = (roomId: string) => rooms.find(r => r.id === roomId)?.name || 'Unknown Room';
    const getUserName = (userId: string) => users.find(u => u.id === userId)?.name || 'Unknown User';
    
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Welcome back, {currentUser?.name}!</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Here's your snapshot for today.</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="bg-blue-500 text-white px-5 py-3 rounded-lg shadow-md hover:bg-blue-600 flex items-center font-semibold transition-transform transform hover:scale-105"
                >
                    <Icon name="plus" className="w-5 h-5 mr-2" />
                    {t('bookARoom')}
                </button>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Room Timelines */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-6 border-b dark:border-gray-700 pb-4">
                        <button onClick={() => changeDate(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-gray-600 dark:text-gray-300">
                            <Icon name="chevronLeft" className="w-5 h-5" />
                        </button>
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 text-center">{selectedDate.toLocaleDateString(language, { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
                        <button onClick={() => changeDate(1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-gray-600 dark:text-gray-300">
                            <Icon name="chevronRight" className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-8">
                        {rooms.map(room => (
                            <div key={room.id}>
                                <div className="flex items-center mb-3">
                                    <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100">{room.name}</h4>
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 ml-4 space-x-3">
                                        <span className="flex items-center"><Icon name="users" className="w-4 h-4 mr-1"/>{room.capacity}</span>
                                    </div>
                                </div>
                                <RoomTimeline 
                                    roomId={room.id} 
                                    date={selectedDate} 
                                    onSelectSlot={handleSelectSlot}
                                    onSelectBooking={handleSelectBooking}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Side Column */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                         <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">{t('upcomingBookings')}</h3>
                        {displayedBookings.length > 0 ? (
                            <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                {displayedBookings.map(booking => {
                                    const canModify = hasPermission('manageRooms') || booking.userId === currentUser?.id;
                                    return (
                                        <li key={booking.id} className="p-3 border dark:border-gray-700 rounded-lg flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold text-gray-800 dark:text-gray-100">{booking.title}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{getRoomName(booking.roomId)}</p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500">{booking.startTime.toLocaleString(language)}</p>
                                                 {hasPermission('viewAllBookings') && booking.userId !== currentUser?.id && (
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 italic">By: {getUserName(booking.userId)}</p>
                                                )}
                                            </div>
                                            {canModify && (
                                                <div className="flex space-x-1">
                                                    <button onClick={() => handleEditUpcoming(booking)} className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><Icon name="edit" className="w-4 h-4"/></button>
                                                    <button onClick={() => handleDelete(booking.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><Icon name="delete" className="w-4 h-4"/></button>
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-4">{t('noUpcomingBookings')}</p>
                        )}
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <BookingModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    booking={selectedBooking}
                    initialDate={modalInitialData.date}
                    initialRoomId={modalInitialData.roomId}
                />
            )}
            {confirmModalOpen && (
                <ConfirmationModal
                    isOpen={confirmModalOpen}
                    onClose={() => setConfirmModalOpen(false)}
                    onConfirm={confirmDelete}
                    title={t('deleteBookingTitle')}
                    message={t('deleteBookingConfirm')}
                />
            )}
        </div>
    );
};

export default BookingDashboard;