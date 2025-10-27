import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { BaseDetailProps, QuestionManagementProps } from '../../types/courseTypes';
import { Checkbox } from 'primereact/checkbox';

interface ActivitiesDetailProps extends BaseDetailProps, QuestionManagementProps {}

const ActivitiesDetail: React.FC<ActivitiesDetailProps> = ({
  selectedDetails,
  editMode,
  editData,
  setEditData,
  renderEditableField,
  getItemIcon,
  courseComponents,
  onUpdateQuestion,
  onDeleteQuestion
}) => {
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);
  
  const activityTypeOptions = [
    { label: 'Video', value: 'video' },
    { label: 'Practice Question', value: 'practice_questions' },
    { label: 'Image', value: 'image' },
    { label: 'PDF', value: 'pdf' },
    { label: 'Document', value: 'document' },
    { label: 'H5P', value: 'h5p' }
  ];
  const activityData = selectedDetails;


  const getAssetUrl = (fileId: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
   
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${normalizedBaseUrl}/assets/${fileId}`;
  };

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

  const VideoDisplay = ({ videoFile }: { videoFile: any }) => {
    if (!videoFile || !videoFile.id) return null;

    const videoUrl = getAssetUrl(videoFile.id);
    
    return (
      <div className="video-container mt-2">
        <video 
          controls 
          className="w-full border-round"
          style={{ maxHeight: '200px' }}
        >
          <source src={videoUrl} type={videoFile.type} />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  };

  const H5PDisplay = ({ h5pFile }: { h5pFile: any }) => {
    if (!h5pFile || !h5pFile.id) return null;

    const h5pUrl = getAssetUrl(h5pFile.id);
    
    return (
      <div className="h5p-container mt-2">
        <div className="p-3 border-1 border-200 border-round bg-surface-50">
          <div className="font-semibold text-900 mb-2">Interactive H5P File</div>
          <a 
            href={h5pUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary font-semibold"
          >
            Open Interactive Content ↗
          </a>
        </div>
      </div>
    );
  };

  const renderActivityTypeField = () => {
    if (editMode) {
      return (
        <Dropdown
          value={editData.type || selectedDetails.type}
          onChange={(e) => setEditData({ ...editData, type: e.value })}
          options={activityTypeOptions}
          optionLabel="label"
          className="w-full"
          placeholder="Select Activity Type"
        />
      );
    }   
    
    const activityType = selectedDetails?.type;
    switch (activityType) {
      case 'video':
        return 'Video';
      case 'h5p':
        return 'H5P';
      case 'practice_questions':
        return 'Practice Question';
      default:
        return activityType ? activityType.replace(/_/g, ' ') : '-';
    }
  };

  const renderCommonFields = () => (
    <>
      {/* Character Voice - First */}
      <div className="col-12">
        <div className="p-3 border-1 border-200 border-round">
          <div className="font-semibold text-900 mb-2">Character Voice</div>
          <div className="text-900">
            {renderEditableField('Character Voice', 
              selectedDetails.character_voice || "", 
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
      
      {/* Activity Type - Third */}
      <div className="col-12">
        <div className="p-3 border-1 border-200 border-round">
          <div className="font-semibold text-900 mb-2">Activity Type</div>
          <div className="text-900">
            {renderActivityTypeField()}
          </div>
        </div>
      </div>
      
      {/* Description - Fourth */}
      <div className="col-12">
        <div className="p-3 border-1 border-200 border-round">
          <div className="font-semibold text-900 mb-2">Description</div>
          <div className="text-900">
            {renderEditableField('Description', 
              selectedDetails.description || "", 
              'description', 
              'textarea'
            )}
          </div>
        </div>
      </div>
    </>
  );

  const renderURLFilePreview = () => {
    const file = selectedDetails?.file;
    if (!file) return null;
    
    return (
      <div className="col-12">
        <div className="p-3 border-1 border-200 border-round">
          <div className="font-semibold text-900 mb-2">URL / File Preview</div>
          <div className="text-900">
            <div className="font-semibold text-900 mb-1">
              <strong>File Name:</strong> {file.filename_download}
            </div>
            <div className="font-semibold text-900 mb-1">
              <strong>File Size:</strong> {formatFileSize(file.filesize)}
            </div>
            <div className="font-semibold text-900 mb-2">
              <strong>Type:</strong> {file.type}
            </div>
            {selectedDetails.type === 'video' && <VideoDisplay videoFile={file} />}
            {selectedDetails.type === 'h5p' && <H5PDisplay h5pFile={file} />}
          </div>
        </div>
      </div>
    );
  };

  const renderPracticeQuestions = () => {
    // Get questions directly from selectedDetails
    const questions = selectedDetails?.questions || [];
    
    if (questions.length === 0) {
      return (
        <div className="col-12">
          <div className="p-3 border-1 border-200 border-round">
            <div className="flex justify-content-between align-items-center">
              <div className="font-semibold text-900">Questions (0)</div>
              {editMode && (
                <Button
                  icon="pi pi-plus"
                  label="Add New Question"
                  className="p-button-primary p-button-sm"
                  onClick={() => onUpdateQuestion(0, 'practice', selectedDetails.id)}
                />
              )}
            </div>
            <div className="text-center p-4 text-600">
              No questions available for this activity.
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="col-12">
        <div className="p-3 border-1 border-200 border-round">
          <div className="flex justify-content-between align-items-center mb-3">
            <div className="font-semibold text-900">Questions ({questions.length})</div>
            {editMode && (
              <Button
                icon="pi pi-plus"
                label="Add New Question"
                className="p-button-primary p-button-sm"
                onClick={() => onUpdateQuestion(0, 'practice', selectedDetails.id)}
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
                            onDeleteQuestion(question.id, 'practice');
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
  return (
    <>
      {renderCommonFields()}
      {renderURLFilePreview()}
      {selectedDetails.type === 'practice_questions' && renderPracticeQuestions()}
    </>
  );
};

export default ActivitiesDetail;