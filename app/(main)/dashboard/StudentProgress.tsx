"use client";
import React, { useMemo, useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import AssessmentResult from "./AssessmentResult";
import { ApiService } from "../../../service/api";

interface Activity {
  id: number;
  title: string;
  activity_type: string;
  progress: string;
  last_read: string | null;
  isAssessment?: boolean;
  topicTitle?: string;
  summary?: {
    score?: number;
  };
}

interface Topic {
  topic_id: number;
  topic_title: string;
  activities: Activity[];
}

interface StudentProgressProps {
  visible: boolean;
  onHide: () => void;
  loading: boolean;
  topics: Topic[];
  studentName?: string;
  studentId?: string;
  courseId?: string;
  itemName?: string;
  itemType?: string;
  obtainedPercent?: number | null;
}

export default function StudentProgress({
  visible,
  onHide,
  loading,
  topics,
  studentName = "Student",
  studentId = "",
  courseId = "",
  itemName = "",
  itemType = "",
  obtainedPercent = null,
}: StudentProgressProps) {
  const processedTopics = useMemo(() => {
    if (!topics || !Array.isArray(topics)) return [];

    return topics.map((topic) => {
      if (!topic.activities || !Array.isArray(topic.activities)) return topic;

      return {
        ...topic,
        activities: topic.activities.map((activity) => {
          const isAssessment =
            activity.activity_type?.toUpperCase() === "ASSESSMENT" ||
            activity.activity_type?.toUpperCase() === "EXAM" ||
            activity.activity_type?.toUpperCase().includes("PRACTICE") ||
            activity.title?.toLowerCase().includes("assessment") ||
            activity.title?.toLowerCase().includes("exam") ||
            activity.title?.toLowerCase().includes("practice");

    
          let cleanTitle = activity.title;
          if (cleanTitle.includes("Assessment: Assessment:")) {
            cleanTitle = cleanTitle.replace("Assessment: Assessment:", "Assessment:");
          }
        
          cleanTitle = cleanTitle.replace(/(Assessment: )+/g, "Assessment: ");

          return {
            ...activity,
            title: cleanTitle,
            isAssessment,
          };
        }),
      };
    });
  }, [topics]);

  const [scoreByActivityId, setScoreByActivityId] = useState<Record<number, number | null>>({});

  const rows = useMemo(() => {
    if (!processedTopics || !Array.isArray(processedTopics)) return [];
    return processedTopics
      .map((topic) => {
        if (!topic.activities || !Array.isArray(topic.activities)) return [];
        return topic.activities.map((activity) => {
          const mergedScore = scoreByActivityId[activity.id] ?? activity.summary?.score;
          return {
            topicTitle: topic.topic_title,
            ...activity,
            ...(mergedScore !== undefined
              ? { summary: { score: mergedScore as number } }
              : {}),
          };
        });
      })
      .flat();
  }, [processedTopics, scoreByActivityId]);

  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [assessmentDialogVisible, setAssessmentDialogVisible] = useState(false);
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
 
  const [fetchedPracticeIds, setFetchedPracticeIds] = useState<Set<number>>(new Set());

  
  useEffect(() => {
    const fetchPracticeAssessments = async () => {
      if (!studentId || !rows.length || !visible) return;

      const practiceActivities = rows.filter(row =>
        row.activity_type?.toUpperCase().includes("PRACTICE") &&
        parseInt((row.progress || "").replace("%", ""), 10) === 100
      );

      for (const activity of practiceActivities) {
        if (!fetchedPracticeIds.has(activity.id)) {
          try {
            const response = await ApiService.getQuizDetail(
              studentId,
              activity.id.toString(),
              "practice"
            );

            const score = response?.summary?.score ?? null;
            setScoreByActivityId(prev => ({
              ...prev,
              [activity.id]: score
            }));

           
            setFetchedPracticeIds(prev => new Set(prev).add(activity.id));
          } catch (err) {
            console.error(`Failed to fetch assessment data for activity ${activity.id}:`, err);
          }
        }
      }
    };

    if (visible) {
      fetchPracticeAssessments();
    }
  }, [studentId, rows, visible, fetchedPracticeIds]);

const formatDate = (dateString: string | null): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);

    const day = date.getDate().toString().padStart(2, "0"); 
    const month = date.toLocaleString("en-US", { month: "short" }); 
    const year = date.getFullYear(); 

    const time = date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }); 

   
    return `${day}, ${month} , ${year}, ${time}`;
  } catch {
    return dateString || "";
  }
};


  const handleActivityClick = async (activity: Activity & { topicTitle?: string }) => {
    if (!studentId) {
      setApiError("Missing student ID. Cannot fetch quiz data.");
      return;
    }

    if (activity.isAssessment) {
      setSelectedActivity(activity);
      setAssessmentLoading(true);
      setAssessmentDialogVisible(true);
      setApiError(null);

      try {
        let type: "practice" | "assessment" | "exam" = "assessment";
        if (activity.activity_type?.toUpperCase().includes("PRACTICE")) {
          type = "practice";
        } else if (activity.activity_type?.toUpperCase().includes("EXAM")) {
          type = "exam";
        }

        const response = await ApiService.getQuizDetail(
          studentId,
          activity.id.toString(),
          type
        );

        const score = response?.summary?.score ?? null;

        const updatedActivity = { ...activity, summary: { score: score ?? undefined } };
        setSelectedActivity(updatedActivity);
        setAssessmentData(response);
        setScoreByActivityId((prev) => ({ ...prev, [activity.id]: score }));
      } catch (err: any) {
        console.error("Error fetching quiz detail:", err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch quiz detail";

        setApiError(
          `Error: ${errorMessage}. Student: ${studentId}, Activity: ${activity.id}`
        );
        setAssessmentData(null);
      } finally {
        setAssessmentLoading(false);
      }
    }
  };

 const renderStatus = (rowData: any) => {
  const n = parseInt((rowData.progress || "").replace("%", ""), 10);
  const percent = isNaN(n) || n < 0 ? 0 : n;
  const isPractice = rowData.activity_type?.toUpperCase().includes("PRACTICE");

 
  if (isPractice) {
    const rawScore = rowData?.summary?.score;
    const hasRawScore = rawScore !== undefined && rawScore !== null;
    const score = hasRawScore ? Number(rawScore) : percent; 
    const hasAnyInteraction = !!rowData.last_read || (!!rowData.progress && Number((rowData.progress || '').replace('%','')) > 0);

    if (score === 0) {
      // For practice: 0% if attempted/skipped/incorrect but no correct; Not Started if truly no interaction
      if (!hasAnyInteraction) {
        return (
          <div className="flex items-center gap-2 w-[140px]">
            <i className="pi pi-minus-circle text-gray-400 text-lg"></i>
            <span className="text-gray-500 font-medium">Not Started</span>
          </div>
        );
      }
      return (
        <div className="flex items-center gap-2 w-[140px]">
          <span className="text-green-600 font-medium">0%</span>
        </div>
      );
    }


 
    if (score === 100) {
      return (
        <div className="flex items-center gap-2 w-[140px]">
          <i className="pi pi-check-circle text-green-500 text-lg"></i>
          <span className="text-green-600 font-medium">Completed</span>
        </div>
      );
    }

   
    return (
      <div className="flex items-center gap-2 w-[140px]">
        <span className="text-green-600 font-medium">{score}%</span>
      </div>
    );
  }

 
  if (percent <= 0) {
    return (
      <div className="flex items-center gap-2 w-[140px]">
        <i className="pi pi-minus-circle text-gray-400 text-lg"></i>
        <span className="text-gray-500 font-medium">Not Started</span>
      </div>
    );
  }

  if (percent === 100) {
    return (
      <div className="flex items-center gap-2 w-[140px]">
        <i className="pi pi-check-circle text-green-500 text-lg"></i>
        <span className="text-green-600 font-medium">Completed</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 w-[140px]">
      <i className="pi pi-spinner text-blue-500 text-lg"></i>
      <span className="text-blue-600 font-medium">{percent}%</span>
    </div>
  );
};


const renderActivityTitle = (rowData: Activity) => {
  let cleanTitle = rowData.title;
  cleanTitle = cleanTitle.replace(/(Assessment: )+/g, "Assessment: ");


  const baseClass = "pl-6 text-color"; 

  if (rowData.isAssessment) {
    return (
      <span
        className={`${baseClass} font-semibold cursor-pointer hover:underline text-primary`}
        onClick={() => handleActivityClick(rowData)}
      >
        {cleanTitle}
      </span>
    );
  }

  return <span className={baseClass}>{cleanTitle}</span>;
};




  return (
    <>
      <Dialog
        header={`${studentName}'s Progress`}
        visible={visible}
        style={{ width: "80vw", maxWidth: "1000px" }}
        onHide={() => {
          setSelectedActivity(null);
          setApiError(null);
          setAssessmentDialogVisible(false);
          onHide();
        }}
        modal
        className="student-progress-dialog"
      >
        {loading ? (
          <div className="p-4 text-center text-secondary">
            Loading progress data...
          </div>
        ) : itemType?.toUpperCase() === "ASSESSMENT" ? (
          <div className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">{itemName}</h3>
            <p className="text-gray-600 mb-4">
              Assessment Result for <b>{studentName}</b>
            </p>
            <div className="inline-flex flex-col items-center justify-center border rounded-lg p-6 shadow-md">
              <span className="text-4xl font-bold text-orange-600">
                {obtainedPercent !== null ? `${obtainedPercent}%` : "N/A"}
              </span>
              <span className="text-gray-500 mt-2">Obtained</span>
            </div>
          </div>
        ) : rows.length === 0 ? (
          <div className="p-4 text-center text-secondary">
            No progress data found for this student
          </div>
        ) : (
          <>
            {apiError && (
              <div className="p-3 mb-4 bg-red-100 text-red-700 rounded border border-red-200">
                <i className="pi pi-exclamation-triangle mr-2"></i>
                {apiError}
              </div>
            )}
            <DataTable
              value={rows}
              rowGroupMode="subheader"
              groupRowsBy="topicTitle"
              sortMode="single"
              sortField="topicTitle"
              sortOrder={1}
              tableStyle={{ minWidth: "50rem" }}
              rowGroupHeaderTemplate={(data) => (
                <span className="font-bold text-blue-800 bg-blue-50 p-2 rounded">
                  {data.topicTitle}
                </span>
              )}
            >
              <Column
                field="title"
                header="Topic"
                body={renderActivityTitle}
                style={{ minWidth: "250px" }}
              />
              <Column
                header="Status"
                body={renderStatus}
                style={{ width: "150px", textAlign: "center" }}
              />
              <Column
                header="Last Activity / Attempted"
                body={(rowData) => {
                  if (!rowData.isAssessment) {
                    return formatDate(rowData.last_read);
                  }
                  return rowData.last_read ? formatDate(rowData.last_read) : "";
                }}
                style={{ minWidth: "200px" }}
              />
            </DataTable>
          </>
        )} 
      </Dialog>

      <AssessmentResult
        visible={assessmentDialogVisible}
        onHide={() => setAssessmentDialogVisible(false)}
        loading={assessmentLoading}
        assessmentData={assessmentData}
        studentName={studentName}
        activityTitle={selectedActivity?.title || ""}
        lastAttempted={selectedActivity?.last_read}
        isPractice={selectedActivity?.activity_type?.toUpperCase().includes("PRACTICE") || false}
      />
    </>
  );
}