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
  activityType?: string;
  activityTitle?: string;
}

const formatType = (rawType: string) => {
  if (!rawType) return "Unknown";
  const type = rawType.toLowerCase();
  if (type.includes("mcq") || type.includes("multiple")) return "MCQs";
  if (type.includes("true")) return "True/False";
  if (type.includes("blank")) return "Fill in the Blanks";
  return rawType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const parseAttemptMap = (attemptQuestions: any): Record<string, any> => {
  if (!attemptQuestions) return {};
  if (typeof attemptQuestions === "object") return attemptQuestions as Record<string, any>;
  if (typeof attemptQuestions === "string") {
    try {
      const obj = JSON.parse(attemptQuestions);
      return obj && typeof obj === "object" ? obj : {};
    } catch {
      return {};
    }
  }
  return {};
};


const buildComputedSummary = (questions: any[], attemptMap: Record<string, any>) => {
  const totalQuestions = Array.isArray(questions) ? questions.length : 0;

  const attemptedIds = new Set(
    Object.keys(attemptMap).filter((k) => attemptMap[k] != null)
  );

  let correct = 0;
  let totalMarks = 0;
  let obtainedMarks = 0;

  for (const q of questions) {
    const qId = String(q?.question_id ?? q?.id ?? "");
    const max = Number(q?.max_points ?? 1) || 1;
    totalMarks += max;

    const raw = attemptMap[qId];
    if (raw && raw.is_correct) {
      correct += 1;
      obtainedMarks += max;
    }
  }

  const attempted = Array.from(attemptedIds).filter((id) =>
    questions.some((q) => String(q?.question_id ?? q?.id ?? "") === id)
  ).length;

  const incorrect = Math.max(attempted - correct, 0);
  const skipped = Math.max(totalQuestions - attempted, 0);
  const scorePercent =
    totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) : 0;

  return {
    total_questions: totalQuestions,
    attempted_questions: attempted,
    correct_answers: correct,
    incorrect_answers: incorrect,
    skipped_questions: skipped,
    obtained_marks: obtainedMarks,
    total_marks: totalMarks,
    score_percent: scorePercent,
  };
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

    const { assessment, questions: apiQuestions, attempt } = assessmentData;

    // ✅ Parse raw attempts (truth source)
    const attemptMap = parseAttemptMap(attempt?.questions);

    // ✅ Use API questions list for structure; merge status from attemptMap
    const questions: any[] = Array.isArray(apiQuestions) ? apiQuestions : [];

    // ✅ Compute summary from raw attempts (ignores buggy API summary)
    const computed = buildComputedSummary(questions, attemptMap);

    // ✅ Assessment title
    const displayTitle = assessment?.name || topicTitle || "Assessment";

    return (
      <div className="p-3">
        {/* ✅ Student Name */}
        <div className="text-left text-lg font-medium mb-4">
          Student Name: <span className="font-bold">{studentName}</span>
        </div>

        {/* ✅ Summary Section (computed from raw) */}
        <div className="border-round surface-card shadow-2 p-4 mb-5 flex flex-column md:flex-row justify-content-between">
          <div>
            <h3 className="text-xl font-bold mb-3">{displayTitle}</h3>

            <p className="mb-2 text-lg">
              Total Questions:{" "}
              <span className="font-semibold">{computed.total_questions}</span>
            </p>

            <p className="mb-2 text-lg">
              Total Max Points:{" "}
              <span className="font-semibold">{computed.total_marks}</span>
            </p>

            {/* ✅ Added Weight */}
            <p className="mb-0 text-lg">
              Weight:{" "}
              <span className="font-semibold">{assessment?.weight || 0}%</span>
            </p>
          </div>

          <div className="mt-4 md:mt-0 text-right">
            <p className="mb-2 text-lg">
              Attempted: <span className="font-bold">{computed.attempted_questions}</span>
            </p>

            <p className="mb-2 text-lg text-green-600">
              Correct Answers:{" "}
              <span className="font-bold">{computed.correct_answers}</span>
            </p>

            <p className="mb-2 text-lg text-red-500">
              Incorrect Answers:{" "}
              <span className="font-bold">{computed.incorrect_answers}</span>
            </p>

            <p className="mb-2 text-lg text-orange-500">
              Skipped Questions:{" "}
              <span className="font-bold">{computed.skipped_questions}</span>
            </p>

            <p className="mb-0 text-lg">
              Score:{" "}
              <span className="font-bold text-primary">
                {computed.score_percent}%
              </span>
            </p>
          </div>
        </div>

        {/* ✅ Questions Table (status from raw attempts) */}
        <div className="p-4 border-round surface-card shadow-2">
          <h3 className="text-xl font-semibold mb-4 flex align-items-center">
            <i className="pi pi-list mr-2 text-primary"></i>
            Question Details
          </h3>

          <div className="overflow-auto">
            <table className="w-full border-collapse" style={{ minWidth: "900px" }}>
              <thead>
                <tr className="bg-surface-100 text-left">
                  <th className="p-3 border">Q#</th>
                  <th className="p-3 border">Question</th>
                  <th className="p-3 border">Status</th>
                  <th className="p-3 border">Time Spent</th>
                  <th className="p-3 border">Type</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q: any, i: number) => {
                  const qId = String(q?.question_id ?? q?.id ?? "");
                  const raw = attemptMap[qId];

                  // ✅ Determine status from raw attempts
                  const attempted = !!raw;
                  const isCorrect = attempted ? !!raw.is_correct : false;
                  const isSkipped = !attempted;

                  let statusEl: React.ReactNode;
                  if (isSkipped) {
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
                  } else {
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
                      <td className="p-3 border">{q.statement}</td>
                      <td className="p-3 border">{statusEl}</td>
                      <td className="p-3 border">
                        {q.time_spent ? `${q.time_spent}s` : "N/A"}
                      </td>
                      <td className="p-3 border">{formatType(q.question_type)}</td>
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
