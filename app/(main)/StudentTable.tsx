"use client";
import React, { useRef } from "react";
import { Student, Lesson } from "./types";
import { getProgressIcon } from "./utils";

interface StudentTableProps {
  students: Student[];
  lessons: Lesson[];
  first: number;
  onCellClick: (studentId: string, lessonId: number, type: string) => void;
}

export default function StudentTable({
  students,
  lessons,
  first,
  onCellClick,
}: StudentTableProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Mouse wheel -> horizontal scroll
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      scrollContainerRef.current.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  };

  const headerBg = "#f3f4f6";
  const border = "1px solid #e5e7eb";

  return (
    <div
      ref={scrollContainerRef}
      onWheel={handleWheel}
      className="overflow-x-auto border-round"
      style={{
        maxHeight: "70vh",
        border,
        background: "white",
      }}
    >
      <table
        style={{
          borderCollapse: "separate",
          borderSpacing: 0,
          width: "100%",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: headerBg }}>
            <th
              style={{
                padding: "1rem",
                textAlign: "left",
                fontWeight: 700,
                border,
                position: "sticky",
                left: 0,
                zIndex: 20,
                backgroundColor: headerBg,
                minWidth: 60,
              }}
            >
              #
            </th>
            <th
              style={{
                padding: "1rem",
                textAlign: "left",
                fontWeight: 700,
                border,
                position: "sticky",
                left: 60,
                zIndex: 20,
                backgroundColor: headerBg,
                minWidth: 220,
              }}
            >
              Students
            </th>
            {lessons.map((lesson) => (
              <th
                key={lesson.id}
                style={{
                  padding: "1rem",
                  textAlign: "center",
                  fontWeight: 700,
                  border,
                  whiteSpace: "nowrap",
                  minWidth: 150,
                  backgroundColor: headerBg,
                }}
                title={lesson.name}
              >
                {lesson.name.length > 20
                  ? `${lesson.name.substring(0, 20)}...`
                  : lesson.name}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {students.map((student, index) => (
            <tr
              key={student.id}
              className="hover:bg-gray-50"
              style={{ transition: "background-color .2s", background: "white" }}
            >
              <td
                style={{
                  padding: "1rem",
                  border,
                  position: "sticky",
                  left: 0,
                  zIndex: 10,
                  background: "white",
                  fontWeight: 600,
                }}
              >
                {first + index + 1}
              </td>
              <td
                style={{
                  padding: "1rem",
                  border,
                  position: "sticky",
                  left: 60,
                  zIndex: 10,
                  background: "white",
                }}
              >
                <span style={{ fontWeight: 600, color: "#374151" }}>
                  {student.first_name} {student.last_name}
                </span>
              </td>

              {lessons.map((lesson) => {
                const progress = student.lessons_progress.find(
                  (lp) => lp.lesson_id === lesson.id
                );
                const clickable = lesson.type === "learning_object";

                return (
                  <td
                    key={`${student.id}-${lesson.id}`}
                    style={{
                      padding: "0.9rem",
                      textAlign: "center",
                      border,
                      cursor: clickable ? "pointer" : "default",
                      background: "white",
                    }}
                    onClick={() =>
                      clickable
                        ? onCellClick(student.id, lesson.id, lesson.type)
                        : undefined
                    }
                  >
                    {progress ? getProgressIcon(progress.progress) : "—"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
