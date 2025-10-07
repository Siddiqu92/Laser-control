import React from 'react';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { BaseDetailProps, QuestionManagementProps } from '../../types/course-sidebar';

interface AssessmentDetailProps extends BaseDetailProps, QuestionManagementProps {}

const AssessmentDetail: React.FC<AssessmentDetailProps> = ({
  selectedDetails,
  editMode,
  editData,
  setEditData,
  renderEditableField,
  renderNumberField,
  getItemIcon,
  courseComponents,
  onUpdateQuestion,
  onDeleteQuestion
}) => {
  const findAssessmentData = () => {
    const assessmentName = selectedDetails?.name || selectedDetails?.title;
    let assessmentData = courseComponents?.assessments?.find((assessment: any) => 
      assessment.name === assessmentName || assessment.id === selectedDetails?.id
    );

    if (!assessmentData && selectedDetails?.id) {
      assessmentData = courseComponents?.assessments?.find((assessment: any) => 
        assessment.id === selectedDetails.id
      );
    }

    return assessmentData;
  };

  const assessmentData = findAssessmentData();

  return (
    <>
      {selectedDetails?.completed !== undefined && (
        <div className="col-12">
          <div className="surface-100 p-3 border-round mb-3">
            <div className="text-600 text-sm font-medium mb-2">Completed</div>
            <div className="text-900">
              <span className={`p-tag p-tag-${selectedDetails.completed ? 'success' : 'warning'}`}>
                {selectedDetails.completed ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="col-12">
        <div className="surface-100 p-3 border-round mb-3">
          <div className="text-600 text-sm font-medium mb-2">Description</div>
          <div className="text-900">
            {renderEditableField('Description', 
              selectedDetails.description || assessmentData?.description || "", 
              'description', 
              'textarea'
            )}
          </div>
        </div>
      </div>

      {assessmentData && (
        <div className="col-12">
          {/* Total Questions and Weightage side by side */}
          <div className="grid">
            <div className="col-12 md:col-6">
              <div className="surface-100 p-3 border-round mb-3">
                <div className="text-600 text-sm font-medium mb-2">Total Questions</div>
                <div className="text-900 font-semibold">
                  {assessmentData.total_questions || selectedDetails.question_count || 0}
                </div>
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="surface-100 p-3 border-round mb-3">
                <div className="text-600 text-sm font-medium mb-2">Weightage</div>
                <div className="text-900 font-semibold">
                  {renderNumberField('Weightage', 
                    selectedDetails.weightage || assessmentData.weight || 0, 
                    'weight'
                  )}%
                </div>
              </div>
            </div>
          </div>

          {/* Assessment Questions */}
          {assessmentData.questions && assessmentData.questions.length > 0 && (
            <div className="surface-100 p-3 border-round mb-3">
              <div className="text-600 text-sm font-medium mb-2">Assessment Questions ({assessmentData.questions.length})</div>
              <div className="space-y-2 max-h-20rem overflow-auto">
                {assessmentData.questions.map((question: any, index: number) => (
                  <div key={question.id} className="p-2 surface-200 border-round">
                    <div className="flex align-items-start gap-2">
                      <span className="text-600 text-sm min-w-2rem">{index + 1}.</span>
                      <div className="flex-1">
                        {editMode ? (
                          <InputTextarea
                            value={question.statement}
                            onChange={(e) => onUpdateQuestion(question.id, e.target.value, 'assessment')}
                            rows={2}
                            className="w-full"
                          />
                        ) : (
                          <div className="text-900 text-sm">{question.statement}</div>
                        )}
                      </div>
                      {editMode && (
                        <Button
                          icon="pi pi-trash"
                          className="p-button-danger p-button-text p-button-sm"
                          onClick={() => onDeleteQuestion(question.id, 'assessment')}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AssessmentDetail;