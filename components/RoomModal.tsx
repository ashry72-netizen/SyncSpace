import React, { useState, useEffect } from 'react';
import type { Room } from '../types';
import { useApp } from '../context/AppContext';

interface RoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    room?: Room;
}

const RoomModal: React.FC<RoomModalProps> = ({ isOpen, onClose, room }) => {
    const { addRoom, updateRoom, t } = useApp();
    const [name, setName] = useState('');
    const [capacity, setCapacity] = useState(0);
    const [amenities, setAmenities] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');

    useEffect(() => {
        if (room) {
            setName(room.name);
            setCapacity(room.capacity);
            setAmenities(room.amenities.join(', '));
            setPhotoUrl(room.photoUrl);
        } else {
            setName('');
            setCapacity(4);
            setAmenities('');
            setPhotoUrl('');
        }
    }, [room, isOpen]);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const roomData = {
            name,
            capacity: Number(capacity) || 0,
            amenities: amenities.split(',').map(a => a.trim()).filter(Boolean),
            photoUrl,
        };

        if (room) {
            updateRoom({ ...roomData, id: room.id });
        } else {
            addRoom(roomData);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">{room ? t('editRoom') : t('addRoom')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Improved Photo Upload Section */}
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">{t('photo')}</label>
                        <input 
                            type="file"
                            id="file-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <label
                            htmlFor="file-upload"
                            className="cursor-pointer group"
                        >
                            {photoUrl ? (
                                <div className="relative">
                                    <img src={photoUrl} alt="Room preview" className="w-full h-48 object-cover rounded-md bg-gray-100 dark:bg-gray-700" />
                                     <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-opacity">
                                        <p className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity">{t('uploadPhoto')}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-48 bg-gray-50 dark:bg-gray-700/50 rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="mt-2 text-sm font-medium">{t('uploadPhoto')}</span>
                                </div>
                            )}
                        </label>
                    </div>

                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">{t('roomName')}</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border dark:border-gray-600 rounded text-gray-900 dark:text-white bg-white dark:bg-gray-700" required />
                    </div>
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">{t('capacity')}</label>
                        <input type="number" value={capacity} onChange={e => setCapacity(parseInt(e.target.value, 10))} className="w-full p-2 border dark:border-gray-600 rounded text-gray-900 dark:text-white bg-white dark:bg-gray-700" required min="1" />
                    </div>
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">{t('amenities')}</label>
                        <input type="text" value={amenities} onChange={e => setAmenities(e.target.value)} className="w-full p-2 border dark:border-gray-600 rounded text-gray-900 dark:text-white bg-white dark:bg-gray-700" placeholder="e.g. Projector, Whiteboard" />
                    </div>
                    
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">{t('cancel')}</button>
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">{room ? t('save') : t('addRoom')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RoomModal;