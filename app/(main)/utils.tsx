import React from "react";
import { Student, StatusValue } from "./types";


export const getProgressIcon = (progress: number) => {
  if (progress === 100) {
    return (
      <span style={{ fontSize: "1.15rem", lineHeight: 1, color: "#16a34a" }}>
        ✅
      </span>
    );
  }
  if (progress === -1) return "—";

  const pct = Number.isFinite(progress) ? Math.round(progress) : 0;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 6,
        fontSize: "0.85rem",
        fontWeight: 700,
        background: "#e7f5eb", 
        color: "#16a34a", 
        lineHeight: 1.2,
        minWidth: 40,
      }}
    >
      {pct}%
    </span>
  );
};

export const getFilteredStudents = (
  students: Student[],
  selectedStatuses: StatusValue[]
): Student[] => {
  if (selectedStatuses.length === 0) return students;

  return students.filter((student) => {
    const hasCompleted = student.lessons_progress.some(
      (lp) => lp.progress === 100
    );
    const hasInProgress = student.lessons_progress.some(
      (lp) => lp.progress > 0 && lp.progress < 100
    );
    const hasNotStarted = student.lessons_progress.some(
      (lp) => lp.progress === -1
    );

    if (selectedStatuses.includes("completed") && hasCompleted) return true;
    if (selectedStatuses.includes("in-progress") && hasInProgress) return true;
    if (selectedStatuses.includes("not-started") && hasNotStarted) return true;

    return false;
  });
};
