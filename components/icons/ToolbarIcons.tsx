import React from 'react';

// 1. Share / 45-degree Hyperlink Chain Icon (Expanded to 24x24 bounds)
export function ShareLinkIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Top-right loop expanded to upper bounds */}
      <path d="M9 15l6-6" />
      <path d="M11 7l2.5-2.5a4.5 4.5 0 0 1 6.36 6.36L17.5 13.5a4.5 4.5 0 0 1-6.36 0" />
      {/* Bottom-left loop expanded to lower bounds */}
      <path d="M13 17l-2.5 2.5a4.5 4.5 0 0 1-6.36-6.36L6.5 10.5a4.5 4.5 0 0 1 6.36 0" />
    </svg>
  );
}

// 2. History Hourglass Icon (image_71afdc.png - geometric hourglass)
export function HistoryHourglassIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 3h14M5 21h14" />
      <path d="M6 3v3.5l4.5 4.5v2L6 17.5V21" />
      <path d="M18 3v3.5L13.5 11v2l4.5 4.5V21" />
      <path d="M9 18h6" />
    </svg>
  );
}

// 3. Clear / Trash Bin Icon (image_71a8d8.png - rounded wastebasket with lid)
export function ClearTrashIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 3h6a1 1 0 0 1 1 1v1H8V4a1 1 0 0 1 1-1z" />
      <path d="M4 6h16" />
      <path d="M6 6l1.2 13.2A2 2 0 0 0 9.2 21h5.6a2 2 0 0 0 2-1.8L18 6" />
    </svg>
  );
}
