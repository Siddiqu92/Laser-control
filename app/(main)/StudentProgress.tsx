"use client";
import { Dialog } from "primereact/dialog";

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
  complexity_level: number;
  sort: number;
  activities: Activity[];
}

interface StudentProgressProps {
  visible: boolean;
  onHide: () => void;
  loading: boolean;
  topics: Topic[];
  studentName?: string;
}

export default function StudentProgress({ visible, onHide, loading, topics, studentName = "Student" }: StudentProgressProps) {
 
  
  return (
    <Dialog
      header={`${studentName}'s Progress`}
      visible={visible}
      style={{ width: "80vw", maxWidth: "1200px" }}
      onHide={onHide}
      modal
    >
      {loading ? (
        <div className="p-4 text-center">Loading progress data...</div>
      ) : topics.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No progress data found for this student
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left border">Topic</th>
                <th className="p-2 text-left border">Activity</th>
                <th className="p-2 text-left border">Type</th>
                <th className="p-2 text-center border">Progress</th>
                <th className="p-2 text-center border">Last Read</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((topic) => 
                topic.activities && topic.activities.length > 0 ? (
                  topic.activities.map((act) => (
                    <tr key={act.id}>
                      <td className="p-2 border">{topic.topic_title}</td>
                      <td className="p-2 border">{act.title}</td>
                      <td className="p-2 border">{act.activity_type}</td>
                      <td className="p-2 text-center border">{act.progress}</td>
                      <td className="p-2 text-center border">{act.last_read || "—"}</td>
                    </tr>
                  ))
                ) : (
                  <tr key={topic.topic_id}>
                    <td className="p-2 border">{topic.topic_title}</td>
                    <td className="p-2 border" colSpan={4}>No activities found</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </Dialog>
  );
}