"use client";
import { useState, useEffect, useMemo } from "react";
import { ApiService } from "@/service/api";
import Filters from "./Filters";
import StudentTable from "./StudentTable";
import Pagination from "./Pagination";
import StudentProgress from "./StudentProgress"; 
import { getFilteredStudents } from "./utils";
import { DashboardData, StatusValue, Lesson, Student } from "./types";

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

  const fetchDashboardData = async (courseId: string) => {
    try {
      setLoading(true);
      const data = await ApiService.getStudentDashboard(courseId);
      setDashboardData(data || { lessons: [], students: [] });
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
          fetchDashboardData(firstCourse.id);
        }
      }
    }
  }, [programs, selectedGrade, selectedSubject]);

  const filterOptions = useMemo(() => {
    const grades = Array.from(new Set(programs.map((p) => p.name))).map((name) => ({ label: name, value: name }));
    let subjects: { label: string; value: string; courseId: string }[] = [];
    if (selectedGrade) {
      const selectedProgram = programs.find((p) => p.name === selectedGrade);
      if (selectedProgram) {
        subjects = selectedProgram.courses
          .map((c: any) => ({ label: c.course_id?.name, value: c.course_id?.name, courseId: c.course_id?.id }))
          .filter((c: any) => Boolean(c.label));
      }
    }
    const statuses = [
      { label: "Completed", value: "completed" as StatusValue },
      { label: "In Progress", value: "in-progress" as StatusValue },
      { label: "Not Started", value: "not-started" as StatusValue },
    ];
    return { grades, subjects, statuses };
  }, [programs, selectedGrade]);

  useEffect(() => {
    setSelectedSubject(null);
    setSelectedCourseId(null);
  }, [selectedGrade]);

  const filteredStudents: Student[] = getFilteredStudents(dashboardData?.students || [], selectedStatuses);
  const sortedLessons: Lesson[] = useMemo(() => {
    if (!dashboardData?.lessons) return [];
    return [...dashboardData.lessons].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  }, [dashboardData?.lessons]);

  const onPageChange = (event: any) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  const currentPageStudents = filteredStudents.slice(first, first + rows);

  if (loading) return <div className="flex justify-content-center align-items-center min-h-screen">Loading data...</div>;

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card h-auto">
          <div className="flex justify-content-between mb-6">
            <span className="text-900 text-xl font-semibold">Subject Progress Dashboard</span>
          </div>

          {/* Filters */}
          <Filters
            filterOptions={filterOptions}
            selectedGrade={selectedGrade}
            setSelectedGrade={setSelectedGrade}
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
            setSelectedCourseId={setSelectedCourseId}
            selectedStatuses={selectedStatuses}
            setSelectedStatuses={setSelectedStatuses}
            onLoad={() => {
              if (selectedCourseId) {
                fetchDashboardData(selectedCourseId);
              } else {
                setDashboardData({ lessons: [], students: [] });
              }
            }}
          />

          {/* Course Info */}
          <div className="mb-4 p-3 bg-gray-100 border-round">
            <div className="text-lg font-semibold">
              Loaded Course: {selectedSubject || "All Subjects"} | Total Students: {filteredStudents.length}
            </div>
          </div>

          {/* Table */}
          <StudentTable
            students={currentPageStudents}
            lessons={sortedLessons}
            first={first}
            onCellClick={(studentId: string, lessonId: number, type: string) => {
              if (type === "learning_object") {
                setActiveStudent(studentId);
                fetchStudentProgress(studentId, lessonId);
              }
            }}
          />

          {/* Pagination */}
          {filteredStudents.length > 0 && (
            <Pagination first={first} rows={rows} totalRecords={filteredStudents.length} onPageChange={onPageChange} />
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
            ? `${currentPageStudents.find(s => s.id === activeStudent)?.first_name || ''} ${currentPageStudents.find(s => s.id === activeStudent)?.last_name || ''}`
            : "Student"
        }
      />
    </div>
  );
}