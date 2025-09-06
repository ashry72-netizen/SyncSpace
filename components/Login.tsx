// Fix: Implement the Login component to resolve module errors and provide a functional UI.
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Icon from './Icon';

const Login: React.FC = () => {
    const { login, t, theme, setTheme } = useApp();
    const [username, setUsername] = useState('Sam Wilson'); // Pre-fill for demo purposes
    const [password, setPassword] = useState('password'); // Pre-fill for demo purposes
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const success = await login(username, password);
        if (!success) {
            setError(t('loginError'));
        }
        setIsLoading(false);
    };

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <div className="absolute top-4 right-4">
                <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">
                    {theme === 'light' ? 
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> : 
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    }
                </button>
            </div>
            <div className="w-full max-w-sm p-8 m-4 space-y-6 bg-white rounded-xl shadow-lg dark:bg-gray-800">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t('appName')}</h1>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">{t('loginPrompt')}</p>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('username')}
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            autoComplete="username"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-3 py-2 mt-1 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('password')}
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 mt-1 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    {error && (
                         <div className="flex items-center justify-center p-2 text-sm text-center text-red-700 bg-red-100 rounded-md dark:bg-red-900/50 dark:text-red-300">
                            <Icon name="error" className="w-4 h-4 mr-2" />
                            {error}
                        </div>
                    )}
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center px-4 py-2 font-semibold text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? '...' : t('login')}
                        </button>
                    </div>
                </form>
                <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                    <p>Use 'Alex Johnson', 'Maria Garcia', or 'Sam Wilson'.</p>
                    <p>Password can be anything.</p>
                </div>
            </div>
            <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                <p>&copy; {new Date().getFullYear()} Real Group. All Rights Reserved.</p>
            </footer>
        </div>
    );
};

export default Login;