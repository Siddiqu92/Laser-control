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
  const studentTemplate = (student: Student) => (
    <span className="text-color">
      {student.first_name} {student.last_name}
    </span>
  );

  // Badge helper
  const getBadge = (value: number) => {
    const rounded = Math.round(value);
    let bg = "";
    let text = "";
    let border = "";

    if (rounded >= 75) {
      bg = "rgb(240, 253, 244)";
      text = "rgb(22, 163, 74)";
      border = "rgba(22, 163, 74, 0.125)";
    } else if (rounded >= 50) {
      bg = "rgb(255, 251, 235)";
      text = "rgb(217, 119, 6)";
      border = "rgba(217, 119, 6, 0.125)";
    } else {
      bg = "rgb(254, 242, 242)";
      text = "rgb(220, 38, 38)";
      border = "rgba(220, 38, 38, 0.125)";
    }

    return (
      <span
        style={{
          display: "inline-block",
          padding: "0.25rem 0.5rem",
          borderRadius: "4px",
          fontSize: "0.75rem",
          fontWeight: 600,
          background: bg,
          color: text,
          lineHeight: 1.2,
          minWidth: "2.5rem",
          textAlign: "center",
          border: `1px solid ${border}`,
        }}
      >
        {`${rounded}%`}
      </span>
    );
  };

  const lessonTemplate = (lesson: Lesson, student: Student) => {
    const progress = student.lessons_progress.find(
      (lp) => lp.lesson_id === lesson.id
    );
    const clickable = lesson.type === "learning_object";

    if (!progress) {
      return <span>—</span>;
    }

    const value = progress.progress;

    // Not started cases (-1 or 0)
    if (value <= 0 || value === -1) {
      return (
        <div className="flex justify-content-center align-items-center">
          <i className="pi pi-times-circle text-red-500"></i>
        </div>
      );
    }

    // Assessment / Exam / % based lessons
    if (lesson.type === "assessment" || lesson.type === "exam") {
      return (
        <div className="flex justify-content-center align-items-center">
          {getBadge(value)}
        </div>
      );
    }

    // Learning Object rules
    if (lesson.type === "learning_object") {
      return (
        <div
          onClick={() =>
            clickable ? onCellClick(student.id, lesson.id, lesson.type) : undefined
          }
          className={`flex justify-content-center align-items-center ${
            clickable ? "cursor-pointer hover:text-primary" : ""
          }`}
        >
          {getProgressIcon(value)}
        </div>
      );
    }

    // Other lesson types (show badge instead of plain text as well)
    return (
      <div className="flex justify-content-center align-items-center">
        {getBadge(value)}
      </div>
    );
  };

  const indexTemplate = (_: any, options: any) => (
    <span className="text-color-secondary">{first + options.rowIndex + 1}</span>
  );

  const lessonHeaderTemplate = (lesson: Lesson) => {
    if (lesson.type === "learning_object") {
      return (
        <div
          className="text-center font-medium"
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "8rem",
            margin: "0 auto",
          }}
        >
          {lesson.name}
        </div>
      );
    }

    if (lesson.type === "assessment") {
      return <div className="text-center font-medium">Assessment</div>;
    }

    if (lesson.type === "exam") {
      return <div className="text-center font-medium">Exam</div>;
    }

    return (
      <div
        className="text-center font-medium"
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "8rem",
          margin: "0 auto",
        }}
      >
        {lesson.type === "fun_activity" ? "Fun Activity" : lesson.type}
      </div>
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
      tableStyle={{ minWidth: "60rem" }}
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

      {/* Lessons */}
      {lessons.map((lesson) => (
        <Column
          key={lesson.id}
          header={lessonHeaderTemplate(lesson)}
          body={(student: Student) => lessonTemplate(lesson, student)}
          style={{ minWidth: "10rem", textAlign: "center" }}
          headerTooltip={
            lesson.type === "assessment"
              ? "Assessment"
              : lesson.type === "exam"
              ? "Exam"
              : `${lesson.name} (${lesson.type})`
          }
          headerStyle={{
            background: "var(--surface-card)",
            color: "var(--text-color)",
            textAlign: "center",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "8rem",
          }}
        />
      ))}
    </DataTable>
  );
};
