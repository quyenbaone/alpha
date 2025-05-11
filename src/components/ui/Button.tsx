import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    className = '',
    ...props
}) => {
    const base =
        'px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400';
    const variants = {
        primary:
            'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50',
        secondary:
            'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 disabled:opacity-50',
    };
    return (
        <button className={`${base} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
}; 