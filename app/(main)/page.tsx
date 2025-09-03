"use client";
import React, { useState, useEffect, useMemo } from "react";
import { ApiService } from "@/service/api";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { Filters } from "./Filters";
import { StudentTable } from "./StudentTable";
import { Pagination } from "./Pagination";
import StudentProgress from "./StudentProgress";
import AssessmentResult from "./AssessmentResult";
import { DashboardData, StatusValue, Student, Lesson } from "./types";
import { getFilteredStudents } from "./utils";

type ProgressMeta = {
  studentId: string;
  studentName: string;
  lessonId: number;
  lessonName: string;
  lessonType: string;
  obtained?: number | null;
};

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
    const grades = Array.from(new Set(programs.map((p) => p.name))).map((name) => ({
      label: name,
      value: name,
    }));

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

    return { grades, subjects };
  }, [programs, selectedGrade]);

  useEffect(() => {
    setSelectedSubject(null);
    setSelectedCourseId(null);
  }, [selectedGrade]);

  const filteredStudents: Student[] = useMemo(() => {
    return getFilteredStudents(dashboardData?.students || [], selectedStatuses);
  }, [dashboardData?.students, selectedStatuses]);

  const sortedLessons: Lesson[] = useMemo(() => {
    if (!dashboardData?.lessons) return [];
    return [...dashboardData.lessons].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  }, [dashboardData?.lessons]);

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
          {/* Header */}
          <div className="flex justify-content-between align-items-center mb-4">
            <h5 className="">Teacher Dashboard</h5>
          </div>

          {/* Filters */}
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
              loadedCourseName={selectedSubject}
              onLoad={() => {
                if (selectedCourseId && selectedSubject) {
                  fetchDashboardData(selectedCourseId, selectedSubject);
                } else {
                  setDashboardData({ lessons: [], students: [] });
                }
              }}
            />
          </div>



 {/* Legend */}
  <div className="flex gap-4">
    <div className="flex align-items-center gap-2">
      <span className="pi pi-check-circle text-green-500" style={{ fontSize: "1.1rem" }} />
      <span className="p-text-secondary text-sm">Completed</span>
    </div>
    <div className="flex align-items-center gap-2">
      <span
        style={{
          display: "inline-block",
          padding: "0.1rem 0.3rem",
          borderRadius: "4px",
          fontSize: "0.7rem",
          fontWeight: 600,
          background: "#fffbeb",
          color: "#d97706",
          border: "1px solid #d9770620",
          minWidth: "2rem",
          textAlign: "center",
        }}
      >
        50%
      </span>
      <span className="p-text-secondary text-sm">In Progress</span>
    </div>
    <div className="flex align-items-center gap-2">
      <span className="pi pi-times-circle text-pink-500" style={{ fontSize: "1.1rem" }} />
      <span className="p-text-secondary text-sm">Not Started</span>
    </div>
  </div>

          {/* Student Table */}
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

          {/* Pagination */}
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

      {/* Progress Popup */}
      {isAssessment ? (
        <AssessmentResult
          visible={progressVisible}
          onHide={() => setProgressVisible(false)}
          loading={progressLoading}
          assessmentData={progressData}
          studentName={progressMeta?.studentName || "Student"} />
      ) : (
        <StudentProgress
          visible={progressVisible}
          onHide={() => setProgressVisible(false)}
          loading={progressLoading}
          topics={progressData}
          itemName={progressMeta?.lessonName || ""}
          itemType={progressMeta?.lessonType || ""}
          obtainedPercent={
            typeof progressMeta?.obtained === "number" ? progressMeta?.obtained : null
          }
          studentName={progressMeta?.studentName || "Student"}
        />
      )}
    </div>
  );
}
