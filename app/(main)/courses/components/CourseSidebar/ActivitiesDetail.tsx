import React from 'react';
import { BaseDetailProps } from '../../types/course-sidebar';

const ActivitiesDetail: React.FC<BaseDetailProps> = ({
  selectedDetails,
  editMode,
  editData,
  setEditData,
  renderEditableField,
  getItemIcon,
  courseComponents
}) => {
  const findActivityData = () => {
    if (!courseComponents?.learning_objects) return null;
    
    let activityData: any = null;
    
    courseComponents.learning_objects.forEach((lo: any) => {
      lo.topics?.forEach((topicGroup: any) => {
        topicGroup.topics?.forEach((topic: any) => {
          topic.activities?.forEach((activity: any) => {
            if (activity.id === selectedDetails?.id) {
              activityData = activity;
            }
          });
        });
      });
    });

    return activityData;
  };

  const activityData = findActivityData();

  return (
    <>
      <div className="col-12">
        <div className="surface-100 p-3 border-round mb-3">
          <div className="text-600 text-sm font-medium mb-2">Activity Type</div>
          <div className="text-900 capitalize">
            {selectedDetails.type === 'video' ? 'Video Lesson' :
             selectedDetails.type === 'practice_questions' ? 'Practice Activity' :
             selectedDetails.type === 'h5p' ? 'Interactive Video' : selectedDetails.type}
          </div>
        </div>
      </div>

      <div className="col-12">
        <div className="surface-100 p-3 border-round mb-3">
          <div className="text-600 text-sm font-medium mb-2">Description</div>
          <div className="text-900">
            {renderEditableField('Description', 
              selectedDetails.description || activityData?.description || "", 
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
              selectedDetails.character_voice || activityData?.character_voice || "", 
              'character_voice'
            )}
          </div>
        </div>
      </div>

      {/* Questions for Practice Activities */}
      {selectedDetails?.type === 'practice_questions' && activityData?.questions && activityData.questions.length > 0 && (
        <div className="col-12">
          <div className="surface-100 p-3 border-round mb-3">
            <div className="text-600 text-sm font-medium mb-2">Practice Questions ({activityData.questions.length})</div>
            <div className="space-y-2 max-h-20rem overflow-auto">
              {activityData.questions.map((question: any, index: number) => (
                <div key={question.id} className="p-2 surface-200 border-round">
                  <div className="flex align-items-start gap-2">
                    <span className="text-600 text-sm min-w-2rem">{index + 1}.</span>
                    <div className="flex-1">
                      <div className="text-900 text-sm">{question.statement}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ActivitiesDetail;