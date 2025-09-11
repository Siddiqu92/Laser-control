import { useState } from "react";
import { ApiService } from "../../../service/api";
import { ProgressMeta } from "../dashboard/types";

export function useStudentProgress(selectedCourseId: string | null) {
  const [progressVisible, setProgressVisible] = useState(false);
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressData, setProgressData] = useState<any>(null);
  const [progressMeta, setProgressMeta] = useState<ProgressMeta | null>(null);
  const [isAssessment, setIsAssessment] = useState(false);

  const fetchStudentProgress = async (
    studentId: string,
    lessonId: number,
    lessonType: string
  ) => {
    try {
      setProgressLoading(true);
      setProgressVisible(true);

      const normalizedType = lessonType.toLowerCase();
      setIsAssessment(
        normalizedType === "assessment" ||
          normalizedType === "exam" ||
          normalizedType.includes("final exam")
      );

      let response: any;

      if (normalizedType === "assessment") {
        response = await ApiService.getQuizDetail(studentId, lessonId, "assessment");
      } else if (
        normalizedType === "exam" ||
        normalizedType.includes("final exam")
      ) {
        response = await ApiService.getQuizDetail(studentId, lessonId, "exam");
      } else {
        response = await ApiService.getStudentProgress(studentId, lessonId);
      }

      const topicsData = response?.data || response || [];
      setProgressData(topicsData);
    } catch (err) {
      console.error("Error fetching student progress:", err);
      setProgressData(null);
    } finally {
      setProgressLoading(false);
    }
  };

  return {
    progressVisible,
    setProgressVisible,
    progressLoading,
    progressData,
    progressMeta,
    setProgressMeta,
    isAssessment,
    fetchStudentProgress,
  };
}
