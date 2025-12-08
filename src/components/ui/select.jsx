import React from 'react';
import { cn } from '@/lib/utils';

export const Select = ({ children, className, ...props }) => {
  return (
    <div className={cn('relative', className)} {...props}>
      {children}
    </div>
  );
};

export const SelectTrigger = ({
  children,
  className,
  ...props
}) => {
  return (
    <button
      type="button"
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
      <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
};

export const SelectValue = ({ placeholder, ...props }) => {
  return <span {...props}>{placeholder}</span>;
};

export const SelectContent = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'absolute top-full z-50 mt-1 max-h-60 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg',
        className
      )}
      {...props}
    >
      <div className="overflow-auto p-1">
        {children}
      </div>
    </div>
  );
};

export const SelectItem = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
