import React from 'react';
import { Button } from 'primereact/button';
import { BaseDetailProps } from '../../types/course-sidebar';

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
  getItemIcon: (type: string) => string;
}> = ({ activities, onViewDetails, getItemIcon }) => {

  const getActivityIcon = (activityType: string) => {
    const type = activityType?.toLowerCase() || '';
    if (type.includes('video')) return 'pi pi-video';
    if (type.includes('practice')) return 'pi pi-bolt';
    if (type.includes('lesson') || type.includes('learning_object')) return 'pi pi-book';
    return 'pi pi-video';
  };

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

  const renderActivityRow = (activity: Activity) => {
    const activityIcon = getActivityIcon(activity.type);
    const displayName = getActivityDisplayName(activity);

    return (
      <div 
        key={activity.id} 
        className="flex align-items-center justify-content-between py-3 border-bottom-1 surface-border hover:surface-50 transition-duration-150"
      >
        <div className="flex align-items-center flex-1 min-h-3rem">
          <div className="flex align-items-center mr-3">
            <i className={activityIcon} style={{ fontSize: '1rem', color: 'var(--primary-color)' }} />
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
        
        <div className="flex align-items-center justify-content-center min-h-3rem" style={{ width: '80px' }}>
     <Button
  icon="pi pi-eye"
  rounded
  text
  severity="info"
  size="small"
  aria-label="View activity details"
  onClick={() => {
    console.log("🔄 Activity view button clicked:", activity);
    onViewDetails?.({
      id: activity.id,
      title: displayName,
      description: activity.description,
      type: activity.type,
      metadata: activity.metadata
    });
  }}
/>
        </div>
      </div>
    );
  };

  return (
    <div className="">
      <div className="space-y-2">
        {activities.length > 0 ? (
          <>
            <div className="flex align-items-center bg-surface-100 border-bottom-1 surface-border py-3 font-semibold text-900 min-h-3rem">
              <div className="flex align-items-center flex-1">Activities</div>
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
      lo.topics?.forEach((topicGroup: any) => {
        topicGroup.topics?.forEach((topic: any) => {
          if (topic.id === selectedDetails?.id) {
            topicData = topic;
          }
        });
      });
    });

    return topicData;
  };

  const topicData = findTopicData();

  // Convert topic data to activities array
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
  

      <div className="col-12">
        <div className="surface-100 p-3 border-round mb-3">
          <div className="text-600 text-sm font-medium mb-2">Description</div>
          <div className="text-900">
            {renderEditableField('Description', 
              selectedDetails.description || topicData?.description || "", 
              'description', 
              'textarea'
            )}
          </div>
        </div>
      </div>

      <div className="col-12">
        <div className="surface-100 p-3 border-round mb-3">
          <div className="text-600 text-sm font-medium mb-2">Character Voice</div>
          <div className="text-900">
            {renderEditableField('Character Voice', 
              selectedDetails.character_voice || topicData?.character_voice || "", 
              'character_voice'
            )}
          </div>
        </div>
      </div>

      {/* Activities Section with only activities display */}
      <div className="col-12">
        <ActivitiesViewer 
          activities={activities}
          onViewDetails={onOpenDetails}
          getItemIcon={getItemIcon}
        />
      </div>
    </>
  );
};

export default TopicDetail;