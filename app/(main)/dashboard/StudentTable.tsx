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
  onCellClick: (studentId: string, lessonId: number, type: string) => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  lessons,
  first,
  loading,
  filters,
  onCellClick,
}) => {
  const studentTemplate = (student: Student) => {
    return (
      <span className="text-color">
        {student.first_name} {student.last_name}
      </span>
    );
  };

  const lessonTemplate = (lesson: Lesson, student: Student) => {
    const progress = student.lessons_progress.find(
      (lp) => lp.lesson_id === lesson.id
    );
    const clickable = lesson.type === "learning_object";

    return (
      <div
        onClick={() =>
          clickable ? onCellClick(student.id, lesson.id, lesson.type) : undefined
        }
        className={`flex justify-content-center align-items-center ${
          clickable ? "cursor-pointer hover:text-primary" : ""
        }`}
      >
        {progress ? getProgressIcon(progress.progress) : "—"}
      </div>
    );
  };

  const indexTemplate = (_: any, options: any) => {
    return (
      <span className="text-color-secondary">
        {first + options.rowIndex + 1}
      </span>
    );
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
      tableStyle={{ minWidth: "70rem" }}
      className="p-datatable-sm"
      sortField="first_name"   
      sortOrder={1}            
    >
      {/* Index Column */}
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
          minWidth: "14rem",
          position: "sticky",
          left: "3rem",
          background: "var(--surface-card)",
          color: "var(--text-color)",
          zIndex: 2,
        }}
        bodyStyle={{
          minWidth: "14rem",
          position: "sticky",
          left: "3rem",
          background: "var(--surface-card)",
          color: "var(--text-color)",
          zIndex: 1,
        }}
        frozen
      />

      {/* Lessons with type in header */}
      {lessons.map((lesson) => (
        <Column
          key={lesson.id}
          header={
            <div className="text-center white-space-nowrap overflow-hidden text-overflow-ellipsis">
              <div className="font-medium">{lesson.name}</div>
              <small className="text-color-secondary text-xs">
                {lesson.type === "learning_object"
                  ? "Learning Object"
                  : lesson.type === "assessment"
                  ? "Assessment"
                  : lesson.type === "exam"
                  ? "Exam"
                  : lesson.type === "fun_activity"
                  ? "Fun Activity"
                  : lesson.type}
              </small>
            </div>
          }
          body={(student: Student) => lessonTemplate(lesson, student)}
          style={{ minWidth: "12rem", textAlign: "center" }}
          headerTooltip={`${lesson.name} (${lesson.type})`}
          headerStyle={{
            background: "var(--surface-card)",
            color: "var(--text-color)",
          }}
        />
      ))}
    </DataTable>
  );
};