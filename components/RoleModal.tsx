import React, { useState, useEffect } from 'react';
import type { Role, Permission } from '../types';
import { useApp } from '../context/AppContext';

interface RoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    role?: Role;
}

// A constant array of all possible permission strings, derived from the Permission type.
const ALL_PERMISSIONS: Permission[] = ['manageRooms', 'manageSettings', 'viewAllBookings'];

const RoleModal: React.FC<RoleModalProps> = ({ isOpen, onClose, role }) => {
    const { updateRolePermissions, t } = useApp();
    const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);

    useEffect(() => {
        if (role) {
            setSelectedPermissions(role.permissions);
        }
    }, [role, isOpen]);

    if (!isOpen || !role) return null;

    const handlePermissionChange = (permission: Permission) => {
        setSelectedPermissions(prev =>
            prev.includes(permission)
                ? prev.filter(p => p !== permission)
                : [...prev, permission]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateRolePermissions(role.id, selectedPermissions);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">{t('permissions')} for {role.name}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-6 space-y-2">
                        <p className="block text-gray-700 dark:text-gray-300 mb-2 font-semibold">{t('permissions')}</p>
                        {ALL_PERMISSIONS.map(permission => (
                            <label key={permission} className="flex items-center space-x-3 capitalize">
                                <input
                                    type="checkbox"
                                    checked={selectedPermissions.includes(permission)}
                                    onChange={() => handlePermissionChange(permission)}
                                    className="h-5 w-5 rounded border-gray-300 dark:border-gray-500 text-blue-600 focus:ring-blue-500 bg-gray-100 dark:bg-gray-700"
                                />
                                <span className="text-gray-700 dark:text-gray-200">{permission.replace(/([A-Z])/g, ' $1')}</span>
                            </label>
                        ))}
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">{t('cancel')}</button>
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">{t('save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RoleModal;