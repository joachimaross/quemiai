import React from 'react';
import { cn } from '../utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  fallback?: string;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, size = 'md', fallback, ...props }, ref) => {
    const sizeStyles = {
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-12 w-12 text-base',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-center rounded-full bg-gray-200',
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {src ? (
          <img src={src} alt={alt} className="h-full w-full rounded-full object-cover" />
        ) : (
          <span className="font-medium text-gray-600">
            {fallback || alt?.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';
