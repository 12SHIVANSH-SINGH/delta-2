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
                "h-screen bg-black-900 text-black transition-all duration-300 flex flex-col",
                collapsed ? "w-16" : "w-64"
            )}
        >
            <div className="flex items-center justify-between p-[15.5px] shadow-m border-r border-b border-gray-300">
  {!collapsed && (
    <div className="flex items-center justify-center space-x-2">
      {/* Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-gray-500"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.75 3v1.5m4.5-1.5V4.5m-9 4.125h13.5m-13.5 0A2.625 2.625 0 003 11.25v6.375A2.625 2.625 0 005.625 20.25h12.75A2.625 2.625 0 0021 17.625V11.25a2.625 2.625 0 00-2.625-2.625m-13.5 0V6.375A2.625 2.625 0 018.25 3.75h7.5a2.625 2.625 0 012.625 2.625V6.75"
        />
      </svg>
      {/* Title */}
      <h1 className="text-xl font-semibold text-black-200">TMS</h1>
    </div>
  )}

  {/* Hamburger Button */}
  <button
    onClick={() => setCollapsed(!collapsed)}
    className="p-1 rounded-md hover:bg-black-800 text-gray-500"
    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  </button>
</div>
            <nav className="flex-1 py-4 overflow-y-auto border-r border-gray-300">
  <ul className="space-y-1 px-2">
    {navigation.map((item) => {
      const isActive = pathname === item.href;

      return (
        <li key={item.name}>
          <Link
            href={item.href}
            className={cn(
              "flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors group",
              isActive
                ? "bg-primary-700 text-[rgb(29,78,216)]"
                : "text-gray-500 hover:text-[rgb(29,78,216)] hover:bg-black-800"
            )}
          >
            <item.icon
              className={cn(
                "h-6 w-6 flex-shrink-0 transition-colors duration-200",
                isActive
                  ? "text-[rgb(29,78,216)]"
                  : "text-gray-500 group-hover:text-[rgb(29,78,216)]"
              )}
            />
            {!collapsed && (
              <span className="ml-3 truncate">{item.name}</span>
            )}
          </Link>
        </li>
      );
    })}
  </ul>
</nav>




<div className="p-4 border-r border-t border-gray-300 ">
                <div className={cn("flex items-center", collapsed ? "justify-center" : "")}>
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    {!collapsed && <span className="ml-2 text-md text-gray-500">System active</span>}
                </div>
            </div>
        </aside>
    );
}