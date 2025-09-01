"use client";
import React, { useMemo, useState } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

interface Activity {
  id: number;
  title: string;
  activity_type: string;
  progress: string;
  last_read: string | null;
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
  itemName = "",
  itemType = "",
  obtainedPercent = null,
}: StudentProgressProps) {
const rows = useMemo(() => {
  if (!topics || !Array.isArray(topics)) return [];
  return topics
    .map((topic) => {
      if (!topic.activities || !Array.isArray(topic.activities)) return [];
      return topic.activities.map((activity) => ({
        topicTitle: topic.topic_title,
        ...activity,
      }));
    })
    .flat(); // flat() se nested array ko single array bana diya
}, [topics]);


  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const renderStatus = (rowData: Activity) => {
    const type = (rowData.activity_type || "").toUpperCase();
    const n = parseInt((rowData.progress || "").replace("%", ""), 10);

    if (type === "ASSESSMENT" || type === "EXAM") {
      const percent = isNaN(n) || n < 0 ? 0 : n;
      return (
        <div className="flex flex-col items-center justify-center">
          <span className="font-semibold text-orange-600">{percent}%</span>
          <span className="text-gray-600 text-xs">Attempted</span>
        </div>
      );
    }

    return (
      <div className="flex justify-center items-center gap-2">
        {isNaN(n) || n <= 0 ? (
          <>
            <i className="pi pi-times-circle text-red-500 text-lg"></i>
            <span className="text-red-500 text-sm">Not Started</span>
          </>
        ) : n === 100 ? (
          <>
            <i className="pi pi-check-circle text-green-500 text-lg"></i>
            <span className="text-green-500 text-sm">Completed</span>
          </>
        ) : (
          <>
            <i className="pi pi-spin pi-spinner text-yellow-500 text-lg"></i>
            <span className="text-yellow-600 text-sm">{n}% In Progress</span>
          </>
        )}
      </div>
    );
  };

  return (
    <Dialog
      header={`${studentName}'s Progress`}
      visible={visible}
      style={{ width: "80vw", maxWidth: "1000px" }}
      onHide={() => {
        setSelectedActivity(null);
        onHide();
      }}
      modal
      className="student-progress-dialog"
    >
      {loading ? (
        <div className="p-4 text-center text-secondary">Loading progress data...</div>
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
   
        <DataTable
          value={rows}
          rowGroupMode="subheader"
          groupRowsBy="topicTitle"
          sortMode="single"
          sortField="topicTitle"
          sortOrder={1}
          tableStyle={{ minWidth: "50rem" }}
          rowGroupHeaderTemplate={(data) => (
            <span className="font-bold">{data.topicTitle}</span>
          )}
          selectionMode="single"
          onRowClick={(e) => setSelectedActivity(e.data as Activity)}
        >
          <Column field="title" header="Activity" style={{ minWidth: "250px" }} />
          <Column
            header="Status"
            body={renderStatus}
            style={{ width: "150px", textAlign: "center" }}
          />
          <Column
            header="Last Activity / Attempted"
            body={(rowData) => {
              const type = (rowData.activity_type || "").toUpperCase();
              if (type === "ASSESSMENT" || type === "EXAM") {
                const n = parseInt((rowData.progress || "").replace("%", ""), 10);
                const percent = isNaN(n) || n < 0 ? 0 : n;
                return <span>{percent}%</span>;
              }
              return formatDate(rowData.last_read);
            }}
            style={{ minWidth: "250px" }}
          />
        </DataTable>
      )}
    </Dialog>
  );
}
