import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Room, Booking } from '../types';
import RoomModal from './RoomModal';
import Icon from './Icon';
import ConfirmationModal from './ConfirmationModal';

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


const AccessDenied: React.FC = () => {
    const { t } = useApp();
    return (
        <div className="flex items-center justify-center h-full">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-red-600">{t('accessDenied')}</h2>
            </div>
        </div>
    );
}

const RoomManagement: React.FC = () => {
    const { rooms, bookings, users, deleteRoom, hasPermission, t, language } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<Room | undefined>(undefined);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [roomToDelete, setRoomToDelete] = useState<string | null>(null);

    if (!hasPermission('manageRooms')) {
        return <AccessDenied />;
    }

    const handleEdit = (room: Room) => {
        setSelectedRoom(room);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setSelectedRoom(undefined);
        setIsModalOpen(true);
    };

    const handleDelete = (roomId: string) => {
        setRoomToDelete(roomId);
        setConfirmModalOpen(true);
    };
    
    const confirmDelete = () => {
        if (roomToDelete) {
            deleteRoom(roomToDelete);
        }
        setRoomToDelete(null);
    };
    
    const getUserName = (userId: string) => users.find(u => u.id === userId)?.name || 'Unknown User';
    const iconMargin = language === 'ar' ? 'ml-2' : 'mr-2';

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t('manageRooms')}</h2>
                <button
                    onClick={handleAddNew}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 flex items-center font-semibold"
                >
                    <Icon name="plus" className={`w-5 h-5 ${iconMargin}`} />
                    {t('addRoom')}
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {rooms.map(room => {
                    const statusInfo = getRoomStatus(room.id, bookings);
                    
                    let statusConfig: { color: string; textClass: string; bgClass: string };
                    let statusText: string;
                    let relevantBooking: Booking | undefined;
                    const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };

                    switch (statusInfo.status) {
                        case 'Busy':
                            statusConfig = { color: 'bg-red-500', textClass: 'text-red-700 dark:text-red-400', bgClass: 'bg-red-100 dark:bg-red-900/50' };
                            statusText = t('roomStatusBusyUntil').replace('{time}', statusInfo.booking.endTime.toLocaleTimeString(language, timeOptions));
                            relevantBooking = statusInfo.booking;
                            break;
                        case 'Upcoming':
                            statusConfig = { color: 'bg-yellow-500', textClass: 'text-yellow-700 dark:text-yellow-400', bgClass: 'bg-yellow-100 dark:bg-yellow-900/50' };
                            statusText = t('roomStatusUpcomingAt').replace('{time}', statusInfo.booking.startTime.toLocaleTimeString(language, timeOptions));
                            relevantBooking = statusInfo.booking;
                            break;
                        case 'Available':
                        default:
                            statusConfig = { color: 'bg-green-500', textClass: 'text-green-700 dark:text-green-400', bgClass: 'bg-green-100 dark:bg-green-900/50' };
                            statusText = t('roomStatusAvailableAllDay');
                            break;
                    }

                    return (
                         <div key={room.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700 flex flex-col transition-shadow hover:shadow-lg">
                            <img src={room.photoUrl} alt={room.name} className="w-full h-40 object-cover rounded-t-lg" />
                            {/* Card Header */}
                            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-start">
                                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 pr-2">{room.name}</h3>
                                <div className="flex space-x-1 flex-shrink-0">
                                    <button onClick={() => handleEdit(room)} className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title="Edit Room"><Icon name="edit" className="w-5 h-5"/></button>
                                    <button onClick={() => handleDelete(room.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title="Delete Room"><Icon name="delete" className="w-5 h-5"/></button>
                                </div>
                            </div>
                            
                            {/* Card Body */}
                            <div className="p-4 space-y-4 flex-grow">
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgClass} ${statusConfig.textClass}`}>
                                    <span className={`w-2 h-2 rounded-full mr-2 ${statusConfig.color}`}></span>
                                    {statusText}
                                </div>
                                <div className="space-y-2 text-gray-600 dark:text-gray-300">
                                    <div className="flex items-center">
                                        <Icon name="users" className="w-5 h-5 mr-2 text-gray-400 dark:text-gray-500"/>
                                        <span>{t('capacity')}: {room.capacity}</span>
                                    </div>
                                    <div className="flex items-start">
                                        <Icon name="check-circle" className="w-5 h-5 mr-2 mt-0.5 text-gray-400 dark:text-gray-500 flex-shrink-0"/>
                                        <span>{t('amenities')}: {room.amenities.join(', ') || 'None'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer */}
                            {relevantBooking && (
                                <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg">
                                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{statusInfo.status === 'Busy' ? 'Current Meeting' : 'Next Meeting'}</h4>
                                    <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{relevantBooking.title}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {relevantBooking.startTime.toLocaleTimeString(language, timeOptions)} - {relevantBooking.endTime.toLocaleTimeString(language, timeOptions)}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">By: {getUserName(relevantBooking.userId)}</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {isModalOpen && (
                <RoomModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    room={selectedRoom}
                />
            )}
            {confirmModalOpen && (
                <ConfirmationModal
                    isOpen={confirmModalOpen}
                    onClose={() => setConfirmModalOpen(false)}
                    onConfirm={confirmDelete}
                    title={t('deleteRoomTitle')}
                    message={t('deleteRoomConfirm')}
                />
            )}
        </div>
    );
};

export default RoomManagement;