import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { BaseDetailProps } from '../../types/course-sidebar';

interface LessonDetailProps extends BaseDetailProps {
  gradeOptions: any[];
  subjectOptions: any[];
  parseJsonArrayToString: (jsonString: string, type: "grade" | "subject" | "character_voice" | "learning_object_tags") => string;
}

export interface Activity {
  id: number;
  title: string;
  description?: string;
  type: string;
  icon?: string;
  completed?: boolean;
  metadata?: any;
}

export interface Topic {
  id: number;
  title: string;
  description?: string;
  type: string;
  icon?: string;
  completed?: boolean;
  activities?: Activity[];
  children?: Topic[];
  metadata?: any;
}

const TopicActivitiesViewer: React.FC<{ 
  topics: Topic[]; 
  onViewDetails?: (item: any) => void;
  getItemIcon: (type: string) => string;
}> = ({ topics, onViewDetails, getItemIcon }) => {
  const [expandedTopics, setExpandedTopics] = useState<Record<number, boolean>>({});

  const toggleTopic = (topicId: number) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

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

  const renderActivityRow = (activity: Activity, level: number = 0) => {
    const activityIcon = getActivityIcon(activity.type);
    const displayName = getActivityDisplayName(activity);
    const indent = level * 24;

    return (
      <div 
        key={activity.id} 
        className="flex align-items-center justify-content-between py-3 border-bottom-1 surface-border hover:surface-50 transition-duration-150"
        style={{ paddingLeft: `${indent}px` }}
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
            onClick={() => onViewDetails?.({
              id: activity.id,
              title: displayName,
              description: activity.description,
              type: activity.type,
              metadata: activity.metadata
            })}
          />
        </div>
      </div>
    );
  };

  const renderTopic = (topic: Topic, level: number = 0) => {
    const isExpanded = expandedTopics[topic.id];
    const activityCount = topic.activities?.length || 0;
    const hasActivities = activityCount > 0;
    const indent = level * 24;

    return (
      <div key={topic.id} className="border-bottom-1 surface-border">
        <div 
          className="flex align-items-center justify-content-between py-3 hover:surface-50 transition-duration-150 cursor-pointer min-h-3rem"
          style={{ paddingLeft: `${indent}px` }}
          onClick={() => hasActivities && toggleTopic(topic.id)}
        >
          <div className="flex align-items-center flex-1">
            <div className="flex align-items-center mr-2">
              {hasActivities ? (
                <Button
                  icon={isExpanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'}
                  text
                  rounded
                  className="p-0 w-2rem h-2rem"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTopic(topic.id);
                  }}
                />
              ) : (
                <div className="w-2rem h-2rem"></div>
              )}
            </div>

            <div className="flex align-items-center mr-3">
              <i className="pi pi-book text-primary" style={{ fontSize: '1.1rem' }} />
            </div>
            
            <div className="flex flex-column justify-content-center">
              <span className="font-semibold text-900">{topic.title}</span>
              {topic.description && (
                <div className="text-600 text-xs mt-1">
                  {topic.description}
                </div>
              )}
            </div>
          </div>

          <div className="flex align-items-center gap-3 min-h-3rem">
            {hasActivities && (
              <div className="text-600 text-sm" style={{ width: '150px', textAlign: 'center' }}>
                (Activities: {String(activityCount).padStart(2, '0')})
              </div>
            )}
            
            <div className="flex align-items-center justify-content-center" style={{ width: '80px' }}>
              <Button
                icon="pi pi-eye"
                rounded
                text
                severity="info"
                aria-label="View topic details"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails?.({
                    id: topic.id,
                    title: topic.title,
                    description: topic.description,
                    type: 'topic',
                    metadata: topic.metadata
                  });
                }}
              />
            </div>
          </div>
        </div>

        {hasActivities && isExpanded && (
          <div className="ml-5 border-left-1 surface-border">
            <div className="space-y-1">
              {topic.activities?.map(activity => renderActivityRow(activity, level + 1))}
            </div>
          </div>
        )}

        {topic.children && topic.children.length > 0 && (
          <div className="ml-5">
            {topic.children.map(childTopic => renderTopic(childTopic, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const calculateTotalActivities = (topicsList: Topic[]): number => {
    let total = 0;
    
    const countActivities = (topic: Topic) => {
      total += topic.activities?.length || 0;
      if (topic.children && Array.isArray(topic.children)) {
        topic.children.forEach(countActivities);
      }
    };
    
    topicsList.forEach(countActivities);
    return total;
  };

  const totalActivities = calculateTotalActivities(topics);

  return (
    <div className="">
      {totalActivities > 0 && (
        <div className="">
         
         
           
          
        </div>
      )}
      <div className="space-y-2">
        {topics.length > 0 ? (
          <>
            <div className="flex align-items-center bg-surface-100 border-bottom-1 surface-border py-3 font-semibold text-900 min-h-3rem">
              <div className="flex align-items-center flex-1">Topic</div>
              <div className="flex align-items-center justify-content-center" style={{ width: '150px' }}>Count</div>
              <div className="flex align-items-center justify-content-center" style={{ width: '80px' }}>Action</div>
            </div>
            {topics.map(topic => renderTopic(topic))}
          </>
        ) : (
          <div className="text-center text-600 py-4">
            No topics available.
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
  courseComponents
}) => {
  const findTopicData = () => {
    if (!courseComponents?.learning_objects) return null;
    
    let topicData: any = null;
    
    courseComponents.learning_objects.forEach((lo: any) => {
      lo.topics?.forEach((topicGroup: any) => {
        if (topicGroup.id === selectedDetails?.id) {
          topicData = topicGroup;
        }
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

  return (
    <>
      {topicData?.activities && topicData.activities.length > 0 && (
        <div className="col-12">
          <div className="surface-100 p-3 border-round mb-3">
            <div className="text-600 text-sm font-medium mb-2">Activities ({topicData.activities.length})</div>
            <div className="space-y-2">
              {topicData.activities.map((activity: any) => (
                <div key={activity.id} className="p-2 surface-50 border-round border-1 surface-border">
                  <div className="flex align-items-center gap-2">
                    <i className={getItemIcon(activity.type)}></i>
                    <div className="font-medium text-sm capitalize">
                      {activity.type === 'video' ? 'Video Lesson' :
                       activity.type === 'practice_questions' ? 'Practice Activity' :
                       activity.type === 'h5p' ? 'Interactive Video' : 
                       activity.type.replace('_', ' ')}
                    </div>
                  </div>
                  {activity.description && (
                    <div className="text-600 text-xs mt-1 ml-5">
                      {activity.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const LessonDetail: React.FC<LessonDetailProps> = ({
  selectedDetails,
  editMode,
  editData,
  setEditData,
  renderEditableField,
  renderDropdownField,
  getItemIcon,
  courseComponents,
  onOpenDetails,
  gradeOptions,
  subjectOptions,
  parseJsonArrayToString
}) => {
  const findLearningObjectById = (id: number) => {
    if (!courseComponents?.learning_objects) return null;
    
    for (const lo of courseComponents.learning_objects) {
      if (lo.id === id) {
        return lo;
      }
    }

    for (const lo of courseComponents.learning_objects) {
      if (lo.topics && Array.isArray(lo.topics)) {
        for (const topicGroup of lo.topics) {
          if (topicGroup && topicGroup.id === id) {
            return topicGroup;
          }
          
          if (topicGroup && typeof topicGroup === 'object' && 'topics' in topicGroup && Array.isArray(topicGroup.topics)) {
            for (const topic of topicGroup.topics) {
              if (topic && topic.id === id) {
                return topic;
              }
            }
          }
        }
      }
    }
    
    return null;
  };

  const learningObjectData = findLearningObjectById(selectedDetails.id);

 const convertToTopics = (): Topic[] => {
  if (!learningObjectData) return [];

  const topics: Topic[] = [];


  if (learningObjectData.topics && Array.isArray(learningObjectData.topics)) {
 
    
    learningObjectData.topics.forEach((item: any) => {
    
      
      // CASE 1: Item has nested topics array (Working Structure)
      if (item.topics && Array.isArray(item.topics)) {
      
        
        item.topics.forEach((nestedTopic: any) => {
         
          
          const activities: Activity[] = nestedTopic.activities?.map((activity: any) => ({
            id: activity.id,
            title: activity.name || activity.type,
            description: activity.description,
            type: activity.type,
            metadata: activity
          })) || [];

          if (nestedTopic.name || activities.length > 0) {
            topics.push({
              id: nestedTopic.id,
              title: nestedTopic.name || 'Unnamed Topic',
              description: nestedTopic.description,
              type: 'topic',
              activities: activities
            });
          }
        });
      }
      
      // CASE 2: Item has direct activities (Broken Structure - Flat topics)
      else if (item.activities && Array.isArray(item.activities)) {
        
        
        const activities: Activity[] = item.activities.map((activity: any) => ({
          id: activity.id,
          title: activity.name || activity.type,
          description: activity.description,
          type: activity.type,
          metadata: activity
        }));

        if (item.name || activities.length > 0) {
          topics.push({
            id: item.id,
            title: item.name || 'Unnamed Topic',
            description: item.description,
            type: 'topic',
            activities: activities
          });
        }
      }
      
      // CASE 3: Item is a topic with no activities but has name
      else if (item.name) {
        
        topics.push({
          id: item.id,
          title: item.name,
          description: item.description,
          type: 'topic',
          activities: []
        });
      }
    });
  }

 
  return topics;
};

  const topics = convertToTopics();

  return (
    <>
      <div className="col-12">
        <div className="surface-100 p-3 border-round mb-3">
          <div className="text-600 text-sm font-medium mb-2">Description</div>
          <div className="text-900">
            {renderEditableField('Description', 
              selectedDetails.description || selectedDetails.character_voice || "", 
              'description', 
              'textarea'
            )}
          </div>
        </div>
      </div>

      <div className="col-12 md:col-6">
        <div className="surface-100 p-3 border-round mb-3">
          <div className="text-600 text-sm font-medium mb-2">Grade</div>
          <div className="text-900">
            {renderDropdownField('Grade', selectedDetails.grade, 'grade', gradeOptions)}
          </div>
        </div>
      </div>

      <div className="col-12 md:col-6">
        <div className="surface-100 p-3 border-round mb-3">
          <div className="text-600 text-sm font-medium mb-2">Subject</div>
          <div className="text-900">
            {renderDropdownField('Subject', selectedDetails.subject, 'subject', subjectOptions)}
          </div>
        </div>
      </div>

      <div className="col-12">
        <div className="surface-100 p-3 border-round mb-3">
          <div className="text-600 text-sm font-medium mb-2">Character Voice</div>
          <div className="text-900">
            {renderEditableField('Character Voice', selectedDetails.character_voice || "", 'character_voice')}
          </div>
        </div>
      </div>

      <div className="col-12">
        <div className="surface-100 p-3 border-round mb-3">
          <div className="text-600 text-sm font-medium mb-2">Tags</div>
          <div className="text-900">
            {renderEditableField('Tags', selectedDetails.learning_object_tags || "", 'learning_object_tags')}
          </div>
        </div>
      </div>

      {/* Topics and Activities Section */}
      <div className="col-12">
        <TopicActivitiesViewer 
          topics={topics}
          onViewDetails={onOpenDetails}
          getItemIcon={getItemIcon}
        />
      </div>

     
  
    </>
  );
};

export default LessonDetail;