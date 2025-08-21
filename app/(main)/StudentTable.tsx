"use client";
import { Student, Lesson } from "./types";
import { getProgressIcon } from "./utils";

interface StudentTableProps {
  students: Student[];
  lessons: Lesson[];
  first: number;
  onCellClick: (studentId: string, lessonId: number, type: string) => void;
}

export default function StudentTable({
  students,
  lessons,
  first,
  onCellClick,
}: StudentTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl shadow-md border border-gray-300">
      <table className="min-w-max w-full border-collapse border border-gray-300 rounded-xl">
        <thead>
          <tr className="bg-surface-100">
            <th className="p-3 text-left font-bold border-1 surface-border sticky left-0 z-20 bg-surface-100 min-w-[60px]">
              #
            </th>
            <th className="p-3 text-left font-bold border-1 surface-border sticky left-14 z-20 bg-surface-100 min-w-[200px]">
              Student
            </th>
            {lessons.map((lesson) => (
              <th
                key={lesson.id}
                className="p-3 text-center font-bold border-1 surface-border whitespace-nowrap min-w-48"
                title={lesson.name}
              >
                {lesson.name.length > 20
                  ? `${lesson.name.substring(0, 20)}...`
                  : lesson.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr
              key={student.id}
              className="hover:bg-surface-50 transition-colors"
            >
              <td className="p-3 border-1 surface-border sticky left-0 z-10 bg-white font-medium">
                {first + index + 1}
              </td>
              <td className="p-3 border-1 surface-border sticky left-14 z-10 bg-white min-w-40">
                <span className="font-medium text-surface-700">
                  {student.first_name} {student.last_name}
                </span>
              </td>
              {lessons.map((lesson) => {
                const progress = student.lessons_progress.find(
                  (lp) => lp.lesson_id === lesson.id
                );
                const clickable = lesson.type === "learning_object";

                return (
                  <td
                    key={lesson.id}
                    className={`p-3 text-center border-1 surface-border min-w-48 ${
                      clickable ? "cursor-pointer" : ""
                    }`}
                    onClick={() =>
                      clickable && progress
                        ? onCellClick(student.id, lesson.id, lesson.type)
                        : null
                    }
                  >
                    {progress ? getProgressIcon(progress.progress) : "—"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
