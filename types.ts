// Fix: Provide content for types.ts to define data structures used throughout the application.
export type Permission = 'manageRooms' | 'manageSettings' | 'viewAllBookings';

export interface Role {
    id: string;
    name: string;
    permissions: Permission[];
}

export interface User {
    id: string;
    name: string;
    email: string;
    roleId: string;
}

export interface Room {
    id: string;
    name: string;
    capacity: number;
    amenities: string[];
    photoUrl: string;
}

export interface Booking {
    id: string;
    userId: string;
    roomId: string;
    title: string;
    startTime: Date;
    endTime: Date;
}

export type Language = 'en' | 'ar';

export interface NotificationData {
    message: string;
    type: 'success' | 'error' | 'info';
}