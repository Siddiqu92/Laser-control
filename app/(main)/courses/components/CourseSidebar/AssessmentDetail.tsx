import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { BaseDetailProps, QuestionManagementProps } from '../../types/courseTypes';

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
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);

  const getAssetUrl = (fileId: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';

    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    return `${cleanBaseUrl}/assets/${fileId}`;
  };

  const getAssessmentData = () => {
    if (selectedDetails?.component?.assessment) {
      return {
        ...selectedDetails.component.assessment,
        id: selectedDetails.component.id,
        type: selectedDetails.component.type
      };
    }
    else if (selectedDetails?.assessment) {
      return selectedDetails.assessment;
    }
    else {
      return selectedDetails;
    }
  };

  const assessmentData = getAssessmentData();

  const toggleQuestion = (index: number) => {
    setExpandedQuestions(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const isQuestionExpanded = (index: number) => expandedQuestions.includes(index);

  const getQuestionTypeText = (questionType: string) => {
    const types: any = {
      multiple_choice: 'Multiple Choice',
      true_false: 'True/False',
      fill_in_the_blanks: 'Fill in Blanks',
      short_answer: 'Short Answer'
    };
    return types[questionType] || questionType;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getCorrectAnswerText = (question: any) => {
    if (!question.correct_answer) return null;
    
    if (question.question_type === 'multiple_choice' && question.options) {
      const correctOption = question.options.find((option: any) => 
        option.id === question.correct_answer || option.is_correct
      );
      return correctOption ? correctOption.text : question.correct_answer;
    }
    if (question.question_type === 'true_false') {
      return question.correct_answer === true || question.correct_answer === 'true' ? 'True' : 'False';
    }
    return question.correct_answer;
  };

  const ImageDisplay = ({ image, alt, className = "" }: { image: any, alt: string, className?: string }) => {
    if (!image || !image.id) return null;
    
    const imageUrl = getAssetUrl(image.id);
    
    return (
      <div className={`image-container mt-2 ${className}`}>
        <img 
          src={imageUrl} 
          alt={alt}
          className="border-round shadow-1"
          style={{ 
            width: '100%',
            maxWidth: '400px',
            height: 'auto',
            objectFit: 'contain',
            display: 'block',
            margin: '0 auto'
          }}
          onError={(e) => {
            console.log('Image failed to load:', imageUrl);
            (e.target as HTMLImageElement).style.display = 'none';
          }}
          onLoad={(e) => {
            console.log('Image loaded successfully:', imageUrl);
          }}
        />
      </div>
    );
  };

  const renderQuestions = () => {
    const questions = assessmentData?.questions || [];
    if (questions.length === 0) {
      return (
        <div className="col-12">
          <div className="p-3 border-1 border-200 border-round">
            <div className="flex justify-content-between align-items-center">
              <div className="font-semibold text-900">Assessment Questions (0)</div>
              {editMode && (
                <Button
                  icon="pi pi-plus"
                  label="Add New Question"
                  className="p-button-primary p-button-sm"
                  onClick={() => onUpdateQuestion(0, 'assessment', assessmentData.id)}
                />
              )}
            </div>
            <div className="text-center p-4 text-600">
              No questions available for this assessment.
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="col-12">
        <div className="p-3 border-1 border-200 border-round">
          <div className="flex justify-content-between align-items-center mb-3">
            <div className="font-semibold text-900">Assessment Questions ({questions.length})</div>
            {editMode && (
              <Button
                icon="pi pi-plus"
                label="Add New Question"
                className="p-button-primary p-button-sm"
                onClick={() => onUpdateQuestion(0, 'assessment', assessmentData.id)}
              />
            )}
          </div>
          <div className="space-y-4">
            {questions.map((question: any, index: number) => {
              const correctAnswerText = getCorrectAnswerText(question);       
              return (
                <div key={question.id || index} className="border-1 border-200 border-round">
                  <div 
                    className="p-3 cursor-pointer bg-surface-50 border-bottom-1 border-200"
                    onClick={() => toggleQuestion(index)}
                  >
                    <div className="flex align-items-start gap-3">
                      <Button
                        icon={`pi pi-chevron-${isQuestionExpanded(index) ? 'down' : 'right'}`}
                        className="p-button-text p-button-sm p-0"
                        style={{ width: '1.5rem', height: '1.5rem' }}
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-900 mb-2">
                          Question {index + 1}: {question.statement || question.question}
                        </div>
                        <div className="flex align-items-center gap-3">
                          <span className="font-semibold text-900 bg-primary-100 px-2 py-1 border-round">
                            {getQuestionTypeText(question.question_type)}
                          </span>
                        </div>
                      </div>
                      {editMode && (
                        <Button
                          icon="pi pi-trash"
                          className="p-button-danger p-button-text p-button-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteQuestion(question.id, 'assessment');
                          }}
                        />
                      )}
                    </div>
                  </div>
                  {isQuestionExpanded(index) && (
                    <div className="p-3 bg-surface-0">
                      {/* Question Image */}
                      {question.image && (
                        <div className="mb-4">
                          <div className="font-semibold text-900 mb-2">Question Image:</div>
                          <ImageDisplay 
                            image={question.image} 
                            alt={`Question ${index + 1}`}
                          />
                        </div>
                      )}                     
                      {/* Options for Multiple Choice */}
                      {(question.options && question.options.length > 0) && (
                        <div className="mb-4">
                          <div className="flex justify-content-between align-items-center mb-4">
                            <div className="font-semibold text-900">Options:</div>
                            {correctAnswerText && (
                              <div className="flex align-items-center gap-2 text-green-600 font-semibold">
                                <span>Correct Answer: {correctAnswerText}</span>
                              </div>
                            )}
                          </div>
                          <div className="p-3 border-1 border-200 border-round bg-surface-50">
                            <div className="space-y-4">
                              {question.options.map((option: any, optIndex: number) => (
                                <div 
                                  key={option.id || optIndex} 
                                  className={`p-3 border-round ${
                                    option.is_correct 
                                      ? 'bg-green-50 border-green-500 border-1' 
                                      : 'bg-white border-200 border-1'
                                  }`}
                                  style={{ margin: '4px 0' }}
                                >
                                  <div className="flex align-items-start gap-3">
                                    <div className="flex-1">
                                      <div className={`font-semibold ${
                                        option.is_correct ? 'text-green-700' : 'text-900'
                                      }`}>
                                        {String.fromCharCode(65 + optIndex)}. {option.text || 'No text provided'}
                                      </div>
                                      {option.image && (
                                        <ImageDisplay 
                                          image={option.image} 
                                          alt={`Option ${String.fromCharCode(65 + optIndex)}`}
                                          className="mt-2"
                                        />
                                      )}
                                    </div>
                                    <div className="flex-shrink-0">
                                      {option.is_correct ? (
                                        <i className="pi pi-check-circle text-green-500 text-lg"></i>
                                      ) : (
                                        <i className="pi pi-circle text-400 text-lg"></i>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}                             
                      {/* True/False or other question types without options */}
                      {(!question.options || question.options.length === 0) && correctAnswerText && (
                        <div className="mb-4">
                          <div className="flex justify-content-between align-items-center mb-4">
                            <div className="font-semibold text-900">
                              {question.question_type === 'true_false' ? 'Select Correct Answer:' : 'Answer:'}
                            </div>
                            <div className="flex align-items-center gap-2 text-green-600 font-semibold">
                              <span>Correct Answer: {correctAnswerText}</span>
                            </div>
                          </div>
                          {question.question_type === 'true_false' && (
                            <div className="p-3 border-1 border-200 border-round bg-surface-50">
                              <div className="flex gap-4">
                                <div className={`p-3 border-1 border-round flex-1 text-center ${
                                  correctAnswerText === 'True' 
                                    ? 'border-green-500 bg-green-100 text-green-700 font-semibold' 
                                    : 'border-200 bg-white text-600'
                                }`}>
                                  <div className="flex align-items-center justify-content-center gap-2">
                                    <span className="font-semibold">True</span>
                                    {correctAnswerText === 'True' && (
                                      <i className="pi pi-check-circle text-green-500 text-lg"></i>
                                    )}
                                  </div>
                                </div>
                                <div className={`p-3 border-1 border-round flex-1 text-center ${
                                  correctAnswerText === 'False' 
                                    ? 'border-green-500 bg-green-100 text-green-700 font-semibold' 
                                    : 'border-200 bg-white text-600'
                                }`}>
                                  <div className="flex align-items-center justify-content-center gap-2">
                                    <span className="font-semibold">False</span>
                                    {correctAnswerText === 'False' && (
                                      <i className="pi pi-check-circle text-green-500 text-lg"></i>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}                
                     {/* Explanation */}
                      {question.explanation && (
                        <div className="p-3 border-1 border-200 border-round bg-surface-50">
                          <div className="font-semibold text-900 mb-2">Explanation:</div>
                          <div className="p-3 bg-white border-round font-semibold text-900">
                            {question.explanation}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {index < questions.length - 1 && (
                    <hr className="border-1 border-200 my-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (!assessmentData) {
    return (
      <div className="col-12">
        <div className="p-3 text-center text-600">
          No assessment data available.
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Character Voice (if available in selection) */}
      {selectedDetails?.character_voice && (
        <div className="col-12">
          <div className="p-3 border-1 border-200 border-round">
            <div className="font-semibold text-900 mb-2">Character Voice</div>
            <div className="text-900">
              {renderEditableField('Character Voice', selectedDetails.character_voice, 'character_voice')}
            </div>
          </div>
        </div>
      )}
      {/* Name - First */}
      <div className="col-12">
        <div className="p-3 border-1 border-200 border-round">
          <div className="font-semibold text-900 mb-2">Name</div>
          <div className="text-900">
            {renderEditableField('Name', 
              assessmentData.name || assessmentData.title || "", 
              'name'
            )}
          </div>
        </div>
      </div>
      {/* Weight - Second */}
      <div className="col-12">
        <div className="p-3 border-1 border-200 border-round">
          <div className="font-semibold text-900 mb-2">Weight</div>
          <div className="text-900">
            {editMode ? (
              <div className="p-inputgroup">
                {renderNumberField('Weight', 
                  assessmentData.weight || 0, 
                  'weight'
                )}
                <span className="p-inputgroup-addon bg-primary text-white font-semibold">%</span>
              </div>
            ) : (
              <div className="flex align-items-center gap-2">
                <span>{assessmentData.weight || 0}</span>
                <span className="text-600 font-semibold">%</span>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Description - Third */}
      <div className="col-12">
        <div className="p-3 border-1 border-200 border-round">
          <div className="font-semibold text-900 mb-2">Description</div>
          <div className="text-900">
            {renderEditableField('Description', 
              assessmentData.description || "", 
              'description', 
              'textarea'
            )}
          </div>
        </div>
      </div>

      {/* Questions Section */}
      {renderQuestions()}
    </>
  );
};

export default AssessmentDetail;