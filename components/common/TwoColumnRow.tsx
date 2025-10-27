"use client";

import React from 'react';
import { Button } from 'primereact/button';

interface TwoColumnRowProps {
  left: React.ReactNode;
  onView?: () => void;
  viewAriaLabel?: string;
  className?: string;
  rightWidthPx?: number;
}

const TwoColumnRow: React.FC<TwoColumnRowProps> = ({
  left,
  onView,
  viewAriaLabel = 'View details',
  className = '',
  rightWidthPx = 80
}) => {
  return (
    <div className={`flex align-items-center justify-content-between ${className}`}>
      <div className="flex-1 min-w-0">
        {left}
      </div>
      <div className="flex align-items-center justify-content-center" style={{ width: `${rightWidthPx}px` }}>
        {onView && (
          <Button
            icon="pi pi-eye"
            rounded
            text
            severity="info"
            aria-label={viewAriaLabel}
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TwoColumnRow;


