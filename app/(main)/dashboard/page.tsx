"use client";
import React, { useState, useEffect, useMemo } from "react";
import { ApiService } from "@/service/api";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { InputText } from "primereact/inputtext";
import StudentProgress from "./StudentProgress";
import { DashboardData, StatusValue, Student, Lesson } from "./types";
import { getFilteredStudents } from "./utils";
import { Filters } from "./Filters";
import { StudentTable } from "./StudentTable";
import {  Pagination } from "./Pagination";

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
  const [progressTopics, setProgressTopics] = useState<any[]>([]);
  const [activeStudent, setActiveStudent] = useState<string | null>(null);
  const [loadedCourseName, setLoadedCourseName] = useState<string | null>(null);

  const [filters, setFilters] = useState<any>({});
  const [globalFilterValue, setGlobalFilterValue] = useState("");

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

  const fetchStudentProgress = async (studentId: string, lessonId: number) => {
    try {
      setProgressLoading(true);
      setProgressVisible(true);
      const response = await ApiService.getStudentProgress(studentId, lessonId);
      const topicsData = response?.data || response || [];
      setProgressTopics(topicsData);
    } catch (err) {
      console.error("Error fetching student progress:", err);
      setProgressTopics([]);
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

    return { grades, subjects };
  }, [programs, selectedGrade]);

  useEffect(() => {
    setSelectedSubject(null);
    setSelectedCourseId(null);
  }, [selectedGrade]);

  const filteredStudents: Student[] = getFilteredStudents(
    dashboardData?.students || [],
    selectedStatuses
  );

  const sortedLessons: Lesson[] = useMemo(() => {
    if (!dashboardData?.lessons) return [];
    return [...dashboardData.lessons].sort(
      (a, b) => (a.sort ?? 0) - (b.sort ?? 0)
    );
  }, [dashboardData?.lessons]);

  const onPageChange = (event: any) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  const currentPageStudents = filteredStudents.slice(first, first + rows);

  const initFilters = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      name: {
        operator: FilterOperator.AND,
        constraints: [
          { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        ],
      }
    });
    setGlobalFilterValue("");
  };

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let _filters = { ...filters };
    (_filters["global"] as any).value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const onCellClick = (studentId: string, lessonId: number, type: string) => {
    if (type === "learning_object") {
      setActiveStudent(studentId);
      fetchStudentProgress(studentId, lessonId);
    }
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
          
          {/* Header with Legend aligned left & right */}
          <div className="flex justify-content-between align-items-center mb-4">
            {/* Left side - Heading */}
            <h5 className="">Teacher Dashboard</h5>

            {/* Right side - Legend */}
            <div className="flex gap-4">
              <div className="flex align-items-center gap-2">
                <span 
                  className="pi pi-check-circle text-green-500" 
                  style={{ fontSize: "1.1rem" }}
                />
                <span style={{ color: "#495057", fontSize: "0.9rem" }}>Completed</span>
              </div>
              <div className="flex align-items-center gap-2">
                <span style={{ 
                  display: "inline-block",
                  padding: "0.1rem 0.3rem",
                  borderRadius: "4px",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  background: "#fffbeb",
                  color: "#d97706",
                  border: "1px solid #d9770620",
                  minWidth: "2rem",
                  textAlign: "center"
                }}>
                  50%
                </span>
                <span style={{ color: "#495057", fontSize: "0.9rem" }}>In Progress</span>
              </div>
              <div className="flex align-items-center gap-2">
                <span 
                  className="pi pi-times-circle text-pink-500" 
                  style={{ fontSize: "1.1rem" }}
                />
                <span style={{ color: "#495057", fontSize: "0.9rem" }}>Not Started</span>
              </div>
            </div>
          </div>

          {/* Filters Section */}
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
              onLoad={() => {
                if (selectedCourseId && selectedSubject) {
                  fetchDashboardData(selectedCourseId, selectedSubject);
                } else {
                  setDashboardData({ lessons: [], students: [] });
                  setLoadedCourseName(null);
                }
              }}
            />
          </div>
{/* Combined Header and Table Container */}
<div className="mb-4" style={{ borderRadius: '6px' }}>
  
  {/* Course Info - Top Line */}
  <div className="p-2">
    <div className="text-md font-bold text-900">
      {loadedCourseName || "None"}
    </div>
  </div>

  {/* Heading + Search Bar */}
  <div className="p-3 flex justify-content-between align-items-center">
    {/* Heading */}
   <h3 className="text-lg font-semibold text-black m-0">
  Student Progress Overview
</h3>


    {/* Search bar */}
    <div className="flex align-items-center">
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          value={globalFilterValue}
          onChange={onGlobalFilterChange}
          placeholder="Keyword Search"
          style={{ width: '250px' }}
        />
      </span>
    </div>
  </div>

  {/* Student Table */}
  <div>
    <StudentTable
      students={currentPageStudents}
      lessons={sortedLessons}
      first={first}
      loading={loading}
      filters={filters}
      onCellClick={onCellClick}
    />
  </div>
</div>

{/* Single Paginator at the bottom */}
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

      {/* Student Progress Modal */}
      <StudentProgress
        visible={progressVisible}
        onHide={() => setProgressVisible(false)}
        loading={progressLoading}
        topics={progressTopics}
        studentName={
          activeStudent
            ? `${currentPageStudents.find((s) => s.id === activeStudent)?.first_name || ""} ${
                currentPageStudents.find((s) => s.id === activeStudent)?.last_name || ""
              }`
            : "Student"
        }
      />
    </div>
  );
}