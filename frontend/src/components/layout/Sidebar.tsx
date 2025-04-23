'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    ChartBarIcon,
    CogIcon,
    HomeIcon,
    SignalIcon,
    VideoCameraIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';

const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Traffic Signals', href: '/signals', icon: SignalIcon },
    { name: 'Video Analysis', href: '/video', icon: VideoCameraIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: 'Settings', href: '/settings', icon: CogIcon },
    { name: 'System Status', href: '/status', icon: InformationCircleIcon },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className={cn(
                "h-screen bg-gray-900 text-white transition-all duration-300 flex flex-col",
                collapsed ? "w-16" : "w-64"
            )}
        >
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
                {!collapsed && (
                    <h1 className="text-xl font-semibold truncate">Traffic Management</h1>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1 rounded-md hover:bg-gray-800"
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        {collapsed ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        )}
                    </svg>
                </button>
            </div>

            <nav className="flex-1 py-4 overflow-y-auto">
                <ul className="space-y-1 px-2">
                    {navigation.map((item) => (
                        <li key={item.name}>
                            <Link
                                href={item.href}
                                className={cn(
                                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                                    pathname === item.href
                                        ? "bg-primary-700 text-white"
                                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5 flex-shrink-0",
                                    pathname === item.href ? "text-white" : "text-gray-400"
                                )} />
                                {!collapsed && (
                                    <span className="ml-3 truncate">{item.name}</span>
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="p-4 border-t border-gray-800">
                <div className={cn("flex items-center", collapsed ? "justify-center" : "")}>
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    {!collapsed && <span className="ml-2 text-sm text-gray-300">System active</span>}
                </div>
            </div>
        </aside>
    );
}