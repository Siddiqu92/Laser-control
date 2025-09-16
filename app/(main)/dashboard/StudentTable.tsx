import React from "react";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Student, Lesson } from "./types";
import { getProgressIcon } from "./utils";

interface StudentTableProps {
  students: Student[];
  lessons: Lesson[];
  first: number;
  loading: boolean;
  filters: any;
  onOpenProgress: (payload: {
    studentId: string;
    studentName: string;
    lessonId: number;
    lessonName: string;
    lessonType: string;
    obtained?: number | null;
  }) => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  lessons,
  first,
  loading,
  filters,
  onOpenProgress,
}) => {
  // Use lessons as they are, without special sorting for final exams
  const sortedLessons = React.useMemo(() => {
    return [...lessons]; // Just return a copy of the original lessons array
  }, [lessons]);

  const studentTemplate = (student: Student) => (
    <span className="text-color">
      {student.first_name} {student.last_name}
    </span>
  );

  const percentPill = (num: number) => (
    <span
      className="inline-block text-xs font-semibold px-2 py-1 rounded text-center"
      style={{
        background: "rgb(254, 252, 232)", // Light yellow background
        color: "rgb(217, 119, 6)", // Yellow/orange text color
        border: "1px solid rgba(217, 119, 6, 0.2)", // Subtle border
        minWidth: "2.5rem",
      }}
    >
      {`${Math.round(num)}%`}
    </span>
  );

  const lessonTemplate = (lesson: Lesson, student: Student) => {
    const progress = student.lessons_progress.find(
      (lp) => lp.lesson_id === lesson.id
    );

    const studentName = `${student.first_name ?? ""} ${student.last_name ?? ""}`.trim();

    const handleClick = () =>
      onOpenProgress({
        studentId: student.id,
        studentName,
        lessonId: lesson.id,
        lessonName: lesson.name,
        lessonType: lesson.type,
        obtained: progress?.progress ?? null,
      });

    const value = progress?.progress ?? null;
    const isAssessmentOrExam =
      lesson.type?.toLowerCase() === "assessment" ||
      lesson.type?.toLowerCase() === "exam" ||
      lesson.type?.toLowerCase().includes("final exam");

    return (
      <div
        onClick={handleClick}
        className="flex justify-content-center align-items-center cursor-pointer hover:text-primary"
      >
        {isAssessmentOrExam ? (
          typeof value === "number" && value > 0 ? (
            percentPill(value)
          ) : (
            <i className="pi pi-times-circle text-red-500" style={{ fontSize: "1.2rem" }}></i>
          )
        ) : (
          <>
            {value === null || value <= 0 || value === -1 ? (
              <i className="pi pi-times-circle text-red-500"  style={{ fontSize: "1.2rem" }}></i> 
            ) : (
              getProgressIcon(value)
            )}
          </>
        )}
      </div>
    );
  };

  const indexTemplate = (_: any, options: any) => (
    <span className="text-color-secondary">{first + options.rowIndex + 1}</span>
  );

  const lessonHeaderTemplate = (lesson: Lesson) => (
    <div
      className="text-center font-medium"
      style={{
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: "10rem",
        margin: "0 auto",
      }}
      title={lesson.name}
    >
      {lesson.name}
    </div>
  );


 const formatLessonType = (type: string) => {
  if (!type) return "";
  const lower = type.toLowerCase();
  if (lower.includes("learning_object") || lower.includes("learning object")) return "Lesson";
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
};


  return (
    <DataTable
      value={students}
      paginator={false}
      showGridlines
      scrollable
      scrollHeight="70vh"
      dataKey="id"
      filters={filters}
      filterDisplay="menu"
      loading={loading}
      responsiveLayout="scroll"
      emptyMessage="No students found."
      tableStyle={{ minWidth: "60rem" }}
      className="p-datatable-sm"
      sortField="first_name"
      sortOrder={1}
    >
      {/* Index */}
      <Column
        header="#"
        body={indexTemplate}
        headerStyle={{
          minWidth: "3rem",
          textAlign: "center",
          position: "sticky",
          left: 0,
          background: "var(--surface-card)",
          color: "var(--text-color)",
          zIndex: 2,
        }}
        bodyStyle={{
          minWidth: "3rem",
          textAlign: "center",
          position: "sticky",
          left: 0,
          background: "var(--surface-card)",
          color: "var(--text-color)",
          zIndex: 1,
        }}
        frozen
      />

      {/* Student Name */}
      <Column
        field="first_name"
        header="Student"
        body={studentTemplate}
        sortable
        headerStyle={{
          minWidth: "12rem",
          position: "sticky",
          left: "3rem",
          background: "var(--surface-card)",
          color: "var(--text-color)",
          zIndex: 2,
        }}
        bodyStyle={{
          minWidth: "12rem",
          position: "sticky",
          left: "3rem",
          background: "var(--surface-card)",
          color: "var(--text-color)",
          zIndex: 1,
        }}
        frozen
      />

      {/* Lessons - Using lessons as they are, without special sorting */}
      {sortedLessons.map((lesson) => (
        <Column
          key={lesson.id}
          header={lessonHeaderTemplate(lesson)}
          body={(student: Student) => lessonTemplate(lesson, student)}
          style={{ minWidth: "10rem", textAlign: "center" }}
        headerTooltip={`${lesson.name} - ${formatLessonType(lesson.type || '')}`}
          headerStyle={{
            background: "var(--surface-card)",
            color: "var(--text-color)",
            textAlign: "center",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "10rem",
          }}
        />
      ))}
    </DataTable>
  );
};