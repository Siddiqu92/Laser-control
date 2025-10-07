"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { ApiService } from "@/service/api";
import LessonDetail from "../CourseSidebar/LessonDetail";
import TopicDetail from "../CourseSidebar/TopicDetail";
import ActivitiesDetail from "../CourseSidebar/ActivitiesDetail";
import AssessmentDetail from "../CourseSidebar/AssessmentDetail";
import ExamDetail from "../CourseSidebar/ExamDetail";
import { CourseDetailsSidebarProps } from "../../types/course-sidebar";

export default function CourseDetailsSidebar({
  visible,
  onHide,
  selectedDetails,
  detailsLoading,
  courseComponents,
  getItemIcon,
  parseJsonArrayToString,
  onUpdate,
  onOpenDetails
}: CourseDetailsSidebarProps) {
  const toast = useRef<Toast>(null);
  const [editMode, setEditMode] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [addQuestionDialog, setAddQuestionDialog] = useState(false);
  const [newQuestions, setNewQuestions] = useState<string[]>(['']);
  const [deleteQuestionDialog, setDeleteQuestionDialog] = useState({ 
    visible: false, 
    questionId: '', 
    questionType: '' as 'assessment' | 'exam' | 'practice' | '' 
  });

  // NESTED SIDEBAR STATE - YEH ADD KARNA HAI
  const [nestedSidebarVisible, setNestedSidebarVisible] = useState(false);
  const [nestedDetails, setNestedDetails] = useState<any>(null);

  console.log("🚀 CourseDetailsSidebar - onOpenDetails prop:", onOpenDetails);

  // NESTED SIDEBAR OPEN KARNE KA FUNCTION - YEH ADD KARNA HAI
  const handleOpenNestedDetails = (item: any) => {
    console.log("🎯 Opening nested sidebar for:", item);
    setNestedDetails(item);
    setNestedSidebarVisible(true);
  };

  const gradeOptions = [
    { label: 'Kindergarten', value: 'kindergarten' },
    { label: 'Grade 1', value: 'grade_1' },
    { label: 'Grade 2', value: 'grade_2' },
    { label: 'Grade 3', value: 'grade_3' },
    { label: 'Grade 4', value: 'grade_4' },
    { label: 'Grade 5', value: 'grade_5' }
  ];

  const subjectOptions = [
    { label: 'Mathematics', value: 'mathematics' },
    { label: 'Science', value: 'science' },
    { label: 'English', value: 'english' }
  ];

  useEffect(() => {
    if (selectedDetails) {
      setEditData({
        name: selectedDetails.name || selectedDetails.title || '',
        description: selectedDetails.description || '',
        grade: selectedDetails.grade || '',
        subject: selectedDetails.subject || '',
        character_voice: selectedDetails.character_voice || '',
        learning_object_tags: selectedDetails.learning_object_tags || '',
        weight: selectedDetails.weight || selectedDetails.weightage || 0,
        time_limit: selectedDetails.time_limit || 0,
        passing_score: selectedDetails.passing_score || 0
      });
    }
    setEditMode(false);
  }, [selectedDetails]);

  const showToast = (severity: 'success' | 'error' | 'warn', summary: string, detail: string) => {
    if (toast.current) {
      toast.current.show({ severity, summary, detail, life: 3000 });
    }
  };

  const handleSave = async () => {
    if (!selectedDetails) return;

    try {
      setEditLoading(true);
      let response;

      switch (selectedDetails.type) {
        case 'learning_object':
          response = await ApiService.updateLearningObject(selectedDetails.id, {
            name: editData.name,
            description: editData.description,
            grade: editData.grade,
            subject: editData.subject,
            character_voice: editData.character_voice,
            learning_object_tags: editData.learning_object_tags
          });
          break;

        case 'topic':
          response = await ApiService.updateTopic(selectedDetails.id, {
            name: editData.name,
            description: editData.description,
            character_voice: editData.character_voice
          });
          break;

        case 'video':
        case 'practice_questions':
        case 'h5p':
          response = await ApiService.updateActivity(selectedDetails.id, {
            name: editData.name,
            description: editData.description,
            character_voice: editData.character_voice
          });
          break;

        case 'assessment':
          response = await ApiService.updateAssessment(selectedDetails.id, {
            name: editData.name,
            description: editData.description,
            weight: Number(editData.weight),
            time_limit: Number(editData.time_limit),
            passing_score: Number(editData.passing_score)
          });
          break;

        case 'exam':
          response = await ApiService.updateExam(selectedDetails.id, {
            name: editData.name,
            description: editData.description,
            weight: Number(editData.weight),
            time_limit: Number(editData.time_limit),
            passing_score: Number(editData.passing_score)
          });
          break;

        default:
          throw new Error('Unsupported type for editing');
      }

      showToast('success', 'Success', `${selectedDetails.type.replace('_', ' ')} updated successfully`);
      setEditMode(false);
      onUpdate?.();
    } catch (error) {
      console.error('Failed to update:', error);
      showToast('error', 'Error', 'Failed to update item');
    } finally {
      setEditLoading(false);
    }
  };

  const handleUpdateQuestion = async (questionId: number, statement: string, questionType: 'assessment' | 'exam' | 'practice') => {
    try {
      let response;
      switch (questionType) {
        case 'assessment':
          response = await ApiService.updateAssessmentQuestion(questionId, { statement });
          break;
        case 'exam':
          response = await ApiService.updateExamQuestion(questionId, { statement });
          break;
        case 'practice':
          response = await ApiService.updatePracticeQuestion(questionId, { statement });
          break;
      }
      showToast('success', 'Success', 'Question updated successfully');
      onUpdate?.();
    } catch (error) {
      console.error('Failed to update question:', error);
      showToast('error', 'Error', 'Failed to update question');
    }
  };

  const handleAddQuestions = async () => {
    if (!selectedDetails) return;

    try {
      const questionsToAdd = newQuestions.filter(q => q.trim()).map(statement => ({ statement }));
      
      if (questionsToAdd.length === 0) {
        showToast('warn', 'Warning', 'Please enter at least one question');
        return;
      }

      let questionType: 'assessment' | 'exam' | 'practice';
      switch (selectedDetails.type) {
        case 'assessment':
          questionType = 'assessment';
          break;
        case 'exam':
          questionType = 'exam';
          break;
        case 'practice_questions':
          questionType = 'practice';
          break;
        default:
          throw new Error('Cannot add questions to this item type');
      }

      await ApiService.addQuestions(questionType, selectedDetails.id, questionsToAdd);
      
      showToast('success', 'Success', `${questionsToAdd.length} question(s) added successfully`);
      setAddQuestionDialog(false);
      setNewQuestions(['']);
      onUpdate?.();
    } catch (error) {
      console.error('Failed to add questions:', error);
      showToast('error', 'Error', 'Failed to add questions');
    }
  };

  const handleDeleteQuestion = async () => {
    try {
      if (!deleteQuestionDialog.questionType || !deleteQuestionDialog.questionId) {
        showToast('error', 'Error', 'Invalid question data');
        return;
      }

      await ApiService.deleteQuestion(
        deleteQuestionDialog.questionType,
        deleteQuestionDialog.questionId
      );
      
      showToast('success', 'Success', 'Question deleted successfully');
      setDeleteQuestionDialog({ visible: false, questionId: '', questionType: '' });
      onUpdate?.();
    } catch (error) {
      console.error('Failed to delete question:', error);
      showToast('error', 'Error', 'Failed to delete question');
    }
  };

  const addNewQuestionField = () => {
    setNewQuestions([...newQuestions, '']);
  };

  const removeQuestionField = (index: number) => {
    const updatedQuestions = newQuestions.filter((_, i) => i !== index);
    setNewQuestions(updatedQuestions);
  };

  const updateQuestionField = (index: number, value: string) => {
    const updatedQuestions = [...newQuestions];
    updatedQuestions[index] = value;
    setNewQuestions(updatedQuestions);
  };

  const renderEditableField = (label: string, value: string, field: string, type: 'text' | 'textarea' = 'text') => {
    if (editMode) {
      if (type === 'textarea') {
        return (
          <InputTextarea
            value={editData[field] || ''}
            onChange={(e) => setEditData({ ...editData, [field]: e.target.value })}
            rows={3}
            className="w-full"
          />
        );
      }
      return (
        <InputText
          value={editData[field] || ''}
          onChange={(e) => setEditData({ ...editData, [field]: e.target.value })}
          className="w-full"
        />
      );
    }
    return value || "-";
  };

  const renderDropdownField = (label: string, value: string, field: string, options: any[]) => {
    if (editMode) {
      return (
        <Dropdown
          value={editData[field] || ''}
          onChange={(e) => setEditData({ ...editData, [field]: e.value })}
          options={options}
          className="w-full"
          placeholder={`Select ${label}`}
        />
      );
    }
    return value ? parseJsonArrayToString(value, field as any) : "-";
  };

  const renderNumberField = (label: string, value: number, field: string) => {
    if (editMode) {
      return (
        <InputText
          type="number"
          value={editData[field] || ''}
          onChange={(e) => setEditData({ ...editData, [field]: e.target.value })}
          className="w-full"
        />
      );
    }
    return value || value === 0 ? value : "-";
  };

  const renderDetailContent = () => {
    const commonProps = {
      selectedDetails,
      editMode,
      editData,
      setEditData,
      renderEditableField,
      renderDropdownField,
      renderNumberField,
      getItemIcon,
      courseComponents,
      onOpenDetails: handleOpenNestedDetails // YAHAN CHANGE KARO - nested sidebar open karo
    };

    switch (selectedDetails?.type) {
      case 'learning_object':
        return (
          <LessonDetail
            {...commonProps}
            gradeOptions={gradeOptions}
            subjectOptions={subjectOptions}
            parseJsonArrayToString={parseJsonArrayToString}
          />
        );
      case 'topic':
        return <TopicDetail {...commonProps} />;
      case 'video':
      case 'practice_questions':
      case 'h5p':
        return <ActivitiesDetail {...commonProps} />;
      case 'assessment':
        return (
          <AssessmentDetail
            questions={[]} 
            {...commonProps}
            onUpdateQuestion={handleUpdateQuestion}
            onDeleteQuestion={(questionId) => setDeleteQuestionDialog({
              visible: true,
              questionId,
              questionType: 'assessment'
            })}
          />
        );
      case 'exam':
        return (
          <ExamDetail
            questions={[]} 
            {...commonProps}
            onUpdateQuestion={handleUpdateQuestion}
            onDeleteQuestion={(questionId) => setDeleteQuestionDialog({
              visible: true,
              questionId,
              questionType: 'exam'
            })}
          />
        );
      default:
        return null;
    }
  };
// NESTED SIDEBAR CONTENT RENDER KARNE KA FUNCTION
const renderNestedContent = () => {
  const commonProps = {
    selectedDetails: nestedDetails,
    editMode: false,
    editData: {},
    setEditData: () => {},
    renderEditableField: (label: string, value: string, field: string, type: 'text' | 'textarea' = 'text') => {
      return value || "-";
    },
    renderDropdownField: () => <div />,
    renderNumberField: () => <div />,
    getItemIcon,
    courseComponents,
    onOpenDetails: handleOpenNestedDetails 
  };

  switch (nestedDetails?.type) {
    case 'topic':
      return <TopicDetail {...commonProps} />;
    case 'video':
    case 'practice_questions':
    case 'h5p':
      return <ActivitiesDetail {...commonProps} />;
    default:
      return (
        <div className="p-3">
          <h3>{nestedDetails?.title || 'Details'}</h3>
          <p>Type: {nestedDetails?.type}</p>
          <p>ID: {nestedDetails?.id}</p>
          {nestedDetails?.description && (
            <p>Description: {nestedDetails.description}</p>
          )}
        </div>
      );
  }
};
  return (
    <>
      <Toast ref={toast} />
      
      {/* MAIN SIDEBAR */}
      <Sidebar
        visible={visible}
        position="right"
        onHide={onHide}
        className="p-sidebar-md"
        style={{ width: '45rem', zIndex: 1000 }}
      >
        <div className="flex align-items-center justify-content-between mb-3">
          <div className="text-xl font-bold">
            {selectedDetails?.type === 'learning_object' ? 'Lesson Details' : 
             selectedDetails?.type === 'topic' ? 'Topic Details' : 
             selectedDetails?.type === 'assessment' ? 'Assessment Details' :
             selectedDetails?.type === 'exam' ? 'Exam Details' :
             selectedDetails?.type === 'video' ? 'Video Activity' :
             selectedDetails?.type === 'practice_questions' ? 'Practice Activity' :
             selectedDetails?.type === 'h5p' ? 'Interactive Video' :
             'Item Details'}
          </div>
          {!editMode ? (
            <Button
              icon="pi pi-pencil"
              label="Edit"
              className="p-button-outlined p-button-sm"
              onClick={() => setEditMode(true)}
            />
          ) : (
            <div className="flex gap-2">
              <Button
                icon="pi pi-times"
                label="Cancel"
                className="p-button-text p-button-sm"
                onClick={() => setEditMode(false)}
              />
              <Button
                icon="pi pi-check"
                label="Save"
                className="p-button-sm"
                loading={editLoading}
                onClick={handleSave}
              />
            </div>
          )}
        </div>
        
        <div className="surface-0">
          {detailsLoading ? (
            <div className="flex align-items-center gap-2 text-600">
              <i className="pi pi-spin pi-spinner"></i>
              <span>Loading details...</span>
            </div>
          ) : (
            <div className="grid">
              {/* Common Fields for All Types */}
              <div className="col-12">
                <div className="surface-100 p-3 border-round mb-3">
                  <div className="text-600 text-sm font-medium mb-2">Name</div>
                  <div className="text-900 font-semibold">
                    {renderEditableField('Name', selectedDetails?.title || selectedDetails?.name || "No name available", 'name')}
                  </div>
                </div>
              </div>

              {renderDetailContent()}

              {/* Last Accessed */}
              {selectedDetails?.last_accessed && (
                <div className="col-12">
                  <div className="surface-100 p-3 border-round mb-3">
                    <div className="text-600 text-sm font-medium mb-2">Last Accessed</div>
                    <div className="text-900">
                      {new Date(selectedDetails.last_accessed).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Sidebar>

      {/* NESTED SIDEBAR - YEH ADD KARNA HAI */}
      <Sidebar
        visible={nestedSidebarVisible}
        position="right"
        onHide={() => setNestedSidebarVisible(false)}
        style={{ 
          width: '40rem', 
          zIndex: 1001 
        }}
      >
        <div className="flex align-items-center justify-content-between mb-3">
          <div className="text-xl font-bold">
            {nestedDetails?.type === 'topic' ? 'Topic Details' : 
             nestedDetails?.type === 'video' ? 'Video Activity' :
             nestedDetails?.type === 'practice_questions' ? 'Practice Activity' :
             nestedDetails?.type === 'h5p' ? 'Interactive Video' :
             'Activity Details'}
          </div>
        
        </div>

        <div className="surface-0">
          {renderNestedContent()}
        </div>
      </Sidebar>

      {/* Add Questions Dialog */}
      <Dialog
        header="Add New Questions"
        visible={addQuestionDialog}
        style={{ width: '50vw' }}
        onHide={() => setAddQuestionDialog(false)}
      >
        <div className="space-y-3">
          {newQuestions.map((question, index) => (
            <div key={index} className="flex gap-2 align-items-start">
              <span className="text-600 text-sm mt-2">{index + 1}.</span>
              <InputTextarea
                value={question}
                onChange={(e) => updateQuestionField(index, e.target.value)}
                rows={2}
                className="flex-1"
                placeholder="Enter question statement..."
              />
              {newQuestions.length > 1 && (
                <Button
                  icon="pi pi-times"
                  className="p-button-danger p-button-text p-button-sm mt-2"
                  onClick={() => removeQuestionField(index)}
                />
              )}
            </div>
          ))}
          <Button
            icon="pi pi-plus"
            label="Add Another Question"
            className="p-button-outlined p-button-sm"
            onClick={addNewQuestionField}
          />
          <div className="flex justify-content-end gap-2 mt-3">
            <Button
              label="Cancel"
              className="p-button-text"
              onClick={() => setAddQuestionDialog(false)}
            />
            <Button
              label="Add Questions"
              icon="pi pi-check"
              onClick={handleAddQuestions}
            />
          </div>
        </div>
      </Dialog>

      {/* Delete Question Confirmation Dialog */}
      <Dialog
        header="Confirm Delete"
        visible={deleteQuestionDialog.visible}
        style={{ width: '30vw' }}
        onHide={() => setDeleteQuestionDialog({ visible: false, questionId: '', questionType: '' })}
      >
        <div className="confirmation-content">
          <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
          <span>Are you sure you want to delete this question?</span>
        </div>
        <div className="flex justify-content-end gap-2 mt-3">
          <Button
            label="No"
            className="p-button-text"
            onClick={() => setDeleteQuestionDialog({ visible: false, questionId: '', questionType: '' })}
          />
          <Button
            label="Yes"
            icon="pi pi-check"
            className="p-button-danger"
            onClick={handleDeleteQuestion}
          />
        </div>
      </Dialog>
    </>
  );
}