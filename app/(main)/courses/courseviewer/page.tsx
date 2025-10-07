"use client";

import { useSearchParams } from "next/navigation";
import CourseViewer from "../courseviewer";

export default function StaticCourseViewerPage() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");

  if (!courseId) return <div>Loading...</div>;

  return (
    <div className="layout-main">
      <CourseViewer courseId={courseId} />
    </div>
  );
}
