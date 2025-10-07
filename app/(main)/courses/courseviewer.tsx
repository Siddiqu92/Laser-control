"use client";

import React, { useEffect, useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Sidebar } from "primereact/sidebar";
import { Avatar } from "primereact/avatar";
import { useRouter } from "next/navigation";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import api, { ApiService, CourseViewerResponse } from "@/service/api";
import LessonTable, { LessonItem } from "./components/LessonTable";
import CourseDetailsSidebar from "./components/CourseSidebar/CourseSidebar";
import { 
  CourseDetails, 
  ComponentType, 
  CourseViewerProps, 
  StudentProgressData 
} from "./types/courseTypes";

export default function CourseViewer({ course: initialCourse, courseId }: CourseViewerProps) {
  const router = useRouter();
  const toast = useRef<Toast>(null);
  const [activeSection, setActiveSection] = useState<string>("info");
  const [course, setCourse] = useState<CourseDetails | null>(initialCourse ?? null);
  const [loading, setLoading] = useState<boolean>(true);
  const [studentProgressData, setStudentProgressData] = useState<StudentProgressData | null>(null);
  const [students, setStudents] = useState<Array<{ id: string; first_name: string; last_name: string; avatar: string | null }>>([]);
  const [progressDialogVisible, setProgressDialogVisible] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<{ id: number; name: string; type: ComponentType } | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [studentActivities, setStudentActivities] = useState<Array<{ id: number; title: string; activity_type: string; progress: string; last_read: string | null }>>([]);
  const [courseComponents, setCourseComponents] = useState<CourseViewerResponse["courseComponents"] | null>(null);
  const [courseMetadata, setCourseMetadata] = useState<CourseViewerResponse["courseMetadata"] | null>(null);
  const [gradingScheme, setGradingScheme] = useState<CourseViewerResponse["gradingScheme"] | null>(null);
  const [schedule, setSchedule] = useState<CourseViewerResponse["schedule"] | null>(null);
  const [detailsSidebarVisible, setDetailsSidebarVisible] = useState<boolean>(false);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);
  const [selectedDetails, setSelectedDetails] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); 

  const showToast = (severity: 'success' | 'error', summary: string, detail: string) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  };

  const handleRefreshData = () => {
    setRefreshTrigger(prev => prev + 1);
    showToast('success', 'Success', 'Data updated successfully');
  };

const parseJsonArrayToString = (jsonString: string, type: "grade" | "subject" | "character_voice" | "learning_object_tags"): string => {
  if (!jsonString || jsonString === 'null' || jsonString === '""') {
    return "";
  }
  
  try {
    if (type === "character_voice" || type === "learning_object_tags") {
      return jsonString;
    }
    
    const array = JSON.parse(jsonString);
    if (Array.isArray(array) && array.length > 0) {
      const item = array[0];
      if (type === "grade") {
        return item.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
      } else {
        return item.charAt(0).toUpperCase() + item.slice(1);
      }
    }
    return "";
  } catch (error) {
    console.error(`Error parsing ${type}:`, error);
    return jsonString;
  }
};

const openDetails = async (payload: any) => {
  try {
    setDetailsLoading(true);
    
    if (payload.type === 'learning_object') {
      let learningObjectData = null;
      
      console.log("Searching for learning object with ID:", payload.id);
      console.log("Student Progress Lessons:", studentProgressData?.lessons);
      
      if (studentProgressData?.lessons) {
        for (const lesson of studentProgressData.lessons) {
          if (lesson.children) {
            for (const child of lesson.children) {
              console.log("Checking child:", child);
              if (child.id === payload.id && child.type === 'learning_object') {
                learningObjectData = child;
                console.log("Found learning object data:", learningObjectData);
                break;
              }
            }
          }
          if (learningObjectData) break;
        }
      }
      
      if (!learningObjectData || !learningObjectData.metadata) {
        console.log("Metadata not found in child, searching in courseComponents");
        learningObjectData = findLearningObjectById(payload.id);
      }
      
      if (learningObjectData) {
        console.log("Final learning object data:", learningObjectData);
        
        const detailsData = {
          ...payload,
          id: learningObjectData.id,
          name: learningObjectData.name || payload.name,
          description: learningObjectData.description || payload.description,
         
          grade: learningObjectData.metadata?.grade || learningObjectData.grade,
          subject: learningObjectData.metadata?.subject || learningObjectData.subject,
          character_voice: learningObjectData.metadata?.character_voice || learningObjectData.character_voice,
          learning_object_tags: learningObjectData.metadata?.learning_object_tags || learningObjectData.learning_object_tags,
        };
        
        setSelectedDetails(detailsData);
      } else {
        console.log("No learning object data found, using payload:", payload);
        setSelectedDetails(payload);
      }
    } else {
      setSelectedDetails(payload);
    }
    
    setDetailsSidebarVisible(true);
  } catch (_e) {
    console.error("Failed to load learning object details", _e);
    setSelectedDetails(payload); 
  } finally {
    setDetailsLoading(false);
  }
};

