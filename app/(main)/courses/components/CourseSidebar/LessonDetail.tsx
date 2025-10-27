import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Chip } from 'primereact/chip';
import { MultiSelect } from 'primereact/multiselect';
import { BaseDetailProps } from '../../types/courseTypes';
import { ApiService, ComponentDetailResponse, ActivityDetailResponse, TopicDetailResponse } from '@/service/api';
import TwoColumnRow from '../../../../../components/common/TwoColumnRow';
import { getActivityIcon as getActivityIconUtil } from '../../utils/iconMaps';
import LibraryBooks from '@mui/icons-material/LibraryBooks';
import Category from '@mui/icons-material/Category';

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
  getItemIcon: (type: string) => string | React.ReactNode;
}> = ({ topics, onViewDetails, getItemIcon }) => {
  const [expandedTopics, setExpandedTopics] = useState<Record<number, boolean>>({});
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const toggleTopic = (topicId: number) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  const handleCheckboxChange = (item: Topic | Activity, checked: boolean) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);      
      if (checked) {
        newSet.add(item.id);
        if ('activities' in item) {
          checkAllActivities(item as Topic, newSet);
        }
      } else {
        newSet.delete(item.id);
        if ('activities' in item) {
          uncheckAllActivities(item as Topic, newSet);
        }
      }      
      return newSet;
    });
  };

  const checkAllActivities = (topic: Topic, set: Set<number>) => {
    if (topic.activities) {
      topic.activities.forEach(activity => {
        set.add(activity.id);
      });
    }
    if (topic.children) {
      topic.children.forEach(childTopic => {
        set.add(childTopic.id);
        checkAllActivities(childTopic, set);
      });
    }
  };

  const uncheckAllActivities = (topic: Topic, set: Set<number>) => {
    if (topic.activities) {
      topic.activities.forEach(activity => {
        set.delete(activity.id);
      });
    }
    if (topic.children) {
      topic.children.forEach(childTopic => {
        set.delete(childTopic.id);
        uncheckAllActivities(childTopic, set);
      });
    }
  };

  const getCheckboxState = (item: Topic | Activity): boolean | null => {
    if (!('activities' in item) || !item.activities || item.activities.length === 0) {
      return checkedItems.has(item.id);
    }
    const allIds = getAllChildIds(item as Topic);
    const checkedChildren = allIds.filter(id => checkedItems.has(id));    
    if (checkedChildren.length === 0) {
      return false;
    } else if (checkedChildren.length === allIds.length) {
      return true;
    } else {
      return null;
    }
  };

  const getAllChildIds = (topic: Topic): number[] => {
    let ids: number[] = [];
    if (topic.activities) {
      topic.activities.forEach(activity => {
        ids.push(activity.id);
      });
    }
    if (topic.children) {
      topic.children.forEach(childTopic => {
        ids.push(childTopic.id);
        ids = ids.concat(getAllChildIds(childTopic));
      });
    }  
    return ids;
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

  const renderIcon = (icon: string | React.ReactNode, className: string = '') => {
    const iconStyle = { 
      fontSize: '1.5rem', 
      color: 'var(--primary-color)',
      width: '1.5rem',
      height: '1.5rem'
    };

    if (typeof icon === 'string') {
      return <i className={`${icon} ${className}`} style={iconStyle} />;
    }
    return React.isValidElement(icon) 
      ? React.cloneElement(icon as React.ReactElement, { 
          className: `${(icon as React.ReactElement).props.className || ''} ${className}`,
          style: { ...iconStyle, ...(icon as React.ReactElement).props.style }
        })
      : icon;
  };

  const renderActivityRow = (activity: Activity, level: number = 0) => {
    const activityIcon = getActivityIcon(activity.type);
    const displayName = getActivityDisplayName(activity);
    const indent = level * 24;
    const isChecked = checkedItems.has(activity.id);

    return (
      <TwoColumnRow
        key={activity.id}
        className="py-3 border-bottom-1 surface-border hover:surface-50 transition-duration-150"
        left={
          <div className="flex align-items-center min-h-3rem" style={{ paddingLeft: `${indent}px` }}>
            <div className="flex align-items-center mr-2">
              <div className="w-2rem h-2rem"></div>
            </div>
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

  const renderTopic = (topic: Topic, level: number = 0) => {
    const isExpanded = expandedTopics[topic.id];
    const activityCount = topic.activities?.length || 0;
    const hasActivities = activityCount > 0;
    const indent = level * 24;
    const isChecked = getCheckboxState(topic);

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
                  className="p-button-icon p-c p-0 w-2rem h-2rem text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTopic(topic.id);
                  }}
                />
              ) : (
                <div className="w-2rem h-2rem"></div>
              )}
            </div>
            <div className="flex align-items-center mr-2">
              <Checkbox
                checked={isChecked === true}
                onChange={(e) => handleCheckboxChange(topic, e.checked || false)}
                className={`p-checkbox p-component ${isChecked === null ? 'p-checkbox-indeterminate' : ''}`}
              />
            </div>
            <div className="flex align-items-center mr-3">
              <Category style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }} />
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
          <div className="">
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
            <div className="flex align-items-center border-bottom-1 surface-border py-3 font-semibold text-900 min-h-3rem">
              <div className="flex align-items-center flex-1">
                <span style={{ marginLeft: '40px' }}>Topic</span>
              </div>
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
      if (lo.topics && Array.isArray(lo.topics)) {
        lo.topics.forEach((topic: any) => {
          if (topic.id === selectedDetails?.id) {
            topicData = topic;
          }
        });
      }
    });
    return topicData;
  };

  const topicData = findTopicData();

  const renderIcon = (icon: string | React.ReactNode) => {
    const iconStyle = { 
      fontSize: '1.5rem', 
      color: 'var(--primary-color)',
      width: '1.5rem',
      height: '1.5rem'
    };

    if (typeof icon === 'string') {
      return <i className={icon} style={iconStyle} />;
    }
    return React.isValidElement(icon) 
      ? React.cloneElement(icon as React.ReactElement, { 
          style: { ...iconStyle, ...(icon as React.ReactElement).props.style }
        })
      : icon;
  };

  return (
    <>
      {topicData?.activities && topicData.activities.length > 0 && (
        <div className="col-12">
          <div className="p-3 border-1 border-200 border-round">
            <div className="font-semibold text-900 mb-2">Activities ({topicData.activities.length})</div>
            <div className="space-y-2">
              {topicData.activities.map((activity: any) => (
                <div key={activity.id} className="p-2 border-1 surface-border border-round">
                  <div className="flex align-items-center gap-2">
                    {renderIcon(getItemIcon(activity.type))}
                    <div className="font-semibold text-900 capitalize">
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
  const [newTag, setNewTag] = useState<string>('');
  const [detailData, setDetailData] = useState<ComponentDetailResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  const parseTags = (tagsString: string): string[] => {
    if (!tagsString) return [];
    try {
      const parsed = JSON.parse(tagsString);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      if (tagsString.includes(',')) {
        return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
      }
      return [tagsString.trim()].filter(tag => tag);
    }
    return [];
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      const tagToAdd = newTag.trim();
      if (!currentTags.includes(tagToAdd)) {
        const updatedTags = [...currentTags, tagToAdd];
        const tagsString = JSON.stringify(updatedTags);
        setEditData({
          ...editData,
          learning_object_tags: tagsString
        });
      }
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = currentTags.filter(tag => tag !== tagToRemove);
    const tagsString = JSON.stringify(updatedTags);
    setEditData({
      ...editData,
      learning_object_tags: tagsString
    });
  };

  const handleMultiSelectChange = (field: 'grade' | 'subject', value: any[]) => {
    setEditData({
      ...editData,
      [field]: value
    });
  };

  useEffect(() => {
    let cancelled = false;
    if (selectedDetails?.id) {
      setLoadingDetail(true);
      ApiService.getComponentDetail(selectedDetails.id)
        .then((data) => {
          if (!cancelled) setDetailData(data);
        })
        .catch((error) => {
          console.error('Failed to fetch learning object details:', error);
        })
        .finally(() => { 
          if (!cancelled) setLoadingDetail(false); 
        });
    }
    return () => { cancelled = true; };
  }, [selectedDetails?.id]);

  const learningObjectData = useMemo(() => {
    if (!detailData?.component?.learning_objects) return null;
    return detailData.component.learning_objects[0] || null;
  }, [detailData]);

  const topics: Topic[] = useMemo(() => {
    if (!learningObjectData || !Array.isArray(learningObjectData.topics)) return [];   
    const buildTopics: Topic[] = [];   
    learningObjectData.topics.forEach((topic: any) => {
      const activities: Activity[] = (topic.activities || []).map((activity: any) => ({
        id: activity.id,
        title: activity.name || activity.type,
        description: activity.description,
        type: activity.type,
        metadata: activity
      }));
      if (topic.name || activities.length > 0) {
        buildTopics.push({
          id: topic.id,
          title: topic.name || 'Unnamed Topic',
          description: topic.description,
          type: 'topic',
          activities
        });
      }
    });
    return buildTopics;
  }, [learningObjectData]);

  const currentTags = useMemo(() => {
    if (editMode) return parseTags(editData.learning_object_tags || ""); 
    const source = learningObjectData?.learning_object_tags || '';
    return parseTags(source);
  }, [editMode, editData.learning_object_tags, learningObjectData]);

  const getCurrentMultiSelectValues = useCallback((field: 'grade' | 'subject') => {
    if (editMode && editData[field]) {
      return Array.isArray(editData[field]) ? editData[field] : [editData[field]].filter(Boolean);
    }
    const source = learningObjectData?.[field] || '';
    if (Array.isArray(source)) return source;
    if (typeof source === 'string' && source) {
      try {
        const parsed = JSON.parse(source);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return source.split(',').map((v: string) => v.trim()).filter(Boolean);
      }
    }
    return [] as any[];
  }, [editMode, editData, learningObjectData]);

  const currentGrades = useMemo(() => getCurrentMultiSelectValues('grade'), [getCurrentMultiSelectValues]);
  const currentSubjects = useMemo(() => getCurrentMultiSelectValues('subject'), [getCurrentMultiSelectValues]);

  const getDisplayValue = (field: string): string => {
    if (editMode && editData[field]) return editData[field];
    const source = learningObjectData?.[field as keyof typeof learningObjectData] || selectedDetails?.[field] || '';
    return source;
  };

  return (
    <>
      {/* Character Voice */}
      <div className="col-12">
        <div className="p-3 border-1 border-200 border-round">
          <div className="font-semibold text-900 mb-2">Character Voice</div>
          <div className="text-900">
            {renderEditableField(
              'Character Voice',
              getDisplayValue('character_voice'),
              'character_voice'
            )}
          </div>
        </div>
      </div>

      {/* Name */}
      <div className="col-12">
        <div className="p-3 border-1 border-200 border-round">
          <div className="font-semibold text-900 mb-2">Name</div>
          <div className="text-900">
            {renderEditableField(
              'Name',
              getDisplayValue('name') || selectedDetails?.title || "",
              'name'
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="col-12">
        <div className="p-3 border-1 border-200 border-round">
          <div className="font-semibold text-900 mb-2">Description</div>
          <div className="text-900">
            {renderEditableField(
              'Description', 
              getDisplayValue('description'), 
              'description', 
              'textarea'
            )}
          </div>
        </div>
      </div>

      <div className="grid">
        {/* Grade and Subject in parallel columns */}
        <div className="col-12 md:col-6">
          <div className="p-3 border-1 border-200 border-round">
            <div className="font-semibold text-900 mb-2">Grade</div>
            <div className="text-900">
              {editMode ? (
                <MultiSelect
                  value={currentGrades}
                  options={gradeOptions}
                  onChange={(e) => handleMultiSelectChange('grade', e.value)}
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select grades..."
                  display="chip"
                  className="w-full"
                  showSelectAll={false}
                />
              ) : (
                <div>
                  {currentGrades && currentGrades.length > 0 ? (
                    currentGrades
                      .map((g: string) => 
                        g.replace(/_/g, ' ')
                         .replace(/\b\w/g, (c: string) => c.toUpperCase())
                      )
                      .join(', ')
                  ) : (
                    <span className="text-600">No grade selected</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subject - parallel to Grade */}
        <div className="col-12 md:col-6">
          <div className="p-3 border-1 border-200 border-round">
            <div className="font-semibold text-900 mb-2">Subject</div>
            <div className="text-900">
              {editMode ? (
                <MultiSelect
                  value={currentSubjects}
                  options={subjectOptions}
                  onChange={(e) => handleMultiSelectChange('subject', e.value)}
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select subjects..."
                  display="chip"
                  className="w-full"
                  showSelectAll={false}
                />
              ) : (
                <div>
                  {currentSubjects && currentSubjects.length > 0 ? (
                    currentSubjects
                      .map((s: string) => 
                        s.replace(/_/g, ' ')
                         .replace(/\b\w/g, (c: string) => c.toUpperCase())
                      )
                      .join(', ')
                  ) : (
                    <span className="text-600">No subject selected</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="col-12">
        <div className="p-3 border-1 border-200 border-round">
          <div className="font-semibold text-900 mb-2">Tags</div>
          <div className="text-900">
            {editMode ? (
              <div className="space-y-3">
                {/* Tag input field */}
                <div className="flex flex-column gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Type a tag and press Enter to add..."
                    className="p-inputtext p-component w-full border-1 surface-border border-round"
                  />
                </div>
                {/* Tags display area */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentTags.map((tag, index) => (
                    <div
                      key={index}
                      className="flex align-items-center bg-primary-100 text-primary-800 border-1 border-primary-200 border-round px-3 py-1"
                    >
                      <span className="text-sm font-medium">{tag}</span>
                      <Button
                        icon="pi pi-times"
                        text
                        rounded
                        severity="secondary"
                        className="ml-2 w-1rem h-1rem"
                        onClick={() => handleRemoveTag(tag)}
                        aria-label={`Remove tag ${tag}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {currentTags.length > 0 ? (
                  currentTags.map((tag, index) => (
                    <div
                      key={index}
                      className="flex align-items-center bg-primary-100 text-primary-800 border-1 border-primary-200 border-round px-3 py-1"
                    >
                      <span className="text-sm font-medium">{tag}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-600">No tags added</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Topics and Activities */}
      <div className="col-12">
        <div className="p-3 border-1 border-200 border-round">
          {loadingDetail ? (
            <div className="flex align-items-center gap-2 text-600">
              <LibraryBooks style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }} />
              <span>Loading lesson topics and activities…</span>
            </div>
          ) : (
            <TopicActivitiesViewer 
              topics={topics}
              onViewDetails={onOpenDetails}
              getItemIcon={getItemIcon}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default LessonDetail;