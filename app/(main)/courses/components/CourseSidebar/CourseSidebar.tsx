"use client";
import React, { useState, useRef, useEffect } from "react";
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Dialog} from "primereact/dialog";
import { MultiSelect } from "primereact/multiselect";
import { Toast } from "primereact/toast";
import { ApiService } from "@/service/api";
import LessonDetail from "../CourseSidebar/LessonDetail";
import TopicDetail from "../CourseSidebar/TopicDetail";
import ActivitiesDetail from "../CourseSidebar/ActivitiesDetail";
import AssessmentDetail from "../CourseSidebar/AssessmentDetail";
import ExamDetail from "../CourseSidebar/ExamDetail";
import { CourseDetailsSidebarProps } from "../../types/courseTypes";

// Material UI Icons
import PlayLessonIcon from '@mui/icons-material/PlayLesson';
import QuizIcon from '@mui/icons-material/Quiz';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import CategoryIcon from '@mui/icons-material/Category';
import GradingIcon from '@mui/icons-material/Grading';
import StarIcon from '@mui/icons-material/Star';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import WarningIcon from '@mui/icons-material/Warning';

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
  const [, setWindowWidth] = useState(0);
  const [addQuestionDialog, setAddQuestionDialog] = useState(false);
  const [newQuestions, setNewQuestions] = useState<string[]>(['']);
  const [deleteQuestionDialog, setDeleteQuestionDialog] = useState({ 
    visible: false, 
    questionId: '', 
    questionType: '' as 'assessment' | 'exam' | 'practice' | '' 
  });
  const [nestedSidebarVisible, setNestedSidebarVisible] = useState(false);
  const [nestedDetails, setNestedDetails] = useState<any>(null);
  const [nestedEditMode, setNestedEditMode] = useState(false);
  const [nestedEditLoading, setNestedEditLoading] = useState(false);
  const [nestedEditData, setNestedEditData] = useState<any>({});
  const [nestedHistory, setNestedHistory] = useState<any[]>([]);

  const transformDetailsForSidebar = (details: any) => {
    if (!details) return null;
    if (details.component) {
      const component = details.component;
      return {
        ...details,
        id: component.id,
        name: component.name,
        description: component.description,
        type: component.type,
        learning_objects: component.learning_objects,
        assessment: component.assessment,
        exam: component.exam
      };
    } else if (details.activity) {
      const activity = details.activity;
      return {
        ...details,
        id: activity.id,
        name: activity.name,
        description: activity.description,
        type: activity.type,
        file: activity.file,
        character_voice: activity.character_voice,
        questions: activity.questions
      };
    } else if (details.topic) {
      const topic = details.topic;
      return {
        ...details,
        id: topic.id,
        name: topic.name,
        description: topic.description,
        type: 'topic',
        character_voice: topic.character_voice,
        activities: topic.activities
      };
    }
    return details;
  };

  const handleMainHide = () => {
    setNestedSidebarVisible(false);
    setNestedDetails(null);
    setNestedHistory([]);
    onHide?.();
  };

  const handleOpenNestedDetails = async (item: any) => {
    setNestedHistory(prev => (nestedSidebarVisible && nestedDetails ? [...prev, nestedDetails] : []));
    try {
      let nestedDetailData: any = null;
      const type = (item?.type || '').toLowerCase();
      switch (type) {
        case 'learning_object':
        case 'assessment':
        case 'exam':
          nestedDetailData = await ApiService.getComponentDetail(item.id);
          break;
        case 'activity':
        case 'video':
        case 'practice_questions':
        case 'h5p':
          nestedDetailData = await ApiService.getActivityDetail(item.id);
          break;
        case 'topic':
          nestedDetailData = await ApiService.getTopicDetail(item.id);
          break;
        default:
          console.warn('Unknown type for nested details:', type);
          nestedDetailData = { ...item };
      }
      const transformedDetails = transformDetailsForSidebar(nestedDetailData) || item;
      setNestedDetails(transformedDetails);
      setNestedEditMode(false);
      setNestedEditData({
        name: transformedDetails.title || transformedDetails.name || '',
        description: transformedDetails.description || '',
        grade: transformedDetails.grade || '',
        subject: transformedDetails.subject || '',
        character_voice: transformedDetails.character_voice || '',
        learning_object_tags: transformedDetails.learning_object_tags || '',
        weight: transformedDetails.weight || transformedDetails.weightage || 0,
        time_limit: transformedDetails.time_limit || 0,
        passing_score: transformedDetails.passing_score || 0
      });
    } catch (error) {
      console.error('Failed to fetch nested details:', error);
      setNestedDetails(item);
      setNestedEditData({
        name: item.title || item.name || '',
        description: item.description || '',
        grade: item.grade || '',
        subject: item.subject || '',
        character_voice: item.character_voice || '',
        learning_object_tags: item.learning_object_tags || '',
        weight: item.weight || item.weightage || 0,
        time_limit: item.time_limit || 0,
        passing_score: item.passing_score || 0
      });
    }
    setNestedSidebarVisible(true);
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getSidebarWidth = () => {
    const screenWidth = typeof window !== "undefined" ? window.innerWidth : 1920;
    const wideTypes = ['practice_questions', 'assessment', 'exam'];
    const currentType = nestedSidebarVisible ? nestedDetails?.type : selectedDetails?.type;
    if (screenWidth <= 768) {
      return '100%'; 
    } else if (screenWidth <= 1024) {
      return '90%'; 
    }
    if (currentType && wideTypes.includes(currentType)) {
      return '80.75rem';
    }
    return '80rem';
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
    { label: 'Math', value: 'math' },
    { label: 'Science', value: 'science' },
    { label: 'English', value: 'english' }
  ];

  const getTypeIcon = (type: string) => {
    const iconStyle = { fontSize: '1.5rem', color: 'var(--primary-color)' };
    
    switch (type) {
      case 'learning_object':
        return <LibraryBooksIcon style={iconStyle} />;
      case 'topic':
        return <CategoryIcon style={iconStyle} />;
      case 'practice_questions':
        return <QuizIcon style={iconStyle} />;
      case 'h5p':
        return <LocalActivityIcon style={iconStyle} />;
      case 'exam':
        return <StarIcon style={iconStyle} />;
      case 'video':
        return <PlayLessonIcon style={iconStyle} />;
      case 'assessment':
        return <GradingIcon style={iconStyle} />;     
      default:
        return <LibraryBooksIcon style={iconStyle} />;
    }
  };

  useEffect(() => {
    if (selectedDetails) {
      const transformedDetails = transformDetailsForSidebar(selectedDetails) || selectedDetails;
      setEditData({
        name: transformedDetails.name || transformedDetails.title || '',
        description: transformedDetails.description || '',
        grade: transformedDetails.grade || '',
        subject: transformedDetails.subject || '',
        character_voice: transformedDetails.character_voice || '',
        learning_object_tags: transformedDetails.learning_object_tags || '',
        weight: transformedDetails.weight || transformedDetails.weightage || 0,
        time_limit: transformedDetails.time_limit || 0,
        passing_score: transformedDetails.passing_score || 0
      });
    }
    setEditMode(false);
  }, [selectedDetails]);

  useEffect(() => {
    if (!visible) {
      setNestedSidebarVisible(false);
      setNestedDetails(null);
      setNestedHistory([]);
    }
  }, [visible]);

  const handleNestedHide = () => {
    setNestedEditMode(false);
    setNestedEditData({});
    setNestedHistory(prev => {
      if (prev.length > 0) {
        const newHistory = [...prev];
        const previous = newHistory.pop();
        setNestedDetails(previous);
        setNestedSidebarVisible(true);
        return newHistory;
      }
      setNestedSidebarVisible(false);
      setNestedDetails(null);
      return [];
    });
  };

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
      const type = selectedDetails.type;
      
      switch (type) {
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
      showToast('success', 'Success', `${type.replace('_', ' ')} updated successfully`);
      setEditMode(false);
      onUpdate?.();
    } catch (error) {
      console.error('Failed to update:', error);
      showToast('error', 'Error', 'Failed to update item');
    } finally {
      setEditLoading(false);
    }
  };

  const handleNestedSave = async () => {
    if (!nestedDetails) return;
    try {
      setNestedEditLoading(true);
      let response;
      const type = nestedDetails.type;
      
      switch (type) {
        case 'topic':
          response = await ApiService.updateTopic(nestedDetails.id, {
            name: nestedEditData.name,
            description: nestedEditData.description,
            character_voice: nestedEditData.character_voice
          });
          break;
        case 'video':
        case 'practice_questions':
        case 'h5p':
          response = await ApiService.updateActivity(nestedDetails.id, {
            name: nestedEditData.name,
            description: nestedEditData.description,
            character_voice: nestedEditData.character_voice
          });
          break;
        case 'assessment':
          response = await ApiService.updateAssessment(nestedDetails.id, {
            name: nestedEditData.name,
            description: nestedEditData.description,
            weight: Number(nestedEditData.weight),
            time_limit: Number(nestedEditData.time_limit),
            passing_score: Number(nestedEditData.passing_score)
          });
          break;
        case 'exam':
          response = await ApiService.updateExam(nestedDetails.id, {
            name: nestedEditData.name,
            description: nestedEditData.description,
            weight: Number(nestedEditData.weight),
            time_limit: Number(nestedEditData.time_limit),
            passing_score: Number(nestedEditData.passing_score)
          });
          break;
        default:
          throw new Error('Unsupported type for editing');
      }
      showToast('success', 'Success', `${type.replace('_', ' ')} updated successfully`);
      setNestedEditMode(false);
      onUpdate?.();
    } catch (error) {
      console.error('Failed to update nested item:', error);
      showToast('error', 'Error', 'Failed to update item');
    } finally {
      setNestedEditLoading(false);
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

  const renderNestedEditableField = (label: string, value: string, field: string, type: 'text' | 'textarea' = 'text') => {
    if (nestedEditMode) {
      if (type === 'textarea') {
        return (
          <InputTextarea
            value={nestedEditData[field] || ''}
            onChange={(e) => setNestedEditData({ ...nestedEditData, [field]: e.target.value })}
            rows={3}
            className="w-full"
          />
        );
      }
      return (
        <InputText
          value={nestedEditData[field] || ''}
          onChange={(e) => setNestedEditData({ ...nestedEditData, [field]: e.target.value })}
          className="w-full"
        />
      );
    }
    return value || "-";
  };

  const renderDropdownField = (label: string, value: string, field: string, options: any[]) => {
    if (editMode) {
      if (field === 'grade' || field === 'subject') {
        const currentValue = editData[field] || '';
        const selectedValues = currentValue ? currentValue.split(',') : [];
        return (
          <MultiSelect
            value={selectedValues}
            onChange={(e) => setEditData({ ...editData, [field]: e.value.join(',') })}
            options={options}
            optionLabel="label"
            placeholder={`Select ${label}`}
            className="w-full"
            display="chip"
          />
        );
      } else {
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
    }
    return value ? parseJsonArrayToString(value, field as any) : "-";
  };

  const renderNestedDropdownField = (label: string, value: string, field: string, options: any[]) => {
    if (nestedEditMode) {
      return (
        <Dropdown
          value={nestedEditData[field] || ''}
          onChange={(e) => setNestedEditData({ ...nestedEditData, [field]: e.value })}
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

  const renderNestedNumberField = (label: string, value: number, field: string) => {
    if (nestedEditMode) {
      return (
        <InputText
          type="number"
          value={nestedEditData[field] || ''}
          onChange={(e) => setNestedEditData({ ...nestedEditData, [field]: e.target.value })}
          className="w-full"
        />
      );
    }
    return value || value === 0 ? value : "-";
  };

  const renderDetailContent = () => {
    const transformedDetails = transformDetailsForSidebar(selectedDetails) || selectedDetails;
    const commonProps = {
      selectedDetails: transformedDetails, 
      editMode,
      editData,
      setEditData,
      renderEditableField,
      renderDropdownField,
      renderNumberField,
      getItemIcon,
      courseComponents,
      onOpenDetails: handleOpenNestedDetails
    };
    switch (transformedDetails?.type) {
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
        return (
          <ActivitiesDetail 
            {...commonProps}
            questions={transformedDetails.questions || []}
            onUpdateQuestion={handleUpdateQuestion}
            onDeleteQuestion={(questionId) => setDeleteQuestionDialog({
              visible: true,
              questionId,
              questionType: 'practice'
            })}
          />
        );
      case 'assessment':
        return (
          <AssessmentDetail
            {...commonProps}
            questions={transformedDetails.assessment?.questions || transformedDetails.questions || []}
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
            {...commonProps}
            questions={transformedDetails.exam?.questions || transformedDetails.questions || []}
            onUpdateQuestion={handleUpdateQuestion}
            onDeleteQuestion={(questionId) => setDeleteQuestionDialog({
              visible: true,
              questionId,
              questionType: 'exam'
            })}
          />
        );
      default:
        return (
          <div className="p-3">
            <h3>Details</h3>
            <p>Type: {transformedDetails?.type}</p>
            <p>Name: {transformedDetails?.name || transformedDetails?.title}</p>
            {transformedDetails?.description && (
              <p>Description: {transformedDetails.description}</p>
            )}
          </div>
        );
    }
  };

  const renderNestedContent = () => {
    const transformedNestedDetails = transformDetailsForSidebar(nestedDetails) || nestedDetails;
    const commonProps = {
      selectedDetails: transformedNestedDetails,
      editMode: nestedEditMode,
      editData: nestedEditData,
      setEditData: setNestedEditData,
      renderEditableField: renderNestedEditableField,
      renderDropdownField: renderNestedDropdownField,
      renderNumberField: renderNestedNumberField,
      getItemIcon,
      courseComponents,
      onOpenDetails: handleOpenNestedDetails 
    };
    switch (transformedNestedDetails?.type) {
      case 'topic':
        return <TopicDetail {...commonProps} />;
      case 'video':
      case 'practice_questions':
      case 'h5p':
        return (
          <ActivitiesDetail 
            {...commonProps}
            questions={transformedNestedDetails.questions || []}
            onUpdateQuestion={handleUpdateQuestion}
            onDeleteQuestion={(questionId) => setDeleteQuestionDialog({
              visible: true,
              questionId,
              questionType: 'practice'
            })}
          />
        );
      case 'assessment':
        return (
          <AssessmentDetail
            {...commonProps}
            questions={transformedNestedDetails.assessment?.questions || transformedNestedDetails.questions || []}
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
            {...commonProps}
            questions={transformedNestedDetails.exam?.questions || transformedNestedDetails.questions || []}
            onUpdateQuestion={handleUpdateQuestion}
            onDeleteQuestion={(questionId) => setDeleteQuestionDialog({
              visible: true,
              questionId,
              questionType: 'exam'
            })}
          />
        );
      default:
        return (
          <div className="p-3">
            <h3>{transformedNestedDetails?.title || 'Details'}</h3>
            <p>Type: {transformedNestedDetails?.type}</p>
            <p>ID: {transformedNestedDetails?.id}</p>
            {transformedNestedDetails?.description && (
              <p>Description: {transformedNestedDetails.description}</p>
            )}
          </div>
        );
    }
  };

  return (
    <>
      <Toast ref={toast} />      
      <Sidebar
        visible={visible}
        position="right"
        onHide={handleMainHide}
        className="p-sidebar-md"
        style={{ width: getSidebarWidth(), zIndex: 1000 }}
      >
        <div className="flex align-items-center justify-content-between mb-3">
          <div className="flex align-items-center text-xl font-bold">
            {getTypeIcon(selectedDetails?.type)}
            <span className="ml-2">
              {selectedDetails?.type === 'learning_object' ? 'Lesson' :
               selectedDetails?.type === 'topic' ? 'Topic' :
               selectedDetails?.type === 'assessment' ? 'Assessment' :
               selectedDetails?.type === 'exam' ? 'Exam' :
               selectedDetails?.type === 'video' ? 'Video Activity' :
               selectedDetails?.type === 'practice_questions' ? 'Practice Activity' :
               selectedDetails?.type === 'h5p' ? 'Interactive Video' :
               'Item Details'}
            </span>
          </div>
          {!editMode ? (
            <Button
          
              label="Edit"
              className="p-button-outlined p-button-sm"
              onClick={() => setEditMode(true)}
            />
          ) : (
            <div className="flex gap-2">
              <Button
                icon={<CloseIcon style={{ fontSize: '1rem', color: 'var(--primary-color)' }} />}
                label="Cancel"
                className="p-button-text p-button-sm"
                onClick={() => setEditMode(false)}
              />
              <Button
                icon={<CheckIcon style={{ fontSize: '1rem', color: 'var(--primary-color)' }} />}
                label="Save"
                className="p-button-sm"
                loading={editLoading}
                onClick={handleSave}
              />
            </div>
          )}
        </div>             
        <div>
          {detailsLoading ? (
            <div className="flex align-items-center gap-2 text-600">
              <i className="pi pi-spin pi-spinner" style={{ color: 'var(--primary-color)' }}></i>
              <span>Loading details...</span>
            </div>
          ) : (
            <div className="grid">
              <div className="col-12">
                {renderDetailContent()}           
              </div>
            </div>
          )}
        </div>
      </Sidebar>

      <Sidebar
        visible={nestedSidebarVisible}
        position="right"
        onHide={handleNestedHide}
        className="p-sidebar-md"
        style={{ 
          width: getSidebarWidth(), 
          zIndex: 1001 
        }}
      >
        <div className="flex align-items-center justify-content-between mb-3">
          <div className="flex align-items-center text-xl font-bold">
            {getTypeIcon(nestedDetails?.type)}
            <span className="ml-2">
              {nestedDetails?.type === 'topic' ? 'Topic' : 
               nestedDetails?.type === 'video' ? 'Video Activity' :
               nestedDetails?.type === 'practice_questions' ? 'Practice Activity' :
               nestedDetails?.type === 'h5p' ? 'Interactive Video' :
               nestedDetails?.type === 'assessment' ? 'Assessment' :
               nestedDetails?.type === 'exam' ? 'Exam' :
               'Activity Details'}
            </span>
          </div>
          {!nestedEditMode ? (
            <Button
           
              label="Edit"
              className="p-button-outlined p-button-sm"
              onClick={() => setNestedEditMode(true)}
            />
          ) : (
            <div className="flex gap-2">
              <Button
                icon={<CloseIcon style={{ fontSize: '1rem', color: 'var(--primary-color)' }} />}
                label="Cancel"
                className="p-button-text p-button-sm"
                onClick={() => setNestedEditMode(false)}
              />
              <Button
                icon={<CheckIcon style={{ fontSize: '1rem', color: 'var(--primary-color)' }} />}
                label="Save"
                className="p-button-sm"
                loading={nestedEditLoading}
                onClick={handleNestedSave}
              />
            </div>
          )}
        </div>
        <div>
          {renderNestedContent()}
        </div>
      </Sidebar>

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
                  icon={<RemoveIcon style={{ fontSize: '1rem', color: 'var(--primary-color)' }} />}
                  className="p-button-danger p-button-text p-button-sm mt-2"
                  onClick={() => removeQuestionField(index)}
                />
              )}
            </div>
          ))}
          <Button
            icon={<AddIcon style={{ fontSize: '1rem', color: 'var(--primary-color)' }} />}
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
              icon={<CheckIcon style={{ fontSize: '1rem', color: 'var(--primary-color)' }} />}
              onClick={handleAddQuestions}
            />
          </div>
        </div>
      </Dialog>

      <Dialog
        header="Confirm Delete"
        visible={deleteQuestionDialog.visible}
        style={{ width: '30vw' }}
        onHide={() => setDeleteQuestionDialog({ visible: false, questionId: '', questionType: '' })}
      >
        <div className="confirmation-content flex align-items-center">
          <WarningIcon style={{ fontSize: '2rem', color: 'var(--primary-color)', marginRight: '12px' }} />
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
            icon={<CheckIcon style={{ fontSize: '1rem', color: 'var(--primary-color)' }} />}
            className="p-button-danger"
            onClick={handleDeleteQuestion}
          />
        </div>
      </Dialog>
    </>
  );
}