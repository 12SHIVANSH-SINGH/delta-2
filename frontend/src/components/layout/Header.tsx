'use client';

import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { MoonIcon, SunIcon, BellIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

export default function Header() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [hasNotifications, setHasNotifications] = useState(false);

    // Simulating notifications for demo
    useEffect(() => {
        // Only run on client
        setMounted(true);

        // Simulate notification after 5 seconds
        const timer = setTimeout(() => {
            setHasNotifications(true);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    if (!mounted) return null;

    return (
<header className="bg-white dark:bg-black-900 shadow-md h-16 flex items-center justify-between px-6 border-b border-gray-300">

            <div className="flex items-center">
                <h1 className="text-xl font-semibold text-black">Traffic Management System</h1>
            </div>

            <div className="flex items-center space-x-4">
                {/* Theme toggle */}
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="p-2 rounded-full text-white-300 hover:bg-white-700 focus:outline-none focus:ring-2 focus:ring-white-700"
                    aria-label="Toggle theme"
                >
                    {theme === 'light' ? (
                        <MoonIcon className="h-5 w-5" />
                    ) : (
                        <SunIcon className="h-5 w-5" />
                    )}
                </button>

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="p-2 rounded-full text-white-300 hover:bg-grey-700 focus:outline-none focus:ring-2 focus:ring-white-700"
                        aria-label="Notifications"
                    >
                        <BellIcon className="h-5 w-5" />
                        {hasNotifications && (
                            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white-800 rounded-lg shadow-lg py-2 z-10 text-sm text-white-200 border border-white-700">
                            {hasNotifications ? (
                                <div className="px-4 py-2 hover:bg-white-700">
                                    <div className="font-medium">Emergency vehicle detected</div>
                                    <div className="text-white-400 text-xs">North lane - 2 minutes ago</div>
                                </div>
                            ) : (
                                <div className="px-4 py-2 text-white-400">No new notifications</div>
                            )}
                        </div>
                    )}
                </div>

                {/* User profile placeholder */}
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white">
                        A
                    </div>
                    <span className="text-sm font-medium text-white-300 hidden md:block">Admin</span>
                </div>
            </div>
        </header>
    );
}