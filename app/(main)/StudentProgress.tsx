"use client";
import React from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

interface Activity {
  id: number;
  title: string;
  type: string;
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
}

export default function StudentProgress({
  visible,
  onHide,
  loading,
  topics,
  studentName = "Student",
}: StudentProgressProps) {
  // Flatten: topic + activities
  const rows = topics.flatMap((topic) =>
    topic.activities.map((activity) => ({
      topicTitle: topic.topic_title,
      ...activity,
    }))
  );

  // Format date (YYYY-MM-DD HH:mm)
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "NOT READ";
    try {
      const date = new Date(dateString);
      return `${date.toISOString().split("T")[0]} ${date
        .toTimeString()
        .split(" ")[0]
        .slice(0, 5)}`;
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog
      header={`${studentName}'s Progress`}
      visible={visible}
      style={{ width: "80vw", maxWidth: "1000px" }}
      onHide={onHide}
      modal
      className="student-progress-dialog"
    >
      {loading ? (
        <div className="p-4 text-center text-secondary">
          Loading progress data...
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
        >
          <Column field="title" header="Activity" style={{ minWidth: "300px" }} />
          <Column
            header="Read Status"
            body={(rowData) => formatDate(rowData.last_read)}
            style={{ minWidth: "200px" }}
          />
        </DataTable>
      )}
    </Dialog>
  );
}
