"use client";
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Button } from 'primereact/button';
import TwoColumnRow from '../../../../components/common/TwoColumnRow';
import { getItemIcon as getItemIconUtil } from '../utils/iconMaps';

export interface LessonItem {
  title: string;
  description?: string;
  icon: string | JSX.Element; 
  count?: string;
  type: string;
  id: number;
  children?: LessonItem[];
  childrenLoaded?: boolean;
  metadata?: any; 
  completed?: boolean; 
}

export interface LessonTableProps {
  data: LessonItem[];
  onOpenDetails: (payload: any) => void;
  searchTerm: string;
  onLoadChildren?: (parentId: number, parentType: string) => Promise<LessonItem[]>; 
  getItemIcon?: (type: string) => string | JSX.Element; 
}

const LessonTable: React.FC<LessonTableProps> = ({ 
  data, 
  onOpenDetails, 
  searchTerm = "",
  onLoadChildren
}) => {
  const [loadingItems, setLoadingItems] = useState<Set<number>>(new Set());
  const [itemsWithChildren, setItemsWithChildren] = useState<Map<number, LessonItem[]>>(new Map());
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  // Memoize getChildrenForItem to avoid infinite re-renders
  const getChildrenForItem = useCallback((item: LessonItem): LessonItem[] => {
    if (item.children && item.children.length > 0) {
      return item.children;
    }
    const loadedChildren = itemsWithChildren.get(item.id);
    if (loadedChildren) {
      return loadedChildren;
    }
    return [];
  }, [itemsWithChildren]);

  // Memoize findItemById with getChildrenForItem dependency
  const findItemById = useCallback((items: LessonItem[], id: number): LessonItem | null => {
    for (const item of items) {
      if (item.id === id) return item;
      const children = getChildrenForItem(item);
      if (children.length > 0) {
        const found = findItemById(children, id);
        if (found) return found;
      }
    }
    return null;
  }, [getChildrenForItem]);

  const shouldShowItem = useCallback((item: LessonItem): boolean => {
    if (!searchTerm.trim()) return true;
    
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (matchesSearch) return true;
    
    const children = getChildrenForItem(item);
    if (children.length > 0) {
      return children.some(child => shouldShowItem(child));
    }
    
    return false;
  }, [searchTerm, getChildrenForItem]);

  const loadChildren = useCallback(async (item: LessonItem) => {
    if (loadingItems.has(item.id) || itemsWithChildren.has(item.id)) {
      return;
    }
    
    try {
      setLoadingItems(prev => new Set(prev).add(item.id));
      const children = onLoadChildren ? await onLoadChildren(item.id, item.type) : [];
      setItemsWithChildren(prev => new Map(prev).set(item.id, children));
      item.childrenLoaded = true;
    } catch (error) {
      console.error('Failed to load children for item:', item.id, error);
    } finally {
      setLoadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }
  }, [loadingItems, itemsWithChildren, onLoadChildren]);

  const toggleExpand = useCallback(async (item: LessonItem) => {
    const id = item.id;
    const isExpanded = expandedItems.has(id);
    
    if (isExpanded) {
      setExpandedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } else {
      setExpandedItems(prev => new Set(prev).add(id));
      
      if (!item.childrenLoaded && item.type === 'learning_object' && onLoadChildren) {
        await loadChildren(item);
      }
    }
  }, [expandedItems, onLoadChildren, loadChildren]);

  // Fixed useEffect with proper dependencies
  useEffect(() => {
    if (!searchTerm.trim()) return;

    const autoExpandItems = (items: LessonItem[]): number[] => {
      let idsToExpand: number[] = [];
      
      items.forEach(item => {
        const children = getChildrenForItem(item);
        if (children.length > 0) {
          const hasMatchingChildren = children.some(child => shouldShowItem(child));
          if (hasMatchingChildren && !expandedItems.has(item.id)) {
            idsToExpand.push(item.id);
          }
          const nestedIds = autoExpandItems(children);
          idsToExpand = [...idsToExpand, ...nestedIds];
        }
      });
      
      return idsToExpand;
    };

    const idsToExpand = autoExpandItems(data);
    
    if (idsToExpand.length > 0) {
      setExpandedItems(prev => new Set([...Array.from(prev), ...idsToExpand]));
      
      // Load children for expanded items
      idsToExpand.forEach(id => {
        const item = findItemById(data, id);
        if (item && !item.childrenLoaded && onLoadChildren) {
          loadChildren(item);
        }
      });
    }
  }, [searchTerm, data, expandedItems, getChildrenForItem, shouldShowItem, findItemById, onLoadChildren, loadChildren]);

  const getBackgroundColor = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('assessment')) {
      return 'bg-teal-100';
    } else if (lowerType.includes('exam')) {
      return 'bg-orange-100';
    }
    return ''; 
  };

  const getItemIcon = (type?: string, customIcon?: string | JSX.Element) => {
    if (customIcon && typeof customIcon !== 'string') {
      return customIcon;
    }
    return getItemIconUtil(type, customIcon as string);
  };

  const renderLessonRow = (item: LessonItem, level: number = 0, parentKey?: string) => {
    if (!shouldShowItem(item)) {
      return null;
    }

    const children = getChildrenForItem(item);
    const hasChildren = children.length > 0 || (item.childrenLoaded === false && item.type === 'learning_object');
    const isExpanded = expandedItems.has(item.id);
    const isLoading = loadingItems.has(item.id);
    const indent = level * 24;
    const itemIcon = getItemIcon(item.type, item.icon);
    const backgroundColor = getBackgroundColor(item.type);

    return (
      <React.Fragment key={`${item.id}-${level}-${parentKey || 'root'}`}>
        <TwoColumnRow
          className={`border-bottom-1 surface-border py-3 ${backgroundColor}`}
          left={(
            <div className="flex align-items-center min-h-3rem" style={{ paddingLeft: `${indent}px` }}>
              <div className="flex align-items-center mr-2">
                {hasChildren ? (
                  <Button
                    icon={isLoading ? 'pi pi-spin pi-spinner' : (isExpanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right')}
                    text
                    rounded
                    className="p-button-icon p-c p-0 w-2rem h-2rem"
                    onClick={() => toggleExpand(item)}
                    disabled={isLoading}
                  />
                ) : (
                  <div className="w-2rem h-2rem"></div>
                )}
              </div>
              <div className="flex align-items-center mr-3">
                {typeof itemIcon === 'string' ? (
                  <i 
                    className={`${itemIcon}`} 
                    style={{ 
                      color: 'var(--primary-color)', 
                      fontSize: '1.1rem'
                    }} 
                  />
                ) : (
                  <div style={{ 
                    color: 'var(--primary-color)', 
                    fontSize: '1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '1.1rem',
                    height: '1.1rem'
                  }}>
                    {itemIcon}
                  </div>
                )}
              </div>
              <div className="flex flex-column justify-content-center">
                <span className="font-semibold text-900">{item.title}</span>
                {item.description && (
                  <div className="text-600 text-sm mt-1" style={{ marginLeft: '0' }}>
                    {item.description}
                  </div>
                )}
              </div>
              <div className="flex align-items-center justify-content-center text-600 min-h-3rem" style={{ width: '150px', marginLeft: 'auto' }}>
                <div className="text-center">
                  {item.count}
                </div>
              </div>
            </div>
          )}
          onView={() => onOpenDetails?.({
            id: item.id,
            name: item.title,
            description: item.description,
            type: item.type,
            progress: item.completed ? 100 : 0,
            status: item.completed ? 'Completed' : 'In Progress',
            metadata: item.metadata
          })}
          viewAriaLabel="View details"
        />
        {hasChildren && isExpanded && (
          <div>
            {children
              .map(child => renderLessonRow(child, level + 1, `${item.id}`))
              .filter(Boolean)}
            
            {isLoading && (
              <div className="flex justify-content-center align-items-center py-2" style={{ paddingLeft: `${indent + 48}px` }}>
                <i className="pi pi-spin pi-spinner text-primary mr-2"></i>
                <span className="text-600">Loading...</span>
              </div>
            )}
          </div>
        )}
      </React.Fragment>
    );
  };

  const filteredData = useMemo(() => 
    data.filter(item => shouldShowItem(item)), 
    [data, shouldShowItem]
  );

  return (
    <div>
      <div className="flex align-items-center bg-surface-100 border-bottom-1 surface-border py-3 font-semibold text-900 min-h-3rem">
        <div className="flex align-items-center flex-1">
          <span style={{ marginLeft: '40px' }}>Lesson</span>
        </div>
        <div className="flex align-items-center justify-content-center" style={{ width: '150px' }}>Count</div>
        <div className="flex align-items-center justify-content-center" style={{ width: '80px' }}>Action</div>
      </div>
      <div>
        {filteredData.length === 0 ? (
          <div className="flex justify-content-center align-items-center py-6 text-600 min-h-3rem">
            {searchTerm.trim() ? 'No matching lessons found.' : 'No course content available.'}
          </div>
        ) : (
          filteredData.map(item => renderLessonRow(item))
        )}
      </div>
    </div>
  );
};

export default LessonTable;