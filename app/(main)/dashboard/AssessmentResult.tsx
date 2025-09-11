"use client";
import React from "react";
import { Dialog } from "primereact/dialog";

interface AssessmentResultProps {
  visible: boolean;
  onHide: () => void;
  loading: boolean;
  assessmentData: any; // response from API
  studentName: string;
  topicTitle?: string;
  activityType?: string;
  activityTitle?: string;
}

const formatType = (rawType: string) => {
  if (!rawType) return "Unknown";
  const type = rawType.toLowerCase();
  if (type.includes("mcq") || type.includes("multiple")) return "MCQs";
  if (type.includes("true")) return "True/False";
  if (type.includes("blank")) return "Fill in the Blanks";
  if (type.includes("short")) return "Short Answer";
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

    if (!assessmentData || !assessmentData.summary) {
      return (
        <div className="text-center p-6">
          <i className="pi pi-info-circle text-6xl text-blue-400 mb-4"></i>
          <h4 className="text-800 mb-2">No Data</h4>
          <p className="text-600">
            No assessment/exam results available for this student.
          </p>
        </div>
      );
    }

    // ✅ Extract API data
    const questions: any[] = Array.isArray(assessmentData.questions)
      ? assessmentData.questions
      : [];
    const summary = assessmentData.summary;
    const displayTitle = topicTitle || "Assessment / Exam";

    return (
      <div className="p-3">
        {/* Student Name */}
        <div className="text-left text-lg font-medium mb-4">
          Student Name: <span className="font-bold">{studentName}</span>
        </div>

        {/* Summary */}
        <div className="border-round surface-card shadow-2 p-4 mb-5 flex flex-column md:flex-row justify-content-between">
          <div>
            <h3 className="text-xl font-bold mb-3">{displayTitle}</h3>

            <p className="mb-2 text-lg">
              Total Questions:{" "}
              <span className="font-semibold">{summary.total_questions}</span>
            </p>

            <p className="mb-2 text-lg">
              Obtained Marks:{" "}
              <span className="font-semibold">{summary.correct_answers}</span> /{" "}
              <span className="font-semibold">{summary.total_questions}</span>
            </p>

            <p className="mb-0 text-lg">
              Weight:{" "}
              <span className="font-semibold">{summary.weight || 0}%</span>
            </p>
          </div>

          <div className="mt-4 md:mt-0 text-right">
            <p className="mb-2 text-lg">
              Attempted:{" "}
              <span className="font-bold">
                {summary.attempted ? summary.total_questions : 0}
              </span>
            </p>

            <p className="mb-2 text-lg text-green-600">
              Correct Answers:{" "}
              <span className="font-bold">{summary.correct_answers}</span>
            </p>

            <p className="mb-2 text-lg text-red-500">
              Incorrect Answers:{" "}
              <span className="font-bold">{summary.incorrect_answers}</span>
            </p>

            <p className="mb-2 text-lg text-orange-500">
              Skipped:{" "}
              <span className="font-bold">
                {summary.total_questions -
                  (summary.correct_answers + summary.incorrect_answers)}
              </span>
            </p>

            <p className="mb-0 text-lg">
              Score:{" "}
              <span className="font-bold text-primary">{summary.score}%</span>
            </p>
          </div>
        </div>

        {/* Questions Table */}
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
                  <th className="p-3 border">#</th>
                  <th className="p-3 border">Question</th>
                  <th className="p-3 border">Status</th>
                  <th className="p-3 border">Time Spent</th>
                  <th className="p-3 border">Type</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q: any, i: number) => {
                  const attempted = q.answer !== "" && q.answer !== null;
                  const isCorrect = q.is_correct === true;
                  const isIncorrect = q.is_correct === false && attempted;
                  const notAttempted = !attempted;
                  const notStarted = summary.attempted === false; // test never started

                  let statusEl: React.ReactNode;
                  if (notStarted) {
                    statusEl = (
                      <span className="text-gray-400 font-semibold flex align-items-center">
                        <i className="pi pi-ban mr-2"></i>
                        Not Started
                      </span>
                    );
                  } else if (notAttempted) {
                    statusEl = (
                      <span className="text-orange-500 font-semibold flex align-items-center">
                        <i className="pi pi-minus-circle mr-2"></i>
                        Skipped
                      </span>
                    );
                  } else if (isCorrect) {
                    statusEl = (
                      <span className="text-green-600 font-semibold flex align-items-center">
                        <i className="pi pi-check-circle mr-2"></i>
                        Correct
                      </span>
                    );
                  } else if (isIncorrect) {
                    statusEl = (
                      <span className="text-red-500 font-semibold flex align-items-center">
                        <i className="pi pi-times-circle mr-2"></i>
                        Incorrect
                      </span>
                    );
                  }

                  return (
                    <tr key={q.question_id || i} className="hover:surface-hover">
                      <td className="p-3 border">{i + 1}</td>
                      <td className="p-3 border">{q.question}</td>
                      <td className="p-3 border">{statusEl}</td>
                      <td className="p-3 border">
                        {q.time_spent ? `${q.time_spent}s` : "N/A"}
                      </td>
                      <td className="p-3 border">{formatType(q.questionType)}</td>
                    </tr>
                  );
                })}
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
      header="Assessment / Exam Result"
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
