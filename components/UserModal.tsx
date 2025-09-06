import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose }) => {
    const { addUser, roles, t } = useApp();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [roleId, setRoleId] = useState(roles.find(r => r.name === 'User')?.id || roles[0]?.id || '');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && email && roleId) {
            addUser({ name, email, roleId });
            onClose();
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">{t('addUser')}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">{t('username')}</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border dark:border-gray-600 rounded text-gray-900 dark:text-white bg-white dark:bg-gray-700" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">{t('email')}</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border dark:border-gray-600 rounded text-gray-900 dark:text-white bg-white dark:bg-gray-700" required />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">{t('role')}</label>
                         <select value={roleId} onChange={(e) => setRoleId(e.target.value)} className="w-full p-2 border dark:border-gray-600 rounded text-gray-900 dark:text-white bg-white dark:bg-gray-700">
                            {roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">{t('cancel')}</button>
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">{t('addUser')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;