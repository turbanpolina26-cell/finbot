/**
 * Shared UI Components Library
 * 
 * Centralized, reusable components following the design system.
 * All components accept className prop for customization.
 */

import React from 'react';
import { X } from 'lucide-react';

// ============================================================================
// Button Component
// ============================================================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, disabled, className, children, ...props }, ref) => {
    const variantStyles = {
      primary: 'bg-tg-accent text-white hover:shadow-lg hover:shadow-tg-accent/30 active:scale-95',
      secondary: 'bg-tg-card border border-white/10 text-tg-text hover:border-white/20',
      danger: 'bg-red-500/10 border border-red-500/30 text-tg-red hover:bg-red-500/20',
      ghost: 'text-tg-muted hover:text-tg-text hover:bg-white/5',
    };

    const sizeStyles = {
      sm: 'px-md py-sm text-sm',
      md: 'px-lg py-md text-base',
      lg: 'px-lg py-lg text-lg font-semibold',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center gap-md rounded-card font-semibold transition-all duration-normal disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className || ''}`}
        {...props}
      >
        {isLoading ? <span className="animate-spin">○</span> : children}
      </button>
    );
  }
);

Button.displayName = 'Button';

// ============================================================================
// Input Component
// ============================================================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, prefix, suffix, className, ...props }, ref) => {
    return (
      <div className="w-full group">
        {label && (
          <label className="text-xs text-tg-muted ml-md block mb-md font-semibold uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          {prefix && <span className="absolute left-lg top-1/2 -translate-y-1/2 text-tg-muted pointer-events-none">{prefix}</span>}
          <input
            ref={ref}
            className={`w-full bg-tg-card text-tg-text p-lg rounded-card border transition-all duration-fast ${
              error
                ? 'border-tg-red focus:ring-2 focus:ring-tg-red/50'
                : 'border-white/5 focus:outline-none focus:ring-2 focus:ring-tg-accent/50 focus:border-tg-accent'
            } placeholder:text-tg-muted/70 ${prefix ? 'pl-2xl' : ''} ${suffix ? 'pr-2xl' : ''} min-h-14 ${className || ''}`}
            {...props}
          />
          {suffix && <span className="absolute right-lg top-1/2 -translate-y-1/2 text-tg-muted pointer-events-none">{suffix}</span>}
        </div>
        {error && <p className="text-xs text-tg-red mt-md font-semibold">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ============================================================================
// Card Component
// ============================================================================

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'outline';
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', interactive, className, children, ...props }, ref) => {
    const variantStyles = {
      default: 'bg-tg-card border border-white/5',
      glass: 'bg-white/5 backdrop-blur-sm border border-white/10',
      outline: 'bg-transparent border border-white/10',
    };

    const interactiveClass = interactive ? 'hover:border-white/10 cursor-pointer active:scale-95' : '';

    return (
      <div
        ref={ref}
        className={`rounded-card p-lg transition-all duration-normal ${variantStyles[variant]} ${interactiveClass} ${className || ''}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// ============================================================================
// Modal Component
// ============================================================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }[size];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl animate-fade-in">
      <div className={`${sizeClass} w-full bg-gradient-to-b from-tg-card to-tg-secondary p-2xl rounded-t-modal sm:rounded-modal border-t sm:border border-white/10 shadow-lg animate-slide-up`}>
        {/* Header */}
        {title && (
          <div className="flex justify-between items-center mb-xl">
            <h2 className="text-2xl font-bold text-tg-text">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-md rounded-full bg-white/5 hover:bg-white/10 transition-all text-tg-text"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Content */}
        {children}
      </div>
    </div>
  );
};

// ============================================================================
// Badge Component
// ============================================================================

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'muted';
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'primary', className, children, ...props }) => {
  const variantStyles = {
    primary: 'bg-tg-accent/20 text-tg-accent border border-tg-accent/30',
    success: 'bg-tg-green/20 text-tg-green border border-tg-green/30',
    danger: 'bg-tg-red/20 text-tg-red border border-tg-red/30',
    warning: 'bg-tg-gold/20 text-tg-gold border border-tg-gold/30',
    muted: 'bg-white/5 text-tg-muted border border-white/10',
  };

  return (
    <span
      className={`inline-flex items-center gap-sm px-md py-sm rounded-card text-xs font-semibold uppercase tracking-wider ${variantStyles[variant]} ${className || ''}`}
      {...props}
    >
      {children}
    </span>
  );
};

// ============================================================================
// Alert Component
// ============================================================================

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
}

export const Alert: React.FC<AlertProps> = ({ variant = 'info', title, className, children, ...props }) => {
  const variantStyles = {
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-100',
    success: 'bg-tg-green/10 border-tg-green/30 text-tg-green',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-100',
    danger: 'bg-tg-red/10 border-tg-red/30 text-tg-red',
  };

  return (
    <div className={`rounded-card border p-lg ${variantStyles[variant]} ${className || ''}`} {...props}>
      {title && <h4 className="font-semibold mb-sm">{title}</h4>}
      <p className="text-sm">{children}</p>
    </div>
  );
};

// ============================================================================
// Skeleton Component
// ============================================================================

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`bg-white/5 rounded-card animate-pulse ${className || 'h-12 w-full'}`} />
  );
};

// ============================================================================
// List Item Component (for consistent spacing)
// ============================================================================

interface ListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  avatar?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}

export const ListItem: React.FC<ListItemProps> = ({ avatar, title, subtitle, action, className, ...props }) => {
  return (
    <div className={`flex items-center justify-between gap-lg p-lg bg-tg-card rounded-card border border-white/5 hover:border-white/10 transition-all duration-fast group ${className || ''}`} {...props}>
      <div className="flex items-center gap-lg flex-1">
        {avatar && <div className="flex-shrink-0">{avatar}</div>}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-tg-text truncate">{title}</p>
          {subtitle && <p className="text-sm text-tg-muted truncate">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all">{action}</div>}
    </div>
  );
};

// ============================================================================
// Divider Component
// ============================================================================

export const Divider: React.FC<{ variant?: 'horizontal' | 'vertical' }> = ({ variant = 'horizontal' }) => {
  if (variant === 'vertical') {
    return <div className="w-px h-full bg-white/10" />;
  }
  return <div className="w-full h-px bg-white/10" />;
};

// ============================================================================
// Loading Spinner Component
// ============================================================================

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ size = 'md', className }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`${sizes[size]} border-2 border-tg-accent/30 border-t-tg-accent rounded-full animate-spin ${className || ''}`} />
  );
};
