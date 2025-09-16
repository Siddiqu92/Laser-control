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
  lastAttempted?: string | null;
  isPractice?: boolean;
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

const formatDate = (dateString: string | null): string => {
  if (!dateString) return "Not attempted";
  try {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, options);
  } catch {
    return dateString;
  }
};

const AssessmentResult: React.FC<AssessmentResultProps> = ({
  visible,
  onHide,
  loading,
  assessmentData,
  studentName,
  topicTitle,
  activityType,
  activityTitle,
  lastAttempted,
  isPractice = false,
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

    let questions: any[] = [];
    let summary: any = {};
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let attemptedQuestions = 0;
    let totalQuestions = 0;

    if (isPractice) {
      const { assessment, attempt } = assessmentData;
      questions = Array.isArray(assessmentData.questions)
        ? assessmentData.questions
        : [];
      totalQuestions = questions.length;

      if (attempt && attempt.questions && typeof attempt.questions === "string") {
        try {
          const attemptData = JSON.parse(attempt.questions);
          const questionIds = Object.keys(attemptData);

          attemptedQuestions = questionIds.length;

          questionIds.forEach((qId) => {
            if (attemptData[qId].is_correct) {
              correctAnswers++;
            } else {
              incorrectAnswers++;
            }
          });
        } catch (error) {
          console.error("Error parsing attempt questions:", error);
        }
      } else if (questions && Array.isArray(questions)) {
        questions.forEach((question: any) => {
          const attempted = question.student_answer_raw !== null;

          if (attempted) {
            attemptedQuestions++;
            if (question.is_correct) {
              correctAnswers++;
            } else {
              incorrectAnswers++;
            }
          }
        });
      }

      summary = {
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        incorrect_answers: incorrectAnswers,
        attempted: attemptedQuestions > 0,
        score:
          totalQuestions > 0
            ? Math.round((correctAnswers / totalQuestions) * 100)
            : 0,
      };
    } else {
      questions = Array.isArray(assessmentData.questions)
        ? assessmentData.questions
        : [];
      summary = assessmentData.summary || {};
      totalQuestions = summary.total_questions || questions.length;
      correctAnswers = summary.correct_answers || 0;
      incorrectAnswers = summary.incorrect_answers || 0;
      attemptedQuestions = summary.attempted ? totalQuestions : 0;
    }

    const scorePercent =
      summary.score ||
      (totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0);
    const obtainedMarks = summary.obtained_marks || correctAnswers;
    const displayTitle = activityTitle || topicTitle || "Assessment";

    return (
      <div className="p-3">
        {/* Student Name */}
        <div className="text-left text-lg font-medium mb-4">
          Student Name: <span className="font-bold">{studentName}</span>
        </div>

        {/* Summary Section */}
        <div className="border-round surface-card shadow-2 p-4 mb-5 flex flex-column md:flex-row justify-content-between">
          <div>
            <div className="text-left text-lg font-medium mb-4">
              <span className="font-bold">{displayTitle}</span>
            </div>

            <p className="mb-2 text-lg">
              Total Questions:{" "}
              <span className="font-semibold">{totalQuestions}</span>
            </p>

            <p className="mb-2 text-lg">
              Obtained Marks:{" "}
              <span className="font-semibold">{obtainedMarks}</span> /{" "}
              <span className="font-semibold">{totalQuestions}</span>
            </p>

            {isPractice ? (
              <p className="mb-0 text-lg">
                Last Attempt:{" "}
                <span className="font-semibold">
                  {lastAttempted ? formatDate(lastAttempted) : "Not attempted"}
                </span>
              </p>
            ) : (
              <p className="mb-0 text-lg">
                Weight:{" "}
                <span className="font-semibold">{summary.weight || 0}%</span>
              </p>
            )}
          </div>

          <div className="mt-4 md:mt-0 text-right">
            <p className="mb-2 text-lg">
              Attempted: <span className="font-bold">{attemptedQuestions}</span>
            </p>

            <p className="mb-2 text-lg text-green-600">
              Correct Answers: <span className="font-bold">{correctAnswers}</span>
            </p>

            <p className="mb-2 text-lg text-red-500">
              Incorrect Answers:{" "}
              <span className="font-bold">{incorrectAnswers}</span>
            </p>

            <p className="mb-0 text-lg">
              Score:{" "}
              <span className="font-bold text-primary">{scorePercent}%</span>
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
                  let statusEl: React.ReactNode;

                  const attempted = q.answer !== "" && q.answer !== null;
                  const isCorrect =
                    q.is_correct === true || q.is_correct === 1;
                  const isIncorrect =
                    (q.is_correct === false || q.is_correct === 0) && attempted;
                  const notAttempted = !attempted;
                  const notStarted = !summary.attempted;

                  if (notStarted || notAttempted) {
                    statusEl = (
                      <span className="text-gray-400 font-semibold flex align-items-center">
                        <i className="pi pi-ban mr-2"></i>
                        Not Started
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
                    <tr
                      key={q.question_id || i}
                      className="hover:surface-hover"
                    >
                      <td className="p-3 border">{i + 1}</td>
                      <td className="p-3 border">
                        {q.statement || q.question || "N/A"}
                      </td>
                      <td className="p-3 border">{statusEl}</td>
                      <td className="p-3 border">
                        {q.time_spent ? `${q.time_spent}s` : "N/A"}
                      </td>
                      <td className="p-3 border">
                        {formatType(
                          q.question_type ||
                            q.type ||
                            q.questionType ||
                            ""
                        )}
                      </td>
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
