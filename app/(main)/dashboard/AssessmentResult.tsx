"use client";
import React from "react";
import { Dialog } from "primereact/dialog";

interface AssessmentResultProps {
  visible: boolean;
  onHide: () => void;
  loading: boolean;
  assessmentData: any;
  studentName: string;
  topicTitle?: string;
}

// ✅ Helper to format question types
const formatType = (rawType: string) => {
  if (!rawType) return "Unknown";
  const type = rawType.toLowerCase();
  if (type.includes("mcq") || type.includes("multiple")) return "MCQs";
  if (type.includes("true")) return "True/False";
  if (type.includes("blank")) return "Fill in the Blanks";
  return rawType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};
const AssessmentResult: React.FC<AssessmentResultProps> = ({
  visible,
  onHide,
  loading,
  assessmentData,
  studentName,
  topicTitle,
}) => {
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-content-center align-items-center p-6">
          <i className="pi pi-spinner pi-spin text-3xl text-primary mr-3"></i>
          <span className="text-lg">Loading assessment results...</span>
        </div>
      );
    }

    if (!assessmentData) {
      return (
        <div className="text-center p-6">
          <i className="pi pi-info-circle text-6xl text-blue-400 mb-4"></i>
          <h4 className="text-800 mb-2">No Assessment Data</h4>
          <p className="text-600">
            No assessment results available for this student.
          </p>
        </div>
      );
    }

    const { summary, questions, assessment } = assessmentData;

    // ✅ Agar API se assessment name aata hai to use karenge, warna fallback
    const displayTitle = assessment?.name || topicTitle || "Assessment";

    return (
      <div className="p-3">
        {/* ✅ Student Name */}
        <div className="text-left text-lg font-medium mb-4">
          Student Name: <span className="font-bold">{studentName}</span>
        </div>

        {/* ✅ Summary Section */}
        <div className="border-round surface-card shadow-2 p-4 mb-5 flex flex-column md:flex-row justify-content-between">
          <div>
            {/* 👇 API ka assessment name show hoga */}
            <h3 className="text-xl font-bold mb-3">{displayTitle}</h3>
            <p className="mb-2 text-lg">
              Total Questions:{" "}
              <span className="font-semibold">
                {summary?.total_questions || 0}
              </span>
            </p>
            <p className="mb-0 text-lg">
              Total Max Points:{" "}
              <span className="font-semibold">
                {summary?.total_max_points || summary?.total_marks || 0}
              </span>
            </p>
          </div>

          <div className="mt-4 md:mt-0 text-right">
            <p className="mb-2 text-lg text-green-600">
              Correct Answers:{" "}
              <span className="font-bold">
                {summary?.correct_answers || 0}
              </span>
            </p>
            <p className="mb-2 text-lg text-red-500">
              Incorrect Answers:{" "}
              <span className="font-bold">
                {summary?.incorrect_answers || 0}
              </span>
            </p>
            <p className="mb-0 text-lg">
              Score:{" "}
              <span className="font-bold text-primary">
                {summary?.score_percent || 0}%
              </span>
            </p>
          </div>
        </div>


        {/* ✅ Questions Table */}
        <div className="p-4 border-round surface-card shadow-2">
          <h3 className="text-xl font-semibold mb-4 flex align-items-center">
            <i className="pi pi-list mr-2 text-primary"></i>
            Question Details
          </h3>

          <div className="overflow-auto">
            <table
              className="w-full border-collapse"
              style={{ minWidth: "900px" }}
            >
              <thead>
                <tr className="bg-surface-100 text-left">
                  <th className="p-3 border">Q#</th>
                  <th className="p-3 border">Question</th>
                  <th className="p-3 border">Correct/Incorrect</th>
                  <th className="p-3 border">Time Spent</th>
                  <th className="p-3 border">Type</th>
                </tr>
              </thead>
              <tbody>
                {questions?.map((q: any, i: number) => (
                  <tr key={q.question_id || i} className="hover:surface-hover">
                    <td className="p-3 border">{i + 1}</td>
                    <td className="p-3 border">{q.statement}</td>
                    <td className="p-3 border">
                      {q.is_correct ? (
                        <span className="text-green-600 font-semibold flex align-items-center">
                          <i className="pi pi-check-circle mr-2"></i>
                          Correct
                        </span>
                      ) : (
                        <span className="text-red-500 font-semibold flex align-items-center">
                          <i className="pi pi-times-circle mr-2"></i>
                          Incorrect
                        </span>
                      )}
                    </td>
                    <td className="p-3 border">
                      {q.time_spent ? `${q.time_spent}s` : "N/A"}
                    </td>
                    <td className="p-3 border">
                      {formatType(q.question_type)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(!questions || questions.length === 0) && (
            <div className="text-center p-5 text-600">
              <i className="pi pi-inbox text-4xl mb-3"></i>
              <p>No questions data available</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog
      header="Assessment Result"
      visible={visible}
      style={{ width: "95vw", maxWidth: "1200px" }}
      onHide={onHide}
      draggable={false}
      breakpoints={{ "960px": "75vw", "641px": "90vw" }}
    >
      {renderContent()}
    </Dialog>
  );
};

export default AssessmentResult;
