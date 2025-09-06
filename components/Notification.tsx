import React from 'react';
import { useApp } from '../context/AppContext';
import Icon from './Icon';

const Notification: React.FC = () => {
    const { notification, language } = useApp();

    if (!notification) return null;

    const { message, type } = notification;

    const themeStyles = {
        success: 'bg-green-100 dark:bg-green-900/50 border-green-400 dark:border-green-600 text-green-700 dark:text-green-300',
        error: 'bg-red-100 dark:bg-red-900/50 border-red-400 dark:border-red-600 text-red-700 dark:text-red-300',
        info: 'bg-blue-100 dark:bg-blue-900/50 border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-300',
    };

    const iconName = {
        success: 'check',
        error: 'error',
        info: 'info',
    }[type];

    const position = language === 'ar' ? 'left-5' : 'right-5';
    const iconMargin = language === 'ar' ? 'ml-4' : 'mr-4';

    return (
        <div className={`fixed top-5 ${position} z-50 p-4 border-l-4 rounded-lg shadow-lg ${themeStyles[type]}`} role="alert">
            <div className="flex">
                <div className="py-1"><Icon name={iconName} className={`w-6 h-6 ${iconMargin}`}/></div>
                <div>
                    <p className="font-bold">{message}</p>
                </div>
            </div>
        </div>
    );
};

export default Notification;