const findLearningObjectById = (id: number) => {
  if (!courseComponents?.learning_objects) return null;
  
  console.log("Searching in courseComponents for ID:", id);
  
  
  for (const lo of courseComponents.learning_objects) {
    if (lo.id === id) {
      console.log("Found direct learning object:", lo);
      return lo;
    }
  }

  
  for (const lo of courseComponents.learning_objects) {
    if (lo.topics && Array.isArray(lo.topics)) {
      for (const topicGroup of lo.topics) {
    
        if (topicGroup && topicGroup.id === id) {
          console.log("Found topic group:", topicGroup);
          return topicGroup;
        }
        
        if (topicGroup && typeof topicGroup === 'object' && 'topics' in topicGroup && Array.isArray(topicGroup.topics)) {
          for (const topic of topicGroup.topics) {
            if (topic && topic.id === id) {
              console.log("Found topic:", topic);
              return topic;
            }
          }
        }
      }
    }
  }
  
  console.log("Learning object not found with ID:", id);
  return null;
};

  useEffect(() => {
    const idFromQuery = (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('courseId') : null) || courseId || "";
    if (!idFromQuery) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getCourseViewer(idFromQuery);
        const courseData: CourseDetails = data.course as CourseDetails;
        setCourse(courseData);
        const dashboard = data.studentProgressData as unknown as StudentProgressData;
        setStudentProgressData(dashboard);
        setStudents(dashboard?.students || []);
        setCourseComponents(data.courseComponents);
        setCourseMetadata(data.courseMetadata || null);
        setGradingScheme(data.gradingScheme || null);
        setSchedule(data.schedule || null);
      } catch (err) {
        console.error("Failed to load course viewer data", err);
        showToast('error', 'Error', 'Failed to load course data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, refreshTrigger]);

  const getItemIcon = (type: ComponentType | string) => {
    const lowerType = (type || '').toLowerCase();
    
    if (lowerType.includes('video')) {
      return 'pi pi-video';
    }
    if (lowerType.includes('practice')) {
      return 'pi pi-bolt';
    }
    if (lowerType.includes('learning_object')) {
      return 'pi pi-book';
    }
    if (lowerType.includes('topic')) {
      return 'pi pi-book';
    }
    if (lowerType.includes('assessment')) {
      return 'pi pi-bolt';
    }
    if (lowerType.includes('exam')) {
      return 'pi pi-star';
    }
    if (lowerType.includes('activity')) {
      return 'pi pi-circle';
    }
    
    return 'pi pi-book';
  };

const buildLessonData = (): LessonItem[] => {
  const lessons: LessonItem[] = [];
  const rawLessons = studentProgressData?.lessons || [];
  const learningObjects = (courseComponents?.learning_objects || []) as any[];
  
  const getDefaultWeightage = (kind: 'assessment' | 'exam', item?: any): number | undefined => {
    if (!gradingScheme) return item?.weightage;
    if (kind === 'assessment') return item?.weightage ?? gradingScheme.assessment_weight;
    const name: string = (item?.name || '').toLowerCase();
    if (name.includes('mid') || name.includes('mid-term') || name.includes('mid term')) {
      return item?.weightage ?? gradingScheme.mid_term_weight;
    }
    return item?.weightage ?? gradingScheme.final_exam_weight;
  };

  rawLessons.forEach((lesson) => {
    if (lesson.type === 'learning_object') {
      const lo = learningObjects.find((l) => l.id === lesson.id);
      
      if (lo) {

        if (!lo.name && lesson.children && lesson.children.length > 0) {

          lesson.children.forEach((child: any) => {
            if (child.type === 'learning_object') {

              const childLo = learningObjects.find((l: any) => 
                l.topics?.some((topicGroup: any) => 
                  topicGroup.id === child.id
                )
              );
              
              if (childLo) {
                const processTopics = (topics: any[]): LessonItem[] => {
                  if (!Array.isArray(topics)) return [];
                  return topics.flatMap((topicGroup: any) => {
                    if (topicGroup.topics && Array.isArray(topicGroup.topics)) {
                      return topicGroup.topics.flatMap((topic: any) => {
                        const activityList: any[] = Array.isArray(topic.activities) ? topic.activities : [];
                        const activityCount = activityList.length;

                        const activityItems: LessonItem[] = activityList.map((activity: any) => ({
                          title: activity.name,
                          description: activity.description,
                          icon: getItemIcon(activity.type),
                          count: '',
                          type: activity.type,
                          id: activity.id,
                          completed: false
                        }));

                        const countText = activityCount > 0
                          ? `(Activities: ${String(activityCount).padStart(2, '0')})`
                          : '';

                        const topicItem: LessonItem = {
                          title: topic.name,
                          description: topic.description,
                          icon: getItemIcon('topic'),
                          count: countText,
                          type: 'topic',
                          id: topic.id,
                          completed: child.completed,
                          children: activityItems
                        };
                        return [topicItem];
                      });
                    }
                    return [];
                  });
                };

                const topicItems = processTopics(childLo.topics || []);
                

                const learningObjectItem: LessonItem = {
                  title: child.name || childLo.topics?.[0]?.name || 'Unnamed Learning Object',
                  description: child.metadata?.description,
                  icon: getItemIcon('learning_object'),
                  count: `(Topics: ${String(topicItems.length).padStart(2, '0')})`,
                  type: 'learning_object',
                  id: child.id,
                  completed: child.completed,
                  children: topicItems
                };
                
                lessons.push(learningObjectItem);
              }
            }
          });
        } else {
      
          const processTopics = (topics: any[]): LessonItem[] => {
            if (!Array.isArray(topics)) return [];
            return topics.flatMap((topicGroup: any) => {
              if (topicGroup.topics && Array.isArray(topicGroup.topics)) {
                return topicGroup.topics.flatMap((topic: any) => {
                  const activityList: any[] = Array.isArray(topic.activities) ? topic.activities : [];
                  const activityCount = activityList.length;

                  const activityItems: LessonItem[] = activityList.map((activity: any) => ({
                    title: activity.name,
                    description: activity.description,
                    icon: getItemIcon(activity.type),
                    count: '',
                    type: activity.type,
                    id: activity.id,
                    completed: false
                  }));

                  const countText = activityCount > 0
                    ? `(Activities: ${String(activityCount).padStart(2, '0')})`
                    : '';

                  const topicItem: LessonItem = {
                    title: topic.name,
                    description: topic.description,
                    icon: getItemIcon('topic'),
                    count: countText,
                    type: 'topic',
                    id: topic.id,
                    completed: lesson.completed,
                    children: activityItems
                  };
                  return [topicItem];
                });
              }
              return [];
            });
          };

          const topicItems = processTopics(lo.topics || []);
          
        
          const learningObjectName = lo.name || lo.topics?.[0]?.name || 'Unnamed Learning Object';
          
          const learningObjectItem: LessonItem = {
            title: learningObjectName,
            description: lo.description,
            icon: getItemIcon('learning_object'),
            count: `(Topics: ${String(topicItems.length).padStart(2, '0')})`,
            type: 'learning_object',
            id: lo.id,
            completed: lesson.completed,
            children: topicItems
          };
          
          lessons.push(learningObjectItem);
        }
      }
      (lesson.children || []).forEach((child) => {
        if (child.type === 'assessment' || child.type === 'exam') {
          const totalQuestions = (child as any).total_questions ?? (child as any).question_count;
          const weight = getDefaultWeightage(child.type as 'assessment' | 'exam', child);
          lessons.push({
            title: child.name,
            description: child.description,
            icon: getItemIcon(child.type),
            count: (totalQuestions !== undefined || weight !== undefined)
              ? `(Questions: ${totalQuestions ?? '-'}, Weightage: ${weight ?? '-'}%)`
              : '',
            type: child.type,
            id: child.id,
            completed: child.completed
          });
        }
      });
    } else if (lesson.type === 'assessment' || lesson.type === 'exam') {
      const totalQuestions = (lesson as any).total_questions ?? (lesson as any).question_count;
      const weight = getDefaultWeightage(lesson.type as 'assessment' | 'exam', lesson);
      lessons.push({
        title: lesson.name,
        description: lesson.description,
        icon: getItemIcon(lesson.type),
        count: (totalQuestions !== undefined || weight !== undefined)
          ? `(Questions: ${totalQuestions ?? '-'}, Weightage: ${weight ?? '-'}%)`
          : '',
        type: lesson.type,
        id: lesson.id,
        completed: lesson.completed
      });
    }
  });

  return lessons;
};

  const renderMainContent = () => {
    switch (activeSection) {
      case "course-index":
        return (
          <Card title="Course Content" className="mb-4">
            <div className="p-3">
              <LessonTable 
                data={buildLessonData()} 
                onOpenDetails={openDetails}
              />
            </div>
          </Card>
        );
      case "info":
        return (
          <Card title="Course Information" className="mb-4">
            <div className="grid text-sm p-3">
              <div className="col-12 md:col-6 mb-3">
                <div className="text-600 font-medium mb-1">Program/Grade</div>
                <div className="text-900 font-semibold">
                  {course?.name?.split("(")[0]?.trim() || "-"}
                </div>
              </div>
              <div className="col-12 md:col-6 mb-3">
                <div className="text-600 font-medium mb-1">Session</div>
                <div className="text-900 font-semibold">
                  {course?.name?.match(/\((.*?)\)/)?.[0] || "-"}
                </div>
              </div>
              <div className="col-12 md:col-6 mb-3">
                <div className="text-600 font-medium mb-1">Completion Rate</div>
                <div className="text-900 font-semibold">{courseMetadata?.completion_rate !== undefined ? `${Math.round((courseMetadata.completion_rate || 0) * 100)}%` : '-'}</div>
              </div>
              <div className="col-12 md:col-6 mb-3">
                <div className="text-600 font-medium mb-1">Average Score</div>
                <div className="text-900 font-semibold">{courseMetadata?.average_score !== undefined ? `${courseMetadata.average_score}%` : '-'}</div>
              </div>
              <div className="col-12 mb-3">
                <div className="text-600 font-medium mb-1">Course Status</div>
                <div className="text-900 font-semibold">
                  <span className={`p-tag p-tag-${course?.status === 'execute' ? 'success' : 'warning'}`}>
                    {course?.status || "Unknown"}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        );
      case "grading":
        const gradingItems: Record<string, number> = {};
        studentProgressData?.lessons?.forEach((lesson) => {
          if ((lesson.type === "assessment" || lesson.type === "exam") && lesson.weightage) {
            const key = lesson.name?.toLowerCase().includes("assessment") ? "Assessment" : lesson.name;

            if (!gradingItems[key]) {
              gradingItems[key] = 0;
            }
            gradingItems[key] += lesson.weightage ?? 0;
          }

          lesson.children?.forEach((child) => {
            if ((child.type === "assessment" || child.type === "exam") && child.weightage) {
              const key = child.name?.toLowerCase().includes("assessment") ? "Assessment" : child.name;

              if (!gradingItems[key]) {
                gradingItems[key] = 0;
              }
              gradingItems[key] += child.weightage ?? 0;
            }
          });
        });
        return (
          <Card title="Grading Scheme" className="mb-4">
            <div className="p-3">
              <div className="grid">
                {Object.entries(gradingItems).map(([name, weight]) => (
                  <div key={name} className="col-12 md:col-6">
                    <div className="surface-100 p-3 border-round mb-2">
                      <div className="font-semibold">{name}</div>
                      <div className="text-primary font-bold">{weight ?? 0}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="layout-main p-4 flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <div className="text-center">
          <i className="pi pi-spin pi-spinner text-4xl text-primary mb-3"></i>
          <div>Loading course data...</div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="layout-main p-4">
        <div className="p-4 text-center">
          <i className="pi pi-exclamation-triangle text-4xl text-warning mb-3"></i>
          <div className="text-xl font-semibold">Course not found</div>
          <Button
            label="Back to Courses"
            icon="pi pi-arrow-left"
            className="p-button-text mt-3"
            onClick={() => router.push("/courses")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="layout-main p-4">
      <Toast ref={toast} />
      <div className="flex justify-content-between align-items-center mb-4">
        <h1 className="m-0 text-3xl font-bold text-900">{course.name}</h1>
        <Button
          icon="pi pi-arrow-left"
          label="Back"
          className="p-button-text"
          onClick={() => router.push("/courses")}
        />
      </div>

      <div className="grid">
        <div className="col-12 lg:col-3">
          <Card className="mb-4">
            <div className="flex flex-column align-items-center text-center">
              <Avatar
                icon="pi pi-book"
                size="xlarge"
                shape="circle"
                className="bg-primary mb-3"
                style={{ fontSize: '2rem', width: '80px', height: '80px' }}
              />
              <div className="text-xl font-bold text-900">{course.name}</div>
              <div className="text-600 text-sm mt-1">{course.program_of_study}</div>
              <div className="text-500 text-sm">{course.session}</div>
            </div>
          </Card>
          <div className="surface-card p-3 border-round shadow-2 mb-4">
            <ul className="list-none p-0 m-0">
              <li
                className={`p-3 cursor-pointer flex align-items-center gap-2 border-round ${
                  activeSection === "info" ? "bg-primary text-white" : "hover:surface-hover"
                }`}
                onClick={() => setActiveSection("info")}
              >
                <i className="pi pi-info-circle"></i>
                <span>Course Information</span>
              </li>
              <li
                className={`p-3 cursor-pointer flex align-items-center gap-2 border-round ${
                  activeSection === "course-index" ? "bg-primary text-white" : "hover:surface-hover"
                }`}
                onClick={() => setActiveSection("course-index")}
              >
                <i className="pi pi-list"></i>
                <span>Course Content</span>
              </li>

              <li
                className={`p-3 cursor-pointer flex align-items-center gap-2 border-round ${
                  activeSection === "grading" ? "bg-primary text-white" : "hover:surface-hover"
                }`}
                onClick={() => setActiveSection("grading")}
              >
                <i className="pi pi-percentage"></i>
                <span>Grading Scheme</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="col-12 lg:col-9">
          {renderMainContent()}
        </div>
      </div>

      <Dialog
        header={selectedItem ? `Progress: ${selectedItem.name}` : "Progress"}
        visible={progressDialogVisible}
        style={{ width: "60vw" }}
        modal
        onHide={() => {
          setProgressDialogVisible(false);
          setSelectedStudentId("");
          setStudentActivities([]);
        }}
      >
        <div className="grid">
          <div className="col-12 md:col-5">
            <div className="text-600 mb-2">Select Student</div>
            <div className="surface-100 border-round p-2" style={{ maxHeight: 350, overflow: 'auto' }}>
              {students.map((s) => (
                <div
                  key={s.id}
                  className={`p-2 border-round cursor-pointer flex align-items-center justify-content-between ${selectedStudentId === s.id ? 'surface-200' : ''}`}
                  onClick={async () => {
                    setSelectedStudentId(s.id);
                    if (selectedItem) {
                      try {
                        const res = await api.get(`/student-progress/${s.id}/${selectedItem.id}`);
                        const items = (res.data.data?.[0]?.activities || []) as Array<{ id: number; title: string; activity_type: string; progress: string; last_read: string | null }>;
                        setStudentActivities(items);
                      } catch (e) {
                        console.error('Failed to fetch student progress', e);
                        setStudentActivities([]);
                      }
                    }
                  }}
                >
                  <span>{s.first_name} {s.last_name}</span>
                  <i className="pi pi-angle-right text-600"></i>
                </div>
              ))}
            </div>
          </div>
          <div className="col-12 md:col-7">
            <div className="text-600 mb-2">Activities</div>
            <div className="surface-100 border-round p-3" style={{ minHeight: 350 }}>
              {selectedStudentId && studentActivities.length === 0 && (
                <div className="text-600">No activities found.</div>
              )}
              {studentActivities.map((a) => (
                <div key={a.id} className="flex align-items-center justify-content-between py-2 border-bottom-1 surface-border">
                  <div>
                    <div className="font-medium">{a.title}</div>
                    <div className="text-600 text-sm">{a.activity_type} • {a.last_read ? new Date(a.last_read).toLocaleString() : '—'}</div>
                  </div>
                  <div className="text-primary font-semibold">{a.progress}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Dialog>

      <CourseDetailsSidebar
        visible={detailsSidebarVisible}
        onHide={() => setDetailsSidebarVisible(false)}
        selectedDetails={selectedDetails}
        detailsLoading={detailsLoading}
        courseComponents={courseComponents}
        getItemIcon={getItemIcon}
        parseJsonArrayToString={parseJsonArrayToString}
        onUpdate={handleRefreshData} 
      />
    </div>
  );
}