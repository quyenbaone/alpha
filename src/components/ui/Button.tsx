import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost' | 'default';
    className?: string;
}

export function Button({
    children,
    variant = 'primary',
    className = '',
    ...props
}: ButtonProps) {
    const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50';

    const variantClasses = {
        primary: 'bg-orange-500 text-white hover:bg-orange-600',
        secondary: 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-100',
        ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
        default: 'bg-orange-600 text-white hover:bg-orange-700'
    };

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
} 