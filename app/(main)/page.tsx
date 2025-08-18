"use client";
import { useState, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { ApiService } from "@/service/api";

type StatusValue = "completed" | "in-progress" | "not-started";

export default function SchoolDashboard() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<StatusValue[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await ApiService.getProgramOfStudyDetailed();
        setPrograms(data || []);
      } catch (err) {
        console.error("Error fetching programs:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filterOptions = {
    grades: Array.from(new Set(programs.map((p) => p.name))).map((name) => ({
      label: name,
      value: name,
    })),
    subjects: Array.from(
      new Set(
        programs.flatMap((p) =>
          p.courses.map((c: any) => c.course_id?.name).filter(Boolean)
        )
      )
    ).map((name) => ({ label: name, value: name })),
    statuses: [
      { label: "Completed", value: "completed" },
      { label: "In Progress", value: "in-progress" },
      { label: "Not Started", value: "not-started" },
    ],
  };

  const getFilteredData = () => {
    let data = [...programs];
    if (selectedGrade) {
      data = data.filter((p) => p.name === selectedGrade);
    }
    if (selectedSubject) {
      data = data.map((p) => ({
        ...p,
        courses: p.courses.filter(
          (c: any) => c.course_id?.name === selectedSubject
        ),
      }));
    }
    if (selectedStatuses.length > 0) {
      data = data.map((p) => ({
        ...p,
        courses: p.courses.map((c: any) => ({
          ...c,
          course_id: {
            ...c.course_id,
            student_course_progress:
              c.course_id?.student_course_progress?.filter((scp: any) =>
                selectedStatuses.includes(scp.status)
              ) || [],
          },
        })),
      }));
    }
    return data;
  };

  const filteredPrograms = getFilteredData();

  if (loading) return <div>Loading data...</div>;

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card h-auto">
          <div className="flex justify-content-between mb-6">
            <span className="text-900 text-xl font-semibold">
              Subject Progress Dashboard
            </span>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4 p-3 border-round border-1 surface-border">
            <Dropdown
              options={filterOptions.grades}
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.value)}
              placeholder="Select Grade"
              className="w-14rem"
            />
            <Dropdown
              options={filterOptions.subjects}
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.value)}
              placeholder="Select Subject"
              className="w-14rem"
            />
            {filterOptions.statuses.map((status) => (
              <div key={status.value} className="flex align-items-center">
                <Checkbox
                  inputId={status.value}
                  checked={selectedStatuses.includes(status.value as StatusValue)}
                  onChange={() =>
                    setSelectedStatuses((prev) =>
                      prev.includes(status.value as StatusValue)
                        ? prev.filter((s) => s !== status.value)
                        : [...prev, status.value as StatusValue]
                    )
                  }
                />
                <label htmlFor={status.value} className="ml-2 text-sm">
                  {status.label}
                </label>
              </div>
            ))}
            <Button
               label="Load"
              icon="pi pi-filter"
              className="ml-auto"
              onClick={() => {
                setSelectedGrade(null);
                setSelectedSubject(null);
                setSelectedStatuses([]);
              }}
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="p-3">Grade</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Student</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrograms.flatMap((program) =>
                  program.courses.flatMap((course: any) =>
                    course.course_id?.student_course_progress?.map(
                      (progress: any) => (
                        <tr key={progress.id}>
                          <td className="p-3">{program.name}</td>
                          <td className="p-3">{course.course_id?.name}</td>
                          <td className="p-3">
                            {progress.student_id?.name || "N/A"}
                          </td>
                          <td className="p-3">{progress.status}</td>
                        </tr>
                      )
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
