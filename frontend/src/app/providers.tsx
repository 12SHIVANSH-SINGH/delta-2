'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#f0f9ff',
                        color: '#1e40af',
                        border: '1px solid #bfdbfe',
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
