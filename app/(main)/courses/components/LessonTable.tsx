"use client";

import React, { useState } from 'react';
import { Button } from 'primereact/button';

export interface LessonItem {
  title: string;
  description?: string | null;
  icon: string;
  count: string;
  type: string;
  id: number;
  completed?: boolean;
  children?: LessonItem[];
  metadata?: any; 
}


interface LessonTableProps {
  data: LessonItem[];
  onOpenDetails?: (payload: any) => void;
}

const LessonTable: React.FC<LessonTableProps> = ({ data, onOpenDetails }) => {
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});

  const toggleExpand = (key: string) => {
    setExpandedKeys(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const generateKey = (item: LessonItem, parentKey?: string): string => {
    const baseKey = parentKey ? `${parentKey}-${item.title}` : item.title;
    return baseKey.replace(/\s+/g, '-').toLowerCase();
  };

  const getItemIcon = (type?: string, customIcon?: string) => {
    if (customIcon) return customIcon;
    
    switch (type?.toLowerCase()) {
      case 'lesson':
        return 'pi pi-book';
      case 'interactive video':
      case 'video':
        return 'pi pi-video';
      case 'practice activity':
      case 'practice':
        return 'pi pi-bolt';
      default:
        return 'pi pi-book';
    }
  };

  const renderLessonRow = (item: LessonItem, level: number = 0, parentKey?: string) => {
    const key = generateKey(item, parentKey);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedKeys[key];
    const indent = level * 24;
    const itemIcon = getItemIcon(item.type, item.icon);

    return (
      <React.Fragment key={key}>
        {/* Main Row */}
        <div 
          className="flex align-items-center border-bottom-1 surface-border py-3 hover:surface-50 transition-duration-150"
          style={{ paddingLeft: `${indent}px` }}
        >
          {/* Arrow > Icon > Title Layout */}
          <div className="flex align-items-center flex-1 min-h-3rem">
            {/* Expand/Collapse Button */}
            <div className="flex align-items-center mr-2">
              {hasChildren && (
                <Button
                  icon={isExpanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'}
                  text
                  rounded
                  className="p-0 w-2rem h-2rem"
                  onClick={() => toggleExpand(key)}
                />
              )}
              {!hasChildren && <div className="w-2rem h-2rem"></div>}
            </div>

            {/* Icon */}
            <div className="flex align-items-center mr-3">
              <i 
                className={`${itemIcon}`} 
                style={{ 
                  color: 'var(--primary-color)', 
                  fontSize: '1.1rem'
                }} 
              />
            </div>

            {/* Content */}
            <div className="flex flex-column justify-content-center">
              <span className="font-semibold text-900">{item.title}</span>
              {item.description && (
                <div className="text-600 text-sm mt-1" style={{ marginLeft: '0' }}>
                  {item.description}
                </div>
              )}
            </div>
          </div>

          {/* Count - Centered and Vertically Aligned */}
          <div className="flex align-items-center justify-content-center text-600 min-h-3rem" style={{ width: '150px' }}>
            <div className="text-center">
              {item.count}
            </div>
          </div>

          {/* Action - Centered and Vertically Aligned */}
          <div className="flex align-items-center justify-content-center min-h-3rem" style={{ width: '80px' }}>
            <Button
              icon="pi pi-eye"
              rounded
              text
              severity="info"
              aria-label="View details"
              onClick={() => onOpenDetails?.({
                id: item.id,
                title: item.title,
                description: item.description,
                type: item.type,
                progress: item.completed ? 100 : 0,
                status: item.completed ? 'Completed' : 'In Progress'
              })}
            />
          </div>
        </div>

        {/* Child Rows */}
        {hasChildren && isExpanded && item.children && (
          <div>
            {item.children.map(child => renderLessonRow(child, level + 1, key))}
          </div>
        )}
      </React.Fragment>
    );
  };

  return (
    <div>
      {/* Table Header */}
      <div className="flex align-items-center bg-surface-100 border-bottom-1 surface-border py-3 font-semibold text-900 min-h-3rem">
        <div className="flex align-items-center flex-1">Lesson</div>
        <div className="flex align-items-center justify-content-center" style={{ width: '150px' }}>Count</div>
        <div className="flex align-items-center justify-content-center" style={{ width: '80px' }}>Action</div>
      </div>
      
      {/* Table Body */}
      <div>
        {data.length === 0 ? (
          <div className="flex justify-content-center align-items-center py-6 text-600 min-h-3rem">
            No course content available.
          </div>
        ) : (
          data.map(item => renderLessonRow(item))
        )}
      </div>
    </div>
  );
};

export default LessonTable;