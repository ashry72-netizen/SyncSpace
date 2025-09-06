import React from 'react';
import { useApp } from '../context/AppContext';
import Icon from './Icon';
import UserProfile from './UserProfile';

interface HeaderProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
    const { t, hasPermission, language } = useApp();

    const navItems = [
        { id: 'dashboard', label: t('dashboard'), icon: 'dashboard', permission: true },
        { id: 'calendar', label: t('calendar'), icon: 'calendar', permission: true },
        { id: 'my-bookings', label: t('myBookings'), icon: 'calendar-check', permission: true },
        { id: 'rooms', label: t('rooms'), icon: 'rooms', permission: hasPermission('manageRooms') },
        { id: 'settings', label: t('settings'), icon: 'settings', permission: hasPermission('manageSettings') },
    ];
    
    const iconMargin = language === 'ar' ? 'ml-3' : 'mr-3';

    return (
        <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 shadow-md flex flex-col">
            <div className="h-16 flex items-center justify-center border-b dark:border-gray-700">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('appName')}</h1>
            </div>
            <nav className="flex-1 p-4">
                <ul>
                    {navItems.map(item => item.permission && (
                        <li key={item.id}>
                            <button
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center p-3 my-1 rounded-lg transition-colors ${
                                    activeTab === item.id 
                                        ? 'bg-blue-500 text-white' 
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                            >
                                <Icon name={item.icon} className={`w-6 h-6 ${iconMargin}`} />
                                <span>{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="p-4 border-t dark:border-gray-700">
                <UserProfile setActiveTab={setActiveTab} />
            </div>
        </aside>
    );
};

export default Header;