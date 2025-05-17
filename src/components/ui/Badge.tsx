import { ReactNode } from 'react';

interface BadgeProps {
    children: ReactNode;
    variant?: 'default' | 'outline' | 'secondary' | 'destructive';
    className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
    const baseClasses = 'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium';

    const variantClasses = {
        default: 'bg-primary/10 text-primary',
        outline: 'border border-border text-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-destructive/10 text-destructive'
    };

    return (
        <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
            {children}
        </span>
    );
} 