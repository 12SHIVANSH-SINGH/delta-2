'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#1f2937',
                        color: '#e5e7eb',
                        border: '1px solid #374151',
                    },
                    success: {
                        icon: '✅',
                        style: {
                            borderLeft: '4px solid #10b981',
                        },
                    },
                    error: {
                        icon: '❌',
                        style: {
                            borderLeft: '4px solid #ef4444',
                        },
                    },
                }}
            />
            {children}
        </ThemeProvider>
    );
}