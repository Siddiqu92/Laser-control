"use client";
import React, { useEffect, useMemo, useState } from "react";
import { FilterMatchMode, FilterOperator } from "primereact/api";

import { Filters } from "./Filters";
import { StudentTable } from "./StudentTable";
import { Pagination } from "./Pagination";
import StudentProgress from "./StudentProgress";
import AssessmentResult from "./AssessmentResult";
import { Header } from "./Header";
import { Legend } from "./Legend";
import { Checkbox } from "primereact/checkbox";
import { Student, Lesson, StatusValue } from "./types";
import { getFilteredStudents } from "./utils";
import { usePrograms } from "../hooks/usePrograms";
import { useDashboard } from "../hooks/useDashboard";
import { useStudentProgress } from "../hooks/useStudentProgress";

export default function SchoolDashboard() {
  const { programs, loading: programsLoading } = usePrograms();
  const {
    dashboardData,
    fetchDashboardData,
    loadedCourseName,
    loading,
    first,
    setFirst,
    setDashboardData,
  } = useDashboard();
  const {
    progressVisible,
    setProgressVisible,
    progressLoading,
    progressData,
    progressMeta,
    setProgressMeta,
    isAssessment,
    fetchStudentProgress,
  } = useStudentProgress(null);

  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<StatusValue[]>([]);
  const [rows, setRows] = useState(25);

  const [filters, setFilters] = useState<any>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
  });

  const [contentFilters, setContentFilters] = useState({
    learningObjects: true,
    assessments: true,
    exams: true,
  });

 
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
  }, [programs, selectedGrade, selectedSubject, fetchDashboardData]);

 
  useEffect(() => {
    setSelectedSubject(null);
    setSelectedCourseId(null);
  }, [selectedGrade]);

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

  const filteredStudents: Student[] = useMemo(() => {
    return getFilteredStudents(
      (dashboardData?.students || []) as Student[],
      selectedStatuses
    );
  }, [dashboardData?.students, selectedStatuses]);

  const sortedLessons: Lesson[] = useMemo(() => {
    if (!dashboardData?.lessons) return [];

    return [...dashboardData.lessons]
      .map((lesson) => ({ ...lesson, sort: lesson.sort ?? 0 }))
      .filter((lesson) => {
        const type = lesson.type?.toLowerCase() || "";
        if (type.includes("learning") || type.includes("object")) {
          return contentFilters.learningObjects;
        } else if (type.includes("assessment")) {
          return contentFilters.assessments;
        } else if (type.includes("exam")) {
          return contentFilters.exams;
        }
        return true;
      })
      .sort((a, b) => a.sort - b.sort);
  }, [dashboardData?.lessons, contentFilters]);

  const currentPageStudents = useMemo(() => {
    return filteredStudents.slice(first, first + rows);
  }, [filteredStudents, first, rows]);

  const onPageChange = (event: any) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  const openProgressFromCell = (payload: any) => {
    setProgressMeta(payload);
    fetchStudentProgress(payload.studentId, payload.lessonId, payload.lessonType);
  };

  const toggleContentFilter = (type: keyof typeof contentFilters) => {
    setContentFilters((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  if (loading || programsLoading)
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
  <div className="flex align-items-center gap-3">
    <div className="flex gap-3">
      {["learningObjects", "assessments", "exams"].map((filter) => (
        <div key={filter} className="flex align-items-center">
          <Checkbox
            inputId={`${filter}Filter`}
            checked={contentFilters[filter as keyof typeof contentFilters]}
            onChange={() =>
              toggleContentFilter(filter as keyof typeof contentFilters)
            }
          />
          <label htmlFor={`${filter}Filter`} className="ml-2 text-sm">
            {filter === "learningObjects"
              ? "Lessons"
              : filter.charAt(0).toUpperCase() + filter.slice(1)}
          </label>
        </div>
      ))}
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
          
  isPractice={false}
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
