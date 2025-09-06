import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Icon from './Icon';
import type { Language } from '../types';

interface UserProfileProps {
    setActiveTab: (tab: string) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ setActiveTab }) => {
    const { currentUser, logout, t, language, setLanguage, theme, setTheme } = useApp();
    const [isOpen, setIsOpen] = useState(false);

    if (!currentUser) return null;
    
    const iconMargin = language === 'ar' ? 'ml-3' : 'mr-3';

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const handleViewProfile = () => {
        setActiveTab('profile');
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center ${iconMargin}`}>
                        {currentUser.name.charAt(0)}
                    </div>
                    <span className="font-semibold text-gray-700 dark:text-gray-200">{currentUser.name}</span>
                </div>
                <Icon name="chevronDown" className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute bottom-full mb-2 w-full bg-white dark:bg-gray-700 rounded-lg shadow-lg border dark:border-gray-600 py-1 divide-y dark:divide-gray-600">
                    <div className="py-1">
                         <button
                            onClick={handleViewProfile}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
                        >
                            <Icon name="user-circle" className={`w-5 h-5 ${iconMargin}`} />
                            {t('viewProfile')}
                        </button>
                    </div>
                    <div className="px-4 py-2">
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Language</p>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as Language)}
                            className="w-full mt-1 p-1 border rounded dark:bg-gray-600 dark:text-white dark:border-gray-500"
                        >
                            <option value="en">English</option>
                            <option value="ar">العربية (Arabic)</option>
                        </select>
                    </div>
                     <div className="px-4 py-3">
                         <label htmlFor="theme-toggle" className="flex items-center justify-between cursor-pointer">
                            <span className="text-sm text-gray-700 dark:text-gray-200">Dark Mode</span>
                            <div className="relative">
                                <input type="checkbox" id="theme-toggle" className="sr-only" checked={theme === 'dark'} onChange={toggleTheme} />
                                <div className="block bg-gray-200 dark:bg-gray-600 w-10 h-6 rounded-full"></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${theme === 'dark' ? 'translate-x-4' : ''}`}></div>
                            </div>
                        </label>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                        {t('logout')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserProfile;