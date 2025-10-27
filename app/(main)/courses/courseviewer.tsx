"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { InputText } from "primereact/inputtext";
import { useRouter, useSearchParams } from "next/navigation";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import api, { 
  ApiService, 
  CourseOverviewResponse, 
  ComponentDetailResponse,
  ActivityDetailResponse,
  TopicDetailResponse 
} from "@/service/api";
import LessonTable, { LessonItem } from "./components/LessonTable";
import CourseDetailsSidebar from "./components/CourseSidebar/CourseSidebar";
import CourseInformation from "./courseinformation";
import GradingScheme from "./GradingScheme";
import { 
  CourseDetails, 
  ComponentType, 
  CourseViewerProps, 
  LessonData 
} from "./types/courseTypes";
import { 
  LibraryBooks,
  PlayLesson,
  Quiz,
  Category,
  Grading,
  Star,
  LocalActivity,
  Info,
  List,
  Percent,
  ArrowBack,
  Search,
  Add,
  Inbox,
  Warning,
} from '@mui/icons-material';
const INITIAL_BATCH_SIZE = 20;
const BATCH_SIZE = 20; 
export default function CourseViewer({ course: initialCourse, courseId }: CourseViewerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useRef<Toast>(null);
  const [activeSection, setActiveSection] = useState<string>("info");
  const [course, setCourse] = useState<CourseDetails | null>(initialCourse ?? null);
  const [loading, setLoading] = useState<boolean>(true);
  const [allLessons, setAllLessons] = useState<LessonData[]>([]);
  const [visibleLessons, setVisibleLessons] = useState<LessonData[]>([]);
  const [loadedCount, setLoadedCount] = useState<number>(0);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [courseDataLoading, setCourseDataLoading] = useState<boolean>(false);
  const [courseComponents, setCourseComponents] = useState<any>(null);
  const [courseMetadata, setCourseMetadata] = useState<any>(null);
  const [gradingScheme, setGradingScheme] = useState<any>(null);
  const [schedule, setSchedule] = useState<any>(null);
  const [detailsSidebarVisible, setDetailsSidebarVisible] = useState<boolean>(false);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);
  const [selectedDetails, setSelectedDetails] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [hasFetchedCourseData, setHasFetchedCourseData] = useState<boolean>(false);
  const [hasEmptyLessons, setHasEmptyLessons] = useState<boolean>(false);
  const [questionsCount, setQuestionsCount] = useState<{[key: number]: number}>({});
  const fromPage = searchParams.get('fromPage');
  const rows = searchParams.get('rows');
  const search = searchParams.get('search');
  
  const resetCourseData = useCallback(() => {
    setVisibleLessons([]);
    setLoadedCount(0);
    setAllLessons([]);
    setSearchTerm("");
    setHasFetchedCourseData(false);
    setHasEmptyLessons(false);
    setQuestionsCount({});
  }, []);

  const handleSectionChange = useCallback((section: string) => {
    if (section === "course-index") {
      resetCourseData();
    }
    setActiveSection(section);
  }, [resetCourseData]);

  const hasMore = useMemo(() => {
    return loadedCount < allLessons.length;
  }, [loadedCount, allLessons.length]);

  const loadMoreLessons = useCallback(async () => {
    if (!hasMore || isLoadingMore || hasEmptyLessons) return;
    setIsLoadingMore(true);
    await new Promise(resolve => setTimeout(resolve, 50));
    const nextBatch = allLessons.slice(loadedCount, loadedCount + BATCH_SIZE);
    setVisibleLessons(prev => [...prev, ...nextBatch]);
    setLoadedCount(prev => prev + nextBatch.length);  
    setIsLoadingMore(false);
  }, [allLessons, loadedCount, hasMore, isLoadingMore, hasEmptyLessons]);

  const fetchQuestionsCount = useCallback(async (lessons: LessonData[]) => {
    const newQuestionsCount: {[key: number]: number} = {};
    
    const detailedDataPromises = lessons.map(async (lesson) => {
      if (lesson.type === 'assessment' || lesson.type === 'exam') {
        try {
          const detailData = await ApiService.getComponentDetail(lesson.id);
          return { lesson, detailData };
        } catch (error) {
          return null;
        }
      }
      return null;
    });

    try {
      const detailedResults = await Promise.all(detailedDataPromises);
      
      for (const result of detailedResults) {
        if (!result) continue;
        
        const { lesson, detailData } = result;
        
        if (lesson.type === 'assessment') {
          const assessmentId = detailData.component?.assessment?.id;
          if (assessmentId) {
            const count = await ApiService.getAssessmentQuestionCount(assessmentId);
            newQuestionsCount[lesson.id] = count;
          } else {
            newQuestionsCount[lesson.id] = 0;
          }
        } 
        else if (lesson.type === 'exam') {
          const examId = detailData.component?.exam?.id;
          if (examId) {
            const count = await ApiService.getExamQuestionCount(examId);
            newQuestionsCount[lesson.id] = count;
          } else {
            newQuestionsCount[lesson.id] = 0;
          }
        }
      }
      
      for (const lesson of lessons) {
        if (lesson.children) {
          for (const child of lesson.children) {
            if (child.type === 'assessment' || child.type === 'exam') {
              try {
                const detailData = await ApiService.getComponentDetail(child.id);
                
                if (child.type === 'assessment') {
                  const assessmentId = detailData.component?.assessment?.id;
                  if (assessmentId) {
                    const count = await ApiService.getAssessmentQuestionCount(assessmentId);
                    newQuestionsCount[child.id] = count;
                  }
                } 
                else if (child.type === 'exam') {
                  const examId = detailData.component?.exam?.id;
                  if (examId) {
                    const count = await ApiService.getExamQuestionCount(examId);
                    newQuestionsCount[child.id] = count;
                  }
                }
              } catch (error) {
                newQuestionsCount[child.id] = 0;
              }
            }
          }
        }
      }
    } catch (error) {}
    
    setQuestionsCount(prev => ({ ...prev, ...newQuestionsCount }));
  }, []);

  const fetchCourseData = useCallback(async () => {
    if (!courseId || hasFetchedCourseData) return;
    try {
      setCourseDataLoading(true);
      setHasFetchedCourseData(true);
      const data = await ApiService.getCourseOverview(courseId);
      const courseData: CourseDetails = data.course as CourseDetails;      
      const lessonsData = (data.course.lessons || []).map((lesson: any) => ({
        ...lesson,
        children: lesson.children?.map((child: any) => ({
          ...child,
          weightage: child.weightage ?? false,
        })),
      }));
      
      if (!lessonsData || lessonsData.length === 0) {
        setHasEmptyLessons(true);
      } else {
        setHasEmptyLessons(false);
        fetchQuestionsCount(lessonsData);
      }
      setAllLessons(lessonsData);
    } catch (err) {
      console.error("Failed to load course overview data", err);
      showToast('error', 'Error', 'Failed to load course data');
      setHasFetchedCourseData(false);
    } finally {
      setCourseDataLoading(false);
    }
  }, [courseId, hasFetchedCourseData, fetchQuestionsCount]);

  useEffect(() => {
    if (allLessons.length > 0 && visibleLessons.length === 0) {
      const initialBatch = allLessons.slice(0, Math.min(INITIAL_BATCH_SIZE, allLessons.length));
      setVisibleLessons(initialBatch);
      setLoadedCount(initialBatch.length);
    }
  }, [allLessons, visibleLessons.length]); 

  useEffect(() => {
    if (hasMore && !isLoadingMore && activeSection === "course-index" && !courseDataLoading && !hasEmptyLessons) {
      const timer = setTimeout(() => {
        loadMoreLessons();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [hasMore, isLoadingMore, activeSection, loadMoreLessons, courseDataLoading, hasEmptyLessons]);

  useEffect(() => {
    if (activeSection === "course-index" && 
        allLessons.length === 0 && 
        !courseDataLoading && 
        !hasFetchedCourseData &&
        !hasEmptyLessons) {
      fetchCourseData();
    }
  }, [activeSection, allLessons.length, courseDataLoading, fetchCourseData, hasFetchedCourseData, hasEmptyLessons]);

  useEffect(() => {
    if (activeSection !== "course-index" || !hasMore || isLoadingMore || courseDataLoading || hasEmptyLessons) return;
    const handleScroll = () => {
      const scrollContainer = document.querySelector('.layout-main');
      if (!scrollContainer) return;
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const scrollPosition = scrollTop + clientHeight;
      if (scrollHeight - scrollPosition <= 100) {
        loadMoreLessons();
      }
    };
    const scrollContainer = document.querySelector('.layout-main');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [activeSection, hasMore, isLoadingMore, loadMoreLessons, courseDataLoading, hasEmptyLessons]);

  const handleBackClick = () => {
    const params = new URLSearchParams();
    if (fromPage) params.set('page', fromPage);
    if (rows) params.set('rows', rows);
    if (search) params.set('search', search);
    const queryString = params.toString();
    router.push(`/courses${queryString ? `?${queryString}` : ''}`);
  };

  const showToast = (severity: 'success' | 'error', summary: string, detail: string) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  };

  const handleRefreshData = () => {
    setRefreshTrigger(prev => prev + 1);
    setHasFetchedCourseData(false);
    setHasEmptyLessons(false);
    setQuestionsCount({});
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
      const type = (payload?.type || '').toLowerCase();
      let detailData: any = null;
      switch (type) {
        case 'learning_object':
        case 'assessment':
        case 'exam':
          detailData = await ApiService.getComponentDetail(payload.id);
          break;
        case 'activity':
        case 'video':
        case 'practice_questions':
        case 'h5p':
          detailData = await ApiService.getActivityDetail(payload.id);
          break;
        case 'topic':
          detailData = await ApiService.getTopicDetail(payload.id);
          break;
        default:
          console.warn('Unknown type for detail:', type);
          setSelectedDetails(payload);
          setDetailsSidebarVisible(true);
          return;
      }
      if (detailData) {
        let transformedData = null;
        if (type === 'learning_object' || type === 'assessment' || type === 'exam') {
          transformedData = {
            ...payload,
            component: detailData.component
          };
          if (detailData.component.learning_objects) {
            setCourseComponents({
              learning_objects: detailData.component.learning_objects,
              assessments: detailData.component.assessment ? [detailData.component.assessment] : [],
              exams: detailData.component.exam ? [detailData.component.exam] : []
            });
          }
        } 
        else if (type === 'activity' || type === 'video' || type === 'practice_questions' || type === 'h5p') {
          transformedData = {
            ...payload,
            activity: detailData.activity
          };
        }
        else if (type === 'topic') {
          transformedData = {
            ...payload,
            topic: detailData.topic
          };
        }
        setSelectedDetails(transformedData || payload);
      } else {
        setSelectedDetails(payload);
      }
      setDetailsSidebarVisible(true);
    } catch (error) {
      console.error("Failed to load details", error);
      showToast('error', 'Error', 'Failed to load details');
      setSelectedDetails(payload);
    } finally {
      setDetailsLoading(false);
    }
  };

  const getItemIcon = (type: ComponentType | string): JSX.Element => {
    const lowerType = typeof type === 'string' ? type.toLowerCase() : '';
    if (lowerType.includes('video')) {
      return <PlayLesson />;
    }
    if (lowerType.includes('practice')) {
      return <Quiz />;
    }
    if (lowerType.includes('learning_object')) {
      return <LibraryBooks />;
    }
    if (lowerType.includes('topic')) {
      return <Category />;
    }
    if (lowerType.includes('assessment')) {
      return <Grading />;
    }
    if (lowerType.includes('exam')) {
      return <Star />;
    }
    if (lowerType.includes('activity')) {
      return <Grading />;
    }
    if (lowerType.includes('interactive')) {
      return <LocalActivity />;
    }
    if (lowerType.includes('h5p')) {
      return <LocalActivity />;
    }
    if (lowerType.includes('lesson')) {
      return <LibraryBooks />;
    }
    return <LibraryBooks />;
  };

  const buildLessonData = (): LessonItem[] => {
    const lessonItems: LessonItem[] = [];
    const rawLessons = visibleLessons || [];
    const processedIds = new Set<number>();   
    
    const getDefaultWeightage = (kind: 'assessment' | 'exam', item?: any): number | undefined => {
      if (!gradingScheme) return item?.weightage;
      if (kind === 'assessment') return item?.weightage ?? gradingScheme.assessment_weight;
      const name: string = (item?.name || '').toLowerCase();
      if (name.includes('mid') || name.includes('mid-term') || name.includes('mid term')) {
        return item?.weightage ?? gradingScheme.mid_term_weight;
      }
      return item?.weightage ?? gradingScheme.final_exam_weight;
    };

    const getTotalQuestions = (item: any): number => {
      const storedCount = questionsCount[item.id];
      if (storedCount !== undefined) {
        return storedCount;
      }
      if (item?.total_questions !== undefined) return item.total_questions;
      if (item?.question_count !== undefined) return item.question_count;
      return 0;
    };

    rawLessons.forEach((lesson) => {
      if (processedIds.has(lesson.id)) {
        return;
      }
      processedIds.add(lesson.id);
      
      if (lesson.type === 'learning_object') {
        const totalTopicsCount = (lesson as any).total_topics_count || 0;
        const hasChildren = totalTopicsCount > 0;      
        
        lessonItems.push({
          title: lesson.name || 'Unnamed Learning Object',
          description: lesson.description,
          icon: getItemIcon('learning_object'),
          count: `(Topics: ${String(totalTopicsCount).padStart(2, '0')})`,
          type: 'learning_object',
          id: lesson.id,
          children: hasChildren ? [] : undefined,
          childrenLoaded: false
        });

        (lesson.children || []).forEach((child) => {
          if (!processedIds.has(child.id)) {
            processedIds.add(child.id);
            
            if (child.type === 'assessment' || child.type === 'exam') {
              const totalQuestions = getTotalQuestions(child);
              const weight = getDefaultWeightage(child.type as 'assessment' | 'exam', child);
              
              lessonItems.push({
                title: child.name,
                description: child.description,
                icon: getItemIcon(child.type),
                count: `(Questions: ${String(totalQuestions).padStart(2, '0')}, Weightage: ${weight ?? '0'}%)`,
                type: child.type,
                id: child.id,
              });
            }
          }
        });
        
      } else if (lesson.type === 'assessment' || lesson.type === 'exam') {
        const totalQuestions = getTotalQuestions(lesson);
        const weight = getDefaultWeightage(lesson.type as 'assessment' | 'exam', lesson);
        
        lessonItems.push({
          title: lesson.name,
          description: lesson.description,
          icon: getItemIcon(lesson.type),
          count: `(Questions: ${String(totalQuestions).padStart(2, '0')}, Weightage: ${weight ?? '0'}%)`,
          type: lesson.type,
          id: lesson.id,
        });
      }
    });
    
    return lessonItems;
  };

  const loadChildrenOnDemand = async (parentId: number, parentType: string): Promise<LessonItem[]> => {
    try {
      if (parentType === 'learning_object') {
        const componentDetail = await ApiService.getComponentDetail(parentId);       
        if (componentDetail.component.learning_objects) {
          const learningObject = componentDetail.component.learning_objects[0];
          if (learningObject?.topics) {
            return learningObject.topics.map((topic: any) => ({
              title: topic.name,
              description: topic.description,
              icon: getItemIcon('topic'),
              count: `(Activities: ${String(topic.activities?.length || 0).padStart(2, '0')})`,
              type: 'topic',
              id: topic.id,
              children: topic.activities?.map((activity: any) => ({
                title: activity.name,
                description: activity.description,
                icon: getItemIcon(activity.type),
                count: '',
                type: activity.type,
                id: activity.id,
              })) || []
            }));
          }
        }
      }
      return [];
    } catch (error) {
      console.error('Failed to load children:', error);
      showToast('error', 'Error', 'Failed to load content');
      return [];
    }
  };

  const filterLessonsBySearch = (lessons: LessonItem[]): LessonItem[] => {
    if (!searchTerm.trim()) return lessons;
    const filterRecursive = (items: LessonItem[]): LessonItem[] => {
      return items.filter(item => {
        const matches = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.description?.toLowerCase().includes(searchTerm.toLowerCase());
        if (item.children) {
          const filteredChildren = filterRecursive(item.children);
          if (filteredChildren.length > 0) {
            return {
              ...item,
              children: filteredChildren
            };
          }
        }
        return matches;
      });
    };
    return filterRecursive(lessons);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const renderCourseIndexContent = () => {
    if (courseDataLoading) {
      return (
        <Card className="mb-4">
          <div className="p-3">
            <div className="flex justify-content-center align-items-center" style={{ height: '200px' }}>
              <div className="text-center">
                <i className="pi pi-spin pi-spinner text-4xl text-primary mb-3"></i>
                <div>Loading course data...</div>
              </div>
            </div>
          </div>
        </Card>
      );
    }
    if (hasEmptyLessons || allLessons.length === 0) {
      return (
        <Card className="mb-4">
          <div className="p-3">
            <div className="flex justify-content-center align-items-center" style={{ height: '200px' }}>
              <div className="text-center">
                <Inbox className="text-4xl text-400 mb-3" />
                <div className="text-600">No lessons available for this course</div>
              </div>
            </div>
          </div>
        </Card>
      );
    }
    const lessons = buildLessonData();
    const filteredLessons = filterLessonsBySearch(lessons);

    return (
      <Card className="mb-4">
        <div className="p-3">
          <div className="flex flex-column lg:flex-row gap-3 align-items-start lg:align-items-center justify-content-between mb-4">
            <div className="flex align-items-center gap-3 w-full lg:w-auto">
              <h3 className="m-0 text-900 font-semibold">Lessons</h3>
            </div>
            
            <div className="flex flex-column lg:flex-row gap-3 w-full lg:w-auto">
              <div className="w-full lg:w-auto" style={{ minWidth: '250px' }}>
                <span className="p-input-icon-left w-full">
                  <Search />
                  <InputText 
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search lessons..." 
                    className="w-full"
                  />
                </span>
              </div>
              <Button 
                label=" Add New Lesson" 
                icon={<Add />}
                className="p-button-primary w-full lg:w-auto"
                style={{ whiteSpace: 'nowrap' }}
              />
            </div>
          </div>
          <LessonTable 
            data={filteredLessons}
            onOpenDetails={openDetails}
            searchTerm={searchTerm}
            onLoadChildren={loadChildrenOnDemand}
          />
          {hasMore && (
            <div className="flex justify-content-center mt-4">
              <div className="text-600">
                <i className="pi pi-spin pi-spinner mr-2"></i>
                Loading more lessons... ({loadedCount} of {allLessons.length} loaded)
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  };

  const renderMainContent = () => {
    switch (activeSection) {
      case "course-index":
        return renderCourseIndexContent();
      case "info":
        return (
          <CourseInformation 
            course={course}
            courseMetadata={courseMetadata}
          />
        );
      case "grading":
        return (
          <GradingScheme 
            lessons={allLessons}
            courseId={courseId} 
          />
        );
      default:
        return null;
    }
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
        const data = await ApiService.getCourseOverview(idFromQuery);
        const courseData: CourseDetails = data.course as CourseDetails;      
        setCourse(courseData);
        setGradingScheme(data.course.grading_scheme || null);
        const lessonsData = (data.course.lessons || []).map((lesson: any) => ({
          ...lesson,
          children: lesson.children?.map((child: any) => ({
            ...child,
            weightage: child.weightage ?? false,
          })),
        }));
        if (!lessonsData || lessonsData.length === 0) {
          setHasEmptyLessons(true);
        } else {
          fetchQuestionsCount(lessonsData);
        }
        setAllLessons(lessonsData);
      } catch (err) {
        console.error("Failed to load course overview data", err);
        showToast('error', 'Error', 'Failed to load course data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, refreshTrigger, fetchQuestionsCount]);

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
          <Warning className="text-4xl text-warning mb-3" />
          <div className="text-xl font-semibold">Course not found</div>
          <Button
            label="Back to Courses"
            icon={<ArrowBack />}
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
          icon={<ArrowBack />}
          label="Back"
          className="p-button-text"
          onClick={handleBackClick} 
        />
      </div>
      <div className="grid">
        <div className="col-12 lg:col-2">
          <Card className="mb-4">
            <div className="flex flex-column align-items-center text-center">
              <Avatar
                size="xlarge"
                shape="circle"
                className="bg-primary mb-3 flex align-items-center justify-content-center"
                style={{ width: '80px', height: '80px' }}
              >
                <LibraryBooks sx={{ fontSize: 40, color: '#fff' }} />
              </Avatar>
              <div className="text-md font-bold text-900">{course.name}</div>
              <div className="text-600 text-sm mt-1">{course.program_of_study}</div>
              <div className="text-500 text-sm">{course.session}</div>
            </div>
            <hr></hr>
            <div className="surface-card mb-4">
              <ul className="list-none p-0 m-0">
                <li
                  className={`p-3 cursor-pointer flex align-items-center gap-2 border-round ${
                    activeSection === "info" ? "bg-primary text-white" : "hover:surface-hover"
                  }`}
                  onClick={() => handleSectionChange("info")}
                >
                  <Info />
                  <span>Course Information</span>
                </li>
                <li
                  className={`p-3 cursor-pointer flex align-items-center gap-2 border-round ${
                    activeSection === "course-index" ? "bg-primary text-white" : "hover:surface-hover"
                  }`}
                  onClick={() => handleSectionChange("course-index")}
                >
                  <List />
                  <span>Course</span>
                </li>
                <li
                  className={`p-3 cursor-pointer flex align-items-center gap-2 border-round ${
                    activeSection === "grading" ? "bg-primary text-white" : "hover:surface-hover"
                  }`}
                  onClick={() => handleSectionChange("grading")}
                >
                  <Percent />
                  <span>Grading Scheme</span>
                </li>
              </ul>
            </div>
          </Card>
        </div>
        <div className="col-12 lg:col-9">
          {renderMainContent()}
        </div>
      </div>
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