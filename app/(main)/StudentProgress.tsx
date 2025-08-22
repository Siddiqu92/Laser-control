"use client";
import { Dialog } from "primereact/dialog";
import React from "react";

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
  // Format date to match the image format (YYYY-MM-DDTHH:MM:SS.ZZZZ)
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    
    try {
      const date = new Date(dateString);
      return date.toISOString().replace('Z', '').slice(0, 23);
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog
      header={`${studentName}'s Progress`}
      visible={visible}
      style={{ width: "90vw", maxWidth: "1400px" }}
      onHide={onHide}
      modal
      className="student-progress-dialog"
    >
      {loading ? (
        <div className="p-4 text-center">Loading progress data...</div>
      ) : topics.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No progress data found for this student
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 text-left text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 border border-gray-300 font-bold text-center" style={{ width: '60px' }}>#</th>
                <th className="p-3 border border-gray-300 font-bold" style={{ width: '40%' }}>Topic</th>
                <th className="p-3 border border-gray-300 font-bold" style={{ width: '30%' }}>Activity</th>
                <th className="p-3 border border-gray-300 font-bold text-center" style={{ width: '30%' }}>Read</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((topic, topicIndex) => (
                <React.Fragment key={topic.topic_id}>
                  {/* Main Topic Row */}
                  <tr className="bg-blue-50 font-semibold">
                    <td className="p-3 border border-gray-300 text-center align-top">{topicIndex + 1}</td>
                    <td className="p-3 border border-gray-300 align-top" colSpan={3}>
                      {topic.topic_title}
                    </td>
                  </tr>

                  {/* Activity Rows */}
                  {topic.activities && topic.activities.length > 0 ? (
                    topic.activities.map((activity, activityIndex) => (
                      <tr key={activity.id} className="hover:bg-gray-50">
                        <td className="p-3 border border-gray-300 text-center align-top"></td>
                        <td className="p-3 border border-gray-300 align-top"></td>
                        <td className="p-3 border border-gray-300 align-top">
                          <div className="flex items-center justify-between">
                            <span>{activity.title}</span>
                            <span className="text-xs text-gray-500 ml-2 capitalize">
                              {activity.type?.toLowerCase() || 'activity'}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 border border-gray-300 text-center align-top text-xs text-gray-600">
                          {activity.last_read ? formatDate(activity.last_read) : "—"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-3 border border-gray-300"></td>
                      <td className="p-3 border border-gray-300"></td>
                      <td className="p-3 border border-gray-300 text-gray-500 italic">
                        No activities found
                      </td>
                      <td className="p-3 border border-gray-300 text-center">—</td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              
              {/* Assessment Section (as shown in image) */}
              <tr className="bg-blue-50 font-semibold">
                <td className="p-3 border border-gray-300 text-center align-top"></td>
                <td className="p-3 border border-gray-300 align-top" colSpan={3}>
                  Assessment
                </td>
              </tr>
              <tr>
                <td className="p-3 border border-gray-300"></td>
                <td className="p-3 border border-gray-300"></td>
                <td className="p-3 border border-gray-300">
                  <div className="flex items-center justify-between">
                    <span>Assessment</span>
                    <span className="text-xs text-gray-500 ml-2">assessment</span>
                  </div>
                </td>
                <td className="p-3 border border-gray-300 text-center">—</td>
              </tr>
              <tr>
                <td className="p-3 border border-gray-300"></td>
                <td className="p-3 border border-gray-300"></td>
                <td className="p-3 border border-gray-300">
                  <div className="flex items-center justify-between">
                    <span>Assessment</span>
                    <span className="text-xs text-gray-500 ml-2">assessment</span>
                  </div>
                </td>
                <td className="p-3 border border-gray-300 text-center">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      
      {/* Add some CSS for better styling */}
      <style jsx>{`
        .student-progress-dialog .p-dialog-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .student-progress-dialog .p-dialog-header-icon {
          color: white;
        }
        table {
          border-collapse: collapse;
        }
        th, td {
          border: 1px solid #d1d5db;
        }
        .bg-blue-50 {
          background-color: #eff6ff;
        }
      `}</style>
    </Dialog>
  );
} 