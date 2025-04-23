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
        <header className="bg-gray-900 border-b border-gray-800 h-16 flex items-center justify-between px-6">
            <div className="flex items-center">
                <h1 className="text-xl font-semibold text-white">Traffic Management System</h1>
            </div>

            <div className="flex items-center space-x-4">
                {/* Theme toggle */}
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="p-2 rounded-full text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-700"
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
                        className="p-2 rounded-full text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-700"
                        aria-label="Notifications"
                    >
                        <BellIcon className="h-5 w-5" />
                        {hasNotifications && (
                            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-lg py-2 z-10 text-sm text-gray-200 border border-gray-700">
                            {hasNotifications ? (
                                <div className="px-4 py-2 hover:bg-gray-700">
                                    <div className="font-medium">Emergency vehicle detected</div>
                                    <div className="text-gray-400 text-xs">North lane - 2 minutes ago</div>
                                </div>
                            ) : (
                                <div className="px-4 py-2 text-gray-400">No new notifications</div>
                            )}
                        </div>
                    )}
                </div>

                {/* User profile placeholder */}
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white">
                        A
                    </div>
                    <span className="text-sm font-medium text-gray-300 hidden md:block">Admin</span>
                </div>
            </div>
        </header>
    );
}