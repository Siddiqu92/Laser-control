"use client";
import React, { useState, useEffect, useMemo } from "react";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { ApiService } from "../../../service/api";
import { Filters } from "./Filters";
import { StudentTable } from "./StudentTable";
import { Pagination } from "./Pagination";
import StudentProgress from "./StudentProgress";
import AssessmentResult from "./AssessmentResult";
import { Header } from "./Header";
import { Legend } from "./Legend";
import { DashboardData,  Lesson,  Student,  StatusValue,  ProgressMeta,} from "./types";
import { getFilteredStudents } from "./utils";

export default function SchoolDashboard() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<StatusValue[]>([]);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [loadedCourseName, setLoadedCourseName] = useState<string | null>(null);
  const [progressVisible, setProgressVisible] = useState(false);
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressData, setProgressData] = useState<any>(null);
  const [progressMeta, setProgressMeta] = useState<ProgressMeta | null>(null);
  const [isAssessment, setIsAssessment] = useState(false);
  const [filters, setFilters] = useState<any>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
  });
  
  // New state for content type filters
  const [contentFilters, setContentFilters] = useState({
    learningObjects: true,
    assessments: true,
    exams: true
  });

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const programsData = await ApiService.getProgramOfStudyDetailed();
        setPrograms(programsData || []);
      } catch (err) {
        console.error("Error fetching programs:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPrograms();
  }, []);

  const fetchDashboardData = async (courseId: string, courseName: string) => {
    try {
      setLoading(true);
      const data = await ApiService.getStudentDashboard(courseId);
      setDashboardData(data || { lessons: [], students: [] });
      setLoadedCourseName(courseName);
      setFirst(0);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentProgress = async (
    studentId: string,
    lessonId: number,
    lessonType: string
  ) => {
    try {
      setProgressLoading(true);
      setProgressVisible(true);
      setIsAssessment(lessonType.toLowerCase() === "assessment");

      let response: any;

      if (lessonType.toLowerCase() === "assessment") {
        response = await ApiService.getStudentAssessmentProgress(
          studentId,
          selectedCourseId as string,
          lessonId
        );
      } else {
        response = await ApiService.getStudentProgress(studentId, lessonId);
      }

      const topicsData = response?.data || response || [];
      setProgressData(topicsData);
    } catch (err) {
      console.error("Error fetching student progress:", err);
      setProgressData(null);
    } finally {
      setProgressLoading(false);
    }
  };

  useEffect(() => {
    if (programs.length > 0 && !selectedGrade && !selectedSubject) {
      const firstProgram = programs[0];
      if (firstProgram) {
        const firstGrade = firstProgram.name;
        const firstCourse = firstProgram.courses[0]?.course_id;
        if (firstCourse) {
          setSelectedGrade(firstGrade);
          setSelectedSubject(firstCourse.name);
          setSelectedCourseId(firstCourse.id);
          fetchDashboardData(firstCourse.id, firstCourse.name);
        }
      }
    }
  }, [programs, selectedGrade, selectedSubject]);

  const filterOptions = useMemo(() => {
    const grades = Array.from(new Set(programs.map((p) => p.name))).map(
      (name) => ({ label: name, value: name })
    );

    let subjects: { label: string; value: string; courseId: string }[] = [];
    if (selectedGrade) {
      const selectedProgram = programs.find((p) => p.name === selectedGrade);
      if (selectedProgram) {
        subjects = selectedProgram.courses
          .map((c: any) => ({
            label: c.course_id?.name,
            value: c.course_id?.name,
            courseId: c.course_id?.id,
          }))
          .filter((c: any) => Boolean(c.label));
      }
    }

    const statuses = selectedStatuses.map((status) => ({
      label: status.toLowerCase(),
      value: status.toLowerCase() as StatusValue,
    }));

    return { grades, subjects, statuses };
  }, [programs, selectedGrade, selectedStatuses]);

  useEffect(() => {
    setSelectedSubject(null);
    setSelectedCourseId(null);
    setLoadedCourseName(null);
  }, [selectedGrade]);

  const filteredStudents: Student[] = useMemo(() => {
    return getFilteredStudents(
      (dashboardData?.students || []) as Student[],
      selectedStatuses
    );
  }, [dashboardData?.students, selectedStatuses]);

  // Filter lessons based on content type filters
  const sortedLessons: Lesson[] = useMemo(() => {
    if (!dashboardData?.lessons) return [];
    
    return [...dashboardData.lessons]
      .map((lesson) => ({
        ...lesson,
        sort: lesson.sort ?? 0,
      }))
      .filter((lesson) => {
        const type = lesson.type?.toLowerCase() || '';
        if (type.includes('learning') || type.includes('object')) {
          return contentFilters.learningObjects;
        } else if (type.includes('assessment')) {
          return contentFilters.assessments;
        } else if (type.includes('exam')) {
          return contentFilters.exams;
        }
        return true; // Show by default if type is not recognized
      })
      .sort((a, b) => a.sort - b.sort);
  }, [dashboardData?.lessons, contentFilters]);

  const onPageChange = (event: any) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  const currentPageStudents = useMemo(() => {
    return filteredStudents.slice(first, first + rows);
  }, [filteredStudents, first, rows]);

  const openProgressFromCell = (payload: ProgressMeta) => {
    setProgressMeta(payload);
    fetchStudentProgress(payload.studentId, payload.lessonId, payload.lessonType);
  };

  // Toggle content type filters
  const toggleContentFilter = (type: keyof typeof contentFilters) => {
    setContentFilters(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  if (loading)
    return (
      <div className="flex justify-content-center align-items-center min-h-screen">
        Loading data...
      </div>
    );

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card shadow-2 p-4">
          <Header />

          <div className="mb-4">
            <Filters
              selectedGrade={selectedGrade}
              setSelectedGrade={setSelectedGrade}
              selectedSubject={selectedSubject}
              setSelectedSubject={setSelectedSubject}
              setSelectedCourseId={setSelectedCourseId}
              selectedStatuses={selectedStatuses}
              setSelectedStatuses={setSelectedStatuses} 
              filterOptions={filterOptions}
              loadedCourseName={loadedCourseName}
              onLoad={() => {
                if (selectedCourseId && selectedSubject) {
                  fetchDashboardData(selectedCourseId, selectedSubject);
                } else {
                  setDashboardData({ lessons: [], students: [] });
                }
              }}
            />
          </div>

          <div className="flex justify-content-between align-items-center mb-3">
            <Legend />
            
            {/* Content Type Filters */}
            <div className="flex align-items-center gap-3">
              <span className="font-bold text-color-secondary">Show:</span>
              <div className="flex gap-2">
                <div className="flex align-items-center">
                  <input
                    type="checkbox"
                    id="learningObjectsFilter"
                    checked={contentFilters.learningObjects}
                    onChange={() => toggleContentFilter('learningObjects')}
                    className="mr-2"
                  />
                  <label htmlFor="learningObjectsFilter" className="text-sm">
                    Learning Objects
                  </label>
                </div>
                <div className="flex align-items-center">
                  <input
                    type="checkbox"
                    id="assessmentsFilter"
                    checked={contentFilters.assessments}
                    onChange={() => toggleContentFilter('assessments')}
                    className="mr-2"
                  />
                  <label htmlFor="assessmentsFilter" className="text-sm">
                    Assessments
                  </label>
                </div>
                <div className="flex align-items-center">
                  <input
                    type="checkbox"
                    id="examsFilter"
                    checked={contentFilters.exams}
                    onChange={() => toggleContentFilter('exams')}
                    className="mr-2"
                  />
                  <label htmlFor="examsFilter" className="text-sm">
                    Exams
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <StudentTable
              students={currentPageStudents}
              lessons={sortedLessons}
              first={first}
              loading={loading}
              filters={filters}
              onOpenProgress={openProgressFromCell}
            />
          </div>

          {filteredStudents.length > 0 && (
            <Pagination
              first={first}
              rows={rows}
              totalRecords={filteredStudents.length}
              onPageChange={onPageChange}
            />
          )}
        </div>
      </div>

      {isAssessment ? (
        <AssessmentResult
          visible={progressVisible}
          onHide={() => setProgressVisible(false)}
          loading={progressLoading}
          assessmentData={progressData}
          studentName={progressMeta?.studentName || "Student"}
        />
      ) : (

<StudentProgress
  visible={progressVisible}
  onHide={() => setProgressVisible(false)}
  loading={progressLoading}
  topics={progressData}
  itemName={progressMeta?.lessonName || ""}
  itemType={progressMeta?.lessonType || ""}
  obtainedPercent={
    typeof progressMeta?.obtained === "number"
      ? progressMeta?.obtained
      : null
  }
  studentName={progressMeta?.studentName || "Student"}
  studentId={progressMeta?.studentId || ""} 
  courseId={selectedCourseId || ""} 
/>
      )}
    </div>
  );
}