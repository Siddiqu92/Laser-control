"use client";
import React from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";

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
  // Flatten data: topicTitle + activities for DataTable
  const rows = topics.flatMap((topic) =>
    topic.activities.map((activity) => ({
      topicTitle: topic.topic_title,
      ...activity,
    }))
  );

  // Format date (YYYY-MM-DD)
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    } catch {
      return dateString;
    }
  };

  // Body Template for Read Status
  const readStatusTemplate = (rowData: Activity) => {
    if (rowData.last_read) {
      return (
        <Tag
          value={`READ ${formatDate(rowData.last_read)}`}
          severity="success"
        />
      );
    }
    return <Tag value="NOT READ" severity="danger" />;
  };

  return (
    <Dialog
      header={`${studentName}'s Progress`}
      visible={visible}
      style={{ width: "80vw", maxWidth: "1000px" }}
      onHide={onHide}
      modal
      className="student-progress-dialog"
      headerStyle={{
        background: "#f8f9fa",
        borderBottom: "1px solid #dee2e6",
        padding: "1rem 1.5rem",
        fontWeight: 600,
        color: "#495057",
      }}
    >
      {loading ? (
        <div className="p-4 text-center text-gray-500">
          Loading progress data...
        </div>
      ) : rows.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No progress data found for this student
        </div>
      ) : (
        <div className="card">
          <DataTable
            value={rows}
            rowGroupMode="rowspan"
            groupRowsBy="topicTitle"
            sortMode="single"
            sortField="topicTitle"
            sortOrder={1}
            tableStyle={{ minWidth: "50rem" }}
          >
            <Column
              header="#"
              headerStyle={{ width: "3rem" }}
              body={(_, options) => options.rowIndex + 1}
            />
            <Column field="topicTitle" header="Topic" style={{ minWidth: "200px" }} />
            <Column field="title" header="Activity" style={{ minWidth: "250px" }} />
            <Column
              header="Read Status"
              body={readStatusTemplate}
              style={{ minWidth: "150px" }}
            />
          </DataTable>
        </div>
      )}
    </Dialog>
  );
}
