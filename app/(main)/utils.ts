import { Student } from "./types";
import { StatusValue } from "./types";

export const getProgressIcon = (progress: number) => {
  if (progress === 100) return "✅";
  if (progress === -1) return "—";
  return `${parseFloat(progress.toString()).toFixed(1)}%`;
};

export const getFilteredStudents = (
  students: Student[],
  selectedStatuses: StatusValue[]
): Student[] => {
  if (selectedStatuses.length === 0) return students;

  return students.filter((student) => {
    const hasCompleted = student.lessons_progress.some((lp) => lp.progress === 100);
    const hasInProgress = student.lessons_progress.some((lp) => lp.progress > 0 && lp.progress < 100);
    const hasNotStarted = student.lessons_progress.some((lp) => lp.progress === -1);

    if (selectedStatuses.includes("completed") && hasCompleted) return true;
    if (selectedStatuses.includes("in-progress") && hasInProgress) return true;
    if (selectedStatuses.includes("not-started") && hasNotStarted) return true;

    return false;
  });
};
