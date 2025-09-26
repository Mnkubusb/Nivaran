import * as React from 'react';
import { cn } from '@/lib/utils';

export function Logo({ className, justIcon = false }: { className?: string, justIcon?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2 font-bold text-lg text-foreground', className)}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary"
      >
        <path
          d="M12.0001 21.6298C12.0001 21.6298 5.66012 17.0698 5.66012 11.8098C5.66012 9.0498 7.58012 6.81982 10.3401 6.81982C11.7501 6.81982 13.0101 7.42982 13.8201 8.36982"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M19.14 11.2302C19.01 10.1502 18.51 9.17018 17.73 8.37018C16.92 7.43018 15.66 6.82018 14.25 6.82018C11.49 6.82018 9.57 9.05018 9.57 11.8102C9.57 17.0702 15.91 21.6302 15.91 21.6302"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14.9004 14.3999H14.9104"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.0004 14.3999H12.0104"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.10059 14.3999H9.11059"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16.97 4.47C16.59 4.19 16.17 3.96 15.71 3.79"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.05 4.47C7.43 4.19 7.85 3.96 8.31 3.79"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 2.37012V3.37012"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {!justIcon && <span className="font-headline">WellConverse</span>}
    </div>
  );
}
