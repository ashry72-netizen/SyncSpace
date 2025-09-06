import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Role } from '../types';
import UserModal from './UserModal';
import RoleModal from './RoleModal';
import Icon from './Icon';
import ConfirmationModal from './ConfirmationModal';

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

const Settings: React.FC = () => {
    const { currentUser, users, roles, deleteUser, updateUserRole, hasPermission, t } = useApp();
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | undefined>(undefined);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);

    if (!hasPermission('manageSettings')) {
        return <AccessDenied />;
    }

    const handleAddNewUser = () => {
        setIsUserModalOpen(true);
    };

    const handleDeleteUser = (userId: string) => {
        setUserToDelete(userId);
        setConfirmModalOpen(true);
    };
    
    const confirmDeleteUser = () => {
        if (userToDelete) {
            deleteUser(userToDelete);
        }
        setUserToDelete(null);
    };

    const handleRoleChange = (userId: string, newRoleId: string) => {
        updateUserRole(userId, newRoleId);
    }

    const handleEditRole = (role: Role) => {
        setSelectedRole(role);
        setIsRoleModalOpen(true);
    };
    
    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">{t('settingsTitle')}</h2>
            
            <div className="space-y-8">
                {/* User Management Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">{t('userManagement')}</h3>
                        <button 
                            onClick={handleAddNewUser} 
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 flex items-center"
                        >
                            <Icon name="plus" className="w-4 h-4 mr-2" />
                            {t('addUser')}
                        </button>
                    </div>
                    <div className="space-y-2 divide-y dark:divide-gray-700">
                        {users.map(user => (
                            <div key={user.id} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                                <div>
                                    <p className="text-gray-800 dark:text-gray-200 font-medium">{user.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="relative">
                                        <select 
                                            value={user.roleId} 
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            disabled={user.id === currentUser?.id}
                                            className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 pl-3 pr-8 py-1 rounded-md text-sm appearance-none disabled:opacity-50 disabled:cursor-not-allowed border dark:border-gray-600"
                                        >
                                            {roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                                        </select>
                                        <Icon name="chevronDown" className="w-4 h-4 text-gray-500 dark:text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteUser(user.id)} 
                                        disabled={user.id === currentUser?.id}
                                        className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50 disabled:hover:text-gray-400 disabled:cursor-not-allowed"
                                    >
                                        <Icon name="delete" className="w-5 h-5"/>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Role Management Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                         <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">{t('roleManagement')}</h3>
                    </div>
                     <div className="space-y-2 divide-y dark:divide-gray-700">
                        {roles.map(role => (
                            <div key={role.id} className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                                <div className="flex-1 pr-4">
                                    <p className="font-semibold text-gray-800 dark:text-gray-100">{role.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{role.permissions.join(', ') || 'No permissions'}</p>
                                </div>
                                <button 
                                    onClick={() => handleEditRole(role)}
                                    disabled={role.name === 'Admin'}
                                    className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Icon name="edit" className="w-5 h-5"/>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {isUserModalOpen && <UserModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} />}
            {isRoleModalOpen && <RoleModal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} role={selectedRole} />}
            {confirmModalOpen && (
                <ConfirmationModal
                    isOpen={confirmModalOpen}
                    onClose={() => setConfirmModalOpen(false)}
                    onConfirm={confirmDeleteUser}
                    title={t('deleteUserTitle')}
                    message={t('deleteUserConfirm')}
                />
            )}
        </div>
    );
};

export default Settings;