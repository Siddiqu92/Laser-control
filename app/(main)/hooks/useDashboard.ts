import { useState } from "react";
import { ApiService } from "../../../service/api";
import { DashboardData } from "../dashboard/types";

export function useDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loadedCourseName, setLoadedCourseName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [first, setFirst] = useState(0);

  

  const fetchDashboardData = async (courseId: string, courseName: string) => {
    try {
      setLoading(true);
      const data = await ApiService.getStudentDashboard(courseId);
      setDashboardData(data || { lessons: [], students: [] });
      setLoadedCourseName(courseName);
      setFirst(0);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    dashboardData,
    setDashboardData,
    loadedCourseName,
    loading,
    first,
    setFirst,
    fetchDashboardData,
    setLoading,
    setLoadedCourseName,
  };
}
