import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import Icon from './Icon';

interface DatePickerProps {
    selected: Date | null;
    onChange: (date: Date) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ selected, onChange }) => {
    const { language } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const [displayDate, setDisplayDate] = useState(selected || new Date());
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const formatDate = (date: Date | null) => {
        if (!date) return 'Select a date';
        return date.toLocaleDateString(language, { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const startOfMonth = new Date(displayDate.getFullYear(), displayDate.getMonth(), 1);
    const endOfMonth = new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 0);
    
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const endDate = new Date(endOfMonth);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    const dates: Date[] = [];
    let date = new Date(startDate);
    while (date <= endDate) {
        dates.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }
    
    const weekdays = [...Array(7).keys()].map(i => {
        const d = new Date(2024, 0, i + 1);
        return d.toLocaleDateString(language, { weekday: 'short' });
    });

    const handleSelectDate = (day: Date) => {
        onChange(day);
        setIsOpen(false);
    };
    
    const handlePrevMonth = () => setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() - 1, 1));
    const handleNextMonth = () => setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 1));

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-2 border dark:border-gray-600 rounded text-left flex justify-between items-center bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
                <span>{formatDate(selected)}</span>
                <Icon name="calendar" className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 w-72 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-10 border dark:border-gray-600">
                    <div className="flex justify-between items-center mb-2">
                        <button type="button" onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                           <Icon name="chevronLeft" className="w-5 h-5" />
                        </button>
                        <span className="font-semibold text-sm dark:text-gray-200">
                            {displayDate.toLocaleDateString(language, { month: 'long', year: 'numeric' })}
                        </span>
                        <button type="button" onClick={handleNextMonth} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                           <Icon name="chevronRight" className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center">
                        {weekdays.map(day => <div key={day} className="text-xs font-bold text-gray-500 dark:text-gray-400">{day}</div>)}
                        {dates.map((day, index) => {
                            const isSelected = selected && day.toDateString() === selected.toDateString();
                            const isCurrentMonth = day.getMonth() === displayDate.getMonth();
                            const isToday = day.toDateString() === new Date().toDateString();

                            return (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => handleSelectDate(day)}
                                    className={`w-8 h-8 rounded-full text-sm flex items-center justify-center 
                                        ${!isCurrentMonth ? 'text-gray-300 dark:text-gray-600' : 'text-gray-800 dark:text-gray-200'}
                                        ${isToday ? 'border border-blue-500' : ''}
                                        ${isSelected ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
                                    `}
                                >
                                    {day.getDate()}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatePicker;