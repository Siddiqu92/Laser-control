import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { BaseDetailProps } from '../../types/courseTypes';
import TwoColumnRow from '../../../../../components/common/TwoColumnRow';
import { getActivityIcon as getActivityIconUtil } from '../../utils/iconMaps';

export interface Activity {
  id: number;
  title: string;
  description?: string;
  type: string;
  icon?: string;
  completed?: boolean;
  metadata?: any;
}

const ActivitiesViewer: React.FC<{ 
  activities: Activity[]; 
  onViewDetails?: (item: any) => void;
  getItemIcon: (type: string) => string | React.ReactNode;
}> = ({ activities, onViewDetails, getItemIcon }) => {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const handleCheckboxChange = (activity: Activity, checked: boolean) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(activity.id);
      } else {
        newSet.delete(activity.id);
      }
      return newSet;
    });
  };

  const getActivityIcon = (activityType: string) => getActivityIconUtil(activityType);

  const getActivityDisplayName = (activity: Activity) => {
    if (activity.title && activity.title !== activity.type) {
      return activity.title;
    }
    const type = activity.type?.toLowerCase() || '';
    if (type.includes('video')) return 'Interactive Video';
    if (type.includes('practice')) return 'Practice Activity';
    if (type.includes('lesson') || type.includes('learning_object')) return 'Lesson';
    return activity.type?.replace(/_/g, ' ') || 'Activity';
  };

  const renderIcon = (icon: string | React.ReactNode) => {
    if (typeof icon === 'string') {
      return <i className={icon} style={{ fontSize: '1rem', color: 'var(--primary-color)' }} />;
    }
    
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon as React.ReactElement<any>, {
        style: {
          ...(icon.props as any)?.style,
          fontSize: '1.5rem',
          color: 'var(--primary-color)'
        }
      });
    }
    
    return icon;
  };

  const renderActivityRow = (activity: Activity) => {
    const activityIcon = getActivityIcon(activity.type);
    const displayName = getActivityDisplayName(activity);
    const isChecked = checkedItems.has(activity.id);

    return (
      <TwoColumnRow
        key={activity.id}
        className="py-3 border-bottom-1 surface-border hover:surface-50 transition-duration-150"
        left={
          <div className="flex align-items-center min-h-3rem">
            <div className="flex align-items-center mr-2">
              <Checkbox
                checked={isChecked}
                onChange={(e) => handleCheckboxChange(activity, e.checked || false)}
                className="p-checkbox p-component"
              />
            </div>
            <div className="flex align-items-center mr-3">
              {renderIcon(activityIcon)}
            </div>
            <div className="flex flex-column justify-content-center">
              <span className="font-semibold text-900">{displayName}</span>
              {activity.description && (
                <div className="text-600 text-xs mt-1">
                  {activity.description}
                </div>
              )}
            </div>
          </div>
        }
        onView={() => onViewDetails?.({
          id: activity.id,
          title: displayName,
          description: activity.description,
          type: activity.type,
          metadata: activity.metadata
        })}
        viewAriaLabel="View activity details"
      />
    );
  };

  return (
    <div className="">
      <div className="space-y-2">
        {activities.length > 0 ? (
          <>
            <div className="flex align-items-center py-3 border-bottom-1 surface-border font-semibold text-900 min-h-3rem">
              <div className="flex align-items-center flex-1">
                <span style={{ marginLeft: '32px' }}>Activities</span>
              </div>
              <div className="flex align-items-center justify-content-center" style={{ width: '80px' }}>Action</div>
            </div>
            {activities.map(activity => renderActivityRow(activity))}
          </>
        ) : (
          <div className="text-center text-600 py-4">
            No activities available.
          </div>
        )}
      </div>
    </div>
  );
};

const TopicDetail: React.FC<BaseDetailProps> = ({
  selectedDetails,
  editMode,
  editData,
  setEditData,
  renderEditableField,
  getItemIcon,
  courseComponents,
  onOpenDetails
}) => {
  const findTopicData = () => {
    if (!courseComponents?.learning_objects) return null;
    let topicData: any = null;
    
    courseComponents.learning_objects.forEach((lo: any) => {
      lo.topics?.forEach((topicOrGroup: any) => {
        if (topicOrGroup?.id === selectedDetails?.id) {
          topicData = topicOrGroup;
        }
        topicOrGroup.topics?.forEach((topic: any) => {
          if (topic.id === selectedDetails?.id) {
            topicData = topic;
          }
        });
      });
    });
    
    return topicData;
  };

  const topicData = findTopicData();

  const convertToActivities = (): Activity[] => {
    if (!topicData) return [];
    
    return topicData.activities?.map((activity: any) => ({
      id: activity.id,
      title: activity.name || activity.type,
      description: activity.description,
      type: activity.type,
      metadata: activity
    })) || [];
  };

  const activities = convertToActivities();

  return (
    <>
      {/* Character Voice - First */}
      <div className="col-12">
        <div className="p-3 border-1 border-200 border-round">
          <div className="font-semibold text-900 mb-2">Character Voice</div>
          <div className="text-900">
            {renderEditableField('Character Voice', 
              selectedDetails.character_voice 
                || topicData?.character_voice 
                || "", 
              'character_voice'
            )}
          </div>
        </div>
      </div>

      {/* Name - Second */}
      <div className="col-12">
        <div className="p-3 border-1 border-200 border-round">
          <div className="font-semibold text-900 mb-2">Name</div>
          <div className="text-900">
            {renderEditableField('Name', 
              selectedDetails.name || selectedDetails.title || "", 
              'name'
            )}
          </div>
        </div>
      </div>

      {/* Activities - Last */}
      <div className="col-12">
        <div className="p-3 border-1 border-200 border-round">
          <ActivitiesViewer 
            activities={activities}
            onViewDetails={onOpenDetails}
            getItemIcon={getItemIcon}
          />
        </div>
      </div>
    </>
  );
};

export default TopicDetail;