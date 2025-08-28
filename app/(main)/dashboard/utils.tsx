import { StatusValue, Student } from "./types";






export const getBadge = (value: number) => {
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
  } else if (rounded > 0) {
    bg = "rgb(254, 242, 242)";
    text = "rgb(220, 38, 38)";
    border = "rgba(220, 38, 38, 0.125)";
  } else {
    // For 0% or negative values
    return (
      <div className="flex justify-content-center align-items-center">
        <i className="pi pi-times-circle text-red-500"></i>
      </div>
    );
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
export const getProgressIcon = (progress: number) => {
  if (progress === 100) {
    return (
      <span 
        className="pi pi-check-circle text-green-500" 
        style={{ 
          fontSize: "1.25rem", 
          lineHeight: 1 
        }}
      />
    );
  }
  if (progress === -1) {
    return (
      <span 
        className="pi pi-times-circle text-red-500" 
        style={{ 
          fontSize: "1.25rem", 
          lineHeight: 1 
        }}
      />
    );
  }

  const pct = Number.isFinite(progress) ? Math.round(progress) : 0;
  
  let progressColor = "#16a34a";
  let progressBg = "#e7f5eb";
  
  if (pct < 30) {
    progressColor = "#dc2626"; 
    progressBg = "#fef2f2";
  } else if (pct < 70) {
    progressColor = "#d97706"; 
    progressBg = "#fffbeb";
  }

  return (
    <span
      style={{
        display: "inline-block",
        padding: "0.25rem 0.5rem",
        borderRadius: "4px",
        fontSize: "0.75rem",
        fontWeight: 600,
        background: progressBg,
        color: progressColor,
        lineHeight: 1.2,
        minWidth: "2.5rem",
        textAlign: "center",
        border: `1px solid ${progressColor}20`
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