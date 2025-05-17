import { ReactNode } from 'react';

interface BadgeProps {
    children: ReactNode;
    variant?: 'default' | 'outline';
    className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
    const baseClasses = 'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium';

    const variantClasses = {
        default: 'bg-orange-100 text-orange-800',
        outline: 'border border-gray-200 text-gray-700'
    };

    return (
        <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
            {children}
        </span>
    );
} 