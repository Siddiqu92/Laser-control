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
      <span className="text-gray-800">
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
        className={`flex justify-center items-center ${
          clickable ? "cursor-pointer hover:text-blue-600" : ""
        }`}
      >
        {progress ? getProgressIcon(progress.progress) : "—"}
      </div>
    );
  };

  const indexTemplate = (_: any, options: any) => {
    return (
      <span className="text-gray-700">
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
      tableStyle={{ minWidth: "65rem" }}
    >
      {/* Index Column - Sticky */}
      <Column
        header="#"
        body={indexTemplate}
        headerStyle={{
          minWidth: "3rem",
          textAlign: "center",
          position: "sticky",
          left: 0,
          backgroundColor: "white", 
          zIndex: 2,
        }}
        bodyStyle={{
          minWidth: "3rem",
          textAlign: "center",
          position: "sticky",
          left: 0,
          backgroundColor: "white", 
          zIndex: 1,
        }}
        frozen
      />

      {/* Student Name - Sticky */}
      <Column
        field="name"
        header="Student"
        body={studentTemplate}
        headerStyle={{
          minWidth: "14rem",
          position: "sticky",
          left: "3rem",
          backgroundColor: "white", 
          zIndex: 2,
        }}
        bodyStyle={{
          minWidth: "14rem",
          position: "sticky",
          left: "3rem",
          backgroundColor: "white", 
          zIndex: 1,
        }}
        frozen
      />

      {/* Lessons */}
      {lessons.map((lesson) => (
        <Column
          key={lesson.id}
          header={
            <div className="text-center">
              {lesson.name.length > 20
                ? `${lesson.name.substring(0, 10)}...`
                : lesson.name}
            </div>
          }
          body={(student: Student) => lessonTemplate(lesson, student)}
          style={{ minWidth: "12rem", textAlign: "center" }}
          headerTooltip={lesson.name}
          headerStyle={{
            backgroundColor: "white", 
          }}
        />
      ))}
    </DataTable>
  );
};
