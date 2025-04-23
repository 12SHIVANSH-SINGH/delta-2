import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
    className?: string;
    children: ReactNode;
}

export function Card({ className, children }: CardProps) {
    return (
        <div className={cn(
            "bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-700 transition-all duration-200 hover:shadow-lg",
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
        <div className={cn("px-4 py-3 border-b border-gray-700 flex items-center justify-between", className)}>
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
        <h3 className={cn("text-lg font-medium text-white", className)}>
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
        <div className={cn("px-4 py-3 border-t border-gray-700", className)}>
            {children}
        </div>
    );
}