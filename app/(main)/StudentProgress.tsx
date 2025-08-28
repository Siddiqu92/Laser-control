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

  // extra meta
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
  const rows = useMemo(
    () =>
      (topics || []).flatMap((topic) =>
        (topic.activities || []).map((activity) => ({
          topicTitle: topic.topic_title,
          ...activity,
        }))
      ),
    [topics]
  );

  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const pill = (text: string) => (
    <span
      className="inline-block text-xs font-semibold px-2 py-1 rounded text-center"
      style={{
        background: "rgb(255, 251, 235)",
        color: "rgb(217, 119, 6)",
        border: "1px solid rgba(217, 119, 6, 0.125)",
        minWidth: "2.5rem",
      }}
    >
      {text}
    </span>
  );

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

  const onlyPercentOrBlank = (percentText?: string) => {
    if (!percentText) return "";
    const n = parseInt(percentText.replace("%", ""), 10);
    if (isNaN(n) || n <= 0) return "";
    return `${n}%`;
  };

  const renderStatus = (rowData: Activity) => {
    const type = (rowData.activity_type || "").toUpperCase();

    if (type === "ASSESSMENT" || type === "EXAM") {
      const v = onlyPercentOrBlank(rowData.progress);
      return <div className="flex justify-center items-center">{v ? pill(v) : <span></span>}</div>;
    }

    const n = parseInt((rowData.progress || "").replace("%", ""), 10);
    return (
      <div className="flex justify-center items-center">
        {isNaN(n) || n <= 0 ? (
          <i className="pi pi-times-circle text-red-500 text-lg"></i>
        ) : n === 100 ? (
          <i className="pi pi-check-circle text-green-500 text-lg"></i>
        ) : (
          pill(`${n}%`)
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
            header="Attempted"
            body={(rowData) => formatDate(rowData.last_read)}
            style={{ minWidth: "250px" }}
          />
        </DataTable>
      )}
    </Dialog>
  );
}
