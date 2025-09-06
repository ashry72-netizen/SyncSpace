import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import type { Booking } from '../types';
import BookingModal from './BookingModal';
import ConfirmationModal from './ConfirmationModal';
import Icon from './Icon';

interface ProfilePageProps {
    activeTab: string;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ activeTab }) => {
    const { currentUser, bookings, rooms, roles, deleteBooking, t, language } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | undefined>(undefined);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
    
    const isMyBookingsView = activeTab === 'my-bookings';

    const userRole = useMemo(() => roles.find(r => r.id === currentUser?.roleId), [roles, currentUser]);
    
    const myBookings = useMemo(() => {
        const userBookings = bookings.filter(b => b.userId === currentUser?.id);
        const filteredBookings = isMyBookingsView ? userBookings : userBookings.filter(b => b.startTime >= new Date());
        
        return filteredBookings.sort((a, b) => {
            // For 'My Bookings', show most recent first (past or future).
            // For 'Profile' (upcoming), show soonest first.
            return isMyBookingsView
                ? b.startTime.getTime() - a.startTime.getTime()
                : a.startTime.getTime() - b.startTime.getTime();
        });
    }, [bookings, currentUser, isMyBookingsView]);

    const totalUserBookings = useMemo(() => bookings.filter(b => b.userId === currentUser?.id).length, [bookings, currentUser]);

    const handleEditBooking = (booking: Booking) => {
        setSelectedBooking(booking);
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

    const getRoomName = (roomId: string) => rooms.find(r => r.id === roomId)?.name || 'Unknown Room';

    if (!currentUser) return null;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{isMyBookingsView ? t('myBookings') : t('profile')}</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{isMyBookingsView ? t('myBookingsMessage') : t('profileMessage')}</p>
            </div>

            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center space-x-6">
                <div className="w-24 h-24 rounded-full bg-blue-500 text-white flex items-center justify-center text-4xl font-bold flex-shrink-0">
                    {currentUser.name.charAt(0)}
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{currentUser.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{userRole?.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">{currentUser.email}</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Bookings List */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                     <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">{isMyBookingsView ? t('myBookings') : t('myUpcomingBookings')}</h3>
                    {myBookings.length > 0 ? (
                        <ul className="space-y-3 max-h-96 overflow-y-auto pr-2 divide-y dark:divide-gray-700">
                            {myBookings.map(booking => (
                                <li key={booking.id} className={`p-3 first:pt-0 flex justify-between items-center ${booking.endTime < new Date() ? 'opacity-60' : ''}`}>
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-100">{booking.title}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{getRoomName(booking.roomId)}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500">{booking.startTime.toLocaleString(language)}</p>
                                    </div>
                                    <div className="flex space-x-1">
                                        <button onClick={() => handleEditBooking(booking)} className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><Icon name="edit" className="w-4 h-4"/></button>
                                        <button onClick={() => handleDelete(booking.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><Icon name="delete" className="w-4 h-4"/></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">{isMyBookingsView ? t('noBookings') : t('noUpcomingBookings')}</p>
                    )}
                </div>

                {/* Stats Card */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                         <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">{t('myStats')}</h3>
                        <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                            <Icon name="calendar-check" className="w-8 h-8 text-blue-500 mr-4"/>
                            <div>
                                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{totalUserBookings}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('totalBookings')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {isModalOpen && (
                <BookingModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    booking={selectedBooking}
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

export default ProfilePage;