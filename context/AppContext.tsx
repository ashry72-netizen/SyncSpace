import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { USERS, ROOMS, BOOKINGS, ROLES, TRANSLATIONS } from '../constants';
import type { User, Room, Booking, Role, Permission, Language, NotificationData } from '../types';
import { sendBookingConfirmationEmail, sendBookingUpdateEmail, sendBookingCancellationEmail } from '../utils/emailService';


// --- Context Setup ---

type TranslationKey = keyof typeof TRANSLATIONS['en'];
type Theme = 'light' | 'dark';

interface AppContextType {
    isAuthenticated: boolean;
    currentUser: User | null;
    users: User[];
    rooms: Room[];
    bookings: Booking[];
    roles: Role[];
    language: Language;
    notification: NotificationData | null;
    theme: Theme;
    t: (key: TranslationKey) => string;
    login: (username: string, password?: string) => Promise<boolean>;
    logout: () => void;
    hasPermission: (permission: Permission) => boolean;
    setLanguage: (lang: Language) => void;
    setTheme: (theme: Theme) => void;
    // Actions
    addBooking: (booking: Omit<Booking, 'id' | 'userId'>) => Promise<boolean>;
    updateBooking: (booking: Omit<Booking, 'userId'>) => Promise<boolean>;
    deleteBooking: (bookingId: string) => Promise<void>;
    addRoom: (room: Omit<Room, 'id'>) => Promise<void>;
    updateRoom: (room: Room) => Promise<void>;
    deleteRoom: (roomId: string) => Promise<void>;
    addUser: (user: Omit<User, 'id'>) => Promise<void>;
    deleteUser: (userId: string) => Promise<void>;
    updateUserRole: (userId: string, roleId: string) => Promise<void>;
    updateRolePermissions: (roleId: string, permissions: Permission[]) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // State management with useState, replacing useReducer for async simulation
    const [users, setUsers] = useState<User[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [language, setLanguage] = useState<Language>('en');
    const [notification, setNotification] = useState<NotificationData | null>(null);
    const [theme, setTheme] = useState<Theme>(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'dark' || storedTheme === 'light') {
            return storedTheme;
        }
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    });
    
    // Simulate fetching initial data on component mount
    useEffect(() => {
        setUsers(USERS);
        setRooms(ROOMS);
        const sortedBookings = BOOKINGS.sort((a,b) => a.startTime.getTime() - b.startTime.getTime());
        setBookings(sortedBookings);
        setRoles(ROLES);
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const t = useCallback((key: TranslationKey): string => {
        return TRANSLATIONS[language][key] || key;
    }, [language]);
    
    const showNotification = useCallback((messageKey: TranslationKey, type: NotificationData['type']) => {
        setNotification({ message: t(messageKey), type });
        setTimeout(() => setNotification(null), 3000);
    }, [t]);

    const login = useCallback(async (username: string, password?: string): Promise<boolean> => {
        // In a real app: const user = await api.login(username, password);
        const user = users.find(u => u.name.toLowerCase() === username.trim().toLowerCase());
        if (user && password) { // Password check is simulated
            setCurrentUser(user);
            setIsAuthenticated(true);
            return true;
        }
        return false;
    }, [users]);

    const logout = useCallback(() => {
        setCurrentUser(null);
        setIsAuthenticated(false);
    }, []);

    const hasPermission = useCallback((permission: Permission): boolean => {
        if (!currentUser) return false;
        const userRole = roles.find(r => r.id === currentUser.roleId);
        return userRole?.permissions.includes(permission) || false;
    }, [currentUser, roles]);
    
    const addBooking = useCallback(async (bookingData: Omit<Booking, 'id' | 'userId'>): Promise<boolean> => {
        if (!currentUser) return false;
        
        // In a real app, this conflict check would be done by the backend
        const conflict = bookings.some(b => 
            b.roomId === bookingData.roomId &&
            (bookingData.startTime < b.endTime && bookingData.endTime > b.startTime)
        );
        if (conflict) {
            showNotification('bookingConflict', 'error');
            return false;
        }
        
        // In a real app: const newBooking = await api.createBooking(bookingData);
        const newBooking: Booking = { ...bookingData, id: String(Date.now()), userId: currentUser.id };
        setBookings(prev => [...prev, newBooking].sort((a, b) => a.startTime.getTime() - b.startTime.getTime()));
        
        showNotification('bookingAdded', 'success');
        sendBookingConfirmationEmail(newBooking, users, rooms);
        return true;
    }, [currentUser, bookings, users, rooms, showNotification]);

    const updateBooking = useCallback(async (bookingData: Omit<Booking, 'userId'>): Promise<boolean> => {
        const originalBooking = bookings.find(b => b.id === bookingData.id);
        if (!originalBooking) return false;

        const conflict = bookings.some(b => 
            b.id !== bookingData.id &&
            b.roomId === bookingData.roomId &&
            (bookingData.startTime < b.endTime && bookingData.endTime > b.startTime)
        );
        if (conflict) {
            showNotification('bookingConflict', 'error');
            return false;
        }
        
        // In a real app: const updatedBooking = await api.updateBooking(bookingData.id, bookingData);
        setBookings(prev => prev.map(b => b.id === bookingData.id ? { ...b, ...bookingData } : b));
        showNotification('bookingUpdated', 'success');
        
        const fullyUpdatedBooking: Booking = { ...originalBooking, ...bookingData };
        sendBookingUpdateEmail(fullyUpdatedBooking, users, rooms);
        return true;
    }, [bookings, users, rooms, showNotification]);

    const deleteBooking = useCallback(async (bookingId: string) => {
        // In a real app: await api.deleteBooking(bookingId);
        const bookingToDelete = bookings.find(b => b.id === bookingId);
        setBookings(prev => prev.filter(b => b.id !== bookingId));
        showNotification('bookingDeleted', 'success');

        if (bookingToDelete) {
            sendBookingCancellationEmail(bookingToDelete, users, rooms);
        }
    }, [bookings, users, rooms, showNotification]);
    
    const addRoom = useCallback(async (roomData: Omit<Room, 'id'>) => {
        // In a real app: const newRoom = await api.addRoom(roomData);
        const newRoom: Room = { ...roomData, id: String(Date.now()) };
        setRooms(prev => [...prev, newRoom]);
        showNotification('roomAdded', 'success');
    }, [showNotification]);
    
    const updateRoom = useCallback(async (roomData: Room) => {
        // In a real app: const updatedRoom = await api.updateRoom(roomData.id, roomData);
        setRooms(prev => prev.map(r => r.id === roomData.id ? roomData : r));
        showNotification('roomUpdated', 'success');
    }, [showNotification]);
    
    const deleteRoom = useCallback(async (roomId: string) => {
        // In a real app: await api.deleteRoom(roomId);
        setRooms(prev => prev.filter(r => r.id !== roomId));
        setBookings(prev => prev.filter(b => b.roomId !== roomId));
        showNotification('roomDeleted', 'success');
    }, [showNotification]);

    const addUser = useCallback(async (userData: Omit<User, 'id'>) => {
        // In a real app: const newUser = await api.addUser(userData);
        const newUser: User = { ...userData, id: String(Date.now()) };
        setUsers(prev => [...prev, newUser]);
        showNotification('userAdded', 'success');
    }, [showNotification]);

    const deleteUser = useCallback(async (userId: string) => {
        // In a real app: await api.deleteUser(userId);
        setUsers(prev => prev.filter(u => u.id !== userId));
        setBookings(prev => prev.filter(b => b.userId !== userId));
        showNotification('userDeleted', 'success');
    }, [showNotification]);
    
    const updateUserRole = useCallback(async (userId: string, roleId: string) => {
        // In a real app: await api.updateUserRole(userId, roleId);
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, roleId: roleId } : u));
        showNotification('roleUpdated', 'success');
    }, [showNotification]);

    const updateRolePermissions = useCallback(async (roleId: string, permissions: Permission[]) => {
        // In a real app: await api.updateRolePermissions(roleId, permissions);
        setRoles(prev => prev.map(r => r.id === roleId ? { ...r, permissions: permissions } : r));
        showNotification('permissionsUpdated', 'success');
    }, [showNotification]);
    
    const value: AppContextType = useMemo(() => ({
        isAuthenticated,
        currentUser,
        users,
        rooms,
        bookings,
        roles,
        language,
        notification,
        theme,
        t: (key: TranslationKey) => TRANSLATIONS[language][key] || key,
        login,
        logout,
        hasPermission,
        setLanguage,
        setTheme,
        addBooking,
        updateBooking,
        deleteBooking,
        addRoom,
        updateRoom,
        deleteRoom,
        addUser,
        deleteUser,
        updateUserRole,
        updateRolePermissions,
    }), [
        isAuthenticated, currentUser, users, rooms, bookings, roles, language, notification, theme,
        t, login, logout, hasPermission, setLanguage, setTheme,
        addBooking, updateBooking, deleteBooking,
        addRoom, updateRoom, deleteRoom, 
        addUser, deleteUser, updateUserRole, updateRolePermissions
    ]);

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
