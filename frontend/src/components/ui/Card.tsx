import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { CameraIcon } from '@heroicons/react/24/outline';

interface CardProps {
    className?: string;
    children: ReactNode;
}

export function Card({ className, children }: CardProps) {
    return (
        <div className={cn(
            "bg-white rounded-xl shadow-sm overflow-hidden border border-gray-300 transition-all duration-200 hover:shadow-md",
            className
        )}>
            {children}
        </div>
    );
}

interface CardHeaderProps {
    className?: string;
    children: ReactNode;
}

export function CardHeader({ className, children }: CardHeaderProps) {
    return (
        <div className={cn("px-4 py-3 border-b border-blue-100 flex items-center justify-between", className)}>
            {children}
        </div>
    );
}

interface CardTitleProps {
    className?: string;
    children: ReactNode;
}


export function CardTitle({ className, children }: CardTitleProps) {
    return (
        <h3 className={cn("text-lg text-gray-700 flex items-center gap-2", className)}>
            <CameraIcon className="h-5 w-5 text-gray-700" />
            {children}
        </h3>
    );
}

interface CardContentProps {
    className?: string;
    children: ReactNode;
}

export function CardContent({ className, children }: CardContentProps) {
    return (
        <div className={cn("p-4", className)}>
            {children}
        </div>
    );
}

interface CardFooterProps {
    className?: string;
    children: ReactNode;
}

export function CardFooter({ className, children }: CardFooterProps) {
    return (
        <div className={cn("px-4 py-3 border-t border-blue-100", className)}>
            {children}
        </div>
    );
}
