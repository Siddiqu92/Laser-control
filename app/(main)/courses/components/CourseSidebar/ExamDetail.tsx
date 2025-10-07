import React from 'react';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { BaseDetailProps, QuestionManagementProps } from '../../types/course-sidebar';

interface ExamDetailProps extends BaseDetailProps, QuestionManagementProps {}

const ExamDetail: React.FC<ExamDetailProps> = ({
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
  const findExamData = () => {
    const examName = selectedDetails?.name || selectedDetails?.title;
    let examData = courseComponents?.exams?.find((exam: any) => 
      exam.name === examName || exam.id === selectedDetails?.id
    );
    if (!examData && selectedDetails?.id) {
      examData = courseComponents?.exams?.find((exam: any) => 
        exam.id === selectedDetails.id
      );
    }

    return examData;
  };

  const examData = findExamData();

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
              selectedDetails.description || examData?.description || "", 
              'description', 
              'textarea'
            )}
          </div>
        </div>
      </div>

      {examData && (
        <div className="col-12">
          {/* Total Questions and Weightage side by side */}
          <div className="grid">
            <div className="col-12 md:col-6">
              <div className="surface-100 p-3 border-round mb-3">
                <div className="text-600 text-sm font-medium mb-2">Total Questions</div>
                <div className="text-900 font-semibold">
                  {examData.total_questions || selectedDetails.question_count || 0}
                </div>
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="surface-100 p-3 border-round mb-3">
                <div className="text-600 text-sm font-medium mb-2">Weightage</div>
                <div className="text-900 font-semibold">
                  {renderNumberField('Weightage', 
                    selectedDetails.weightage || examData.weight || 0, 
                    'weight'
                  )}%
                </div>
              </div>
            </div>
          </div>

          {/* Exam Questions */}
          {examData.questions && examData.questions.length > 0 && (
            <div className="surface-100 p-3 border-round mb-3">
              <div className="text-600 text-sm font-medium mb-2">Exam Questions ({examData.questions.length})</div>
              <div className="space-y-2 max-h-20rem overflow-auto">
                {examData.questions.map((question: any, index: number) => (
                  <div key={question.id} className="p-2 surface-200 border-round">
                    <div className="flex align-items-start gap-2">
                      <span className="text-600 text-sm min-w-2rem">{index + 1}.</span>
                      <div className="flex-1">
                        {editMode ? (
                          <InputTextarea
                            value={question.statement}
                            onChange={(e) => onUpdateQuestion(question.id, e.target.value, 'exam')}
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
                          onClick={() => onDeleteQuestion(question.id, 'exam')}
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

export default ExamDetail;