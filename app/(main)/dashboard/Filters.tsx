import React from "react";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { StatusValue } from "./types";

interface FiltersProps {
  selectedGrade: string | null;
  setSelectedGrade: (grade: string | null) => void;
  selectedSubject: string | null;
  setSelectedSubject: (subject: string | null) => void;
  setSelectedCourseId: (courseId: string | null) => void;
  selectedStatuses: StatusValue[];
  setSelectedStatuses: (statuses: StatusValue[]) => void;
  filterOptions: {
    grades: { label: string; value: string }[];
    subjects: { label: string; value: string; courseId: string }[];
  };
  onLoad: () => void;
}

export const Filters: React.FC<FiltersProps> = ({
  selectedGrade,
  setSelectedGrade,
  selectedSubject,
  setSelectedSubject,
  setSelectedCourseId,
  selectedStatuses,
  setSelectedStatuses,
  filterOptions,
  onLoad,
}) => {
  return (
    <div
      className="flex justify-content-between align-items-center flex-wrap gap-3 mb-4 p-3 border-round"
      style={{ border: "1px solid #e5e7eb", background: "#f8fafc" }}
    >
      {/* Left side - All filters merged together */}
      <div className="flex gap-3 align-items-center">
        {/* Grade Dropdown */}
        <Dropdown
          id="grade"
          options={filterOptions.grades}
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.value)}
          placeholder="Grade"
          style={{ width: "150px" }}
        />

        {/* Subject Dropdown */}
        <Dropdown
          id="subject"
          options={filterOptions.subjects}
          value={selectedSubject}
          onChange={(e) => {
            setSelectedSubject(e.value);
            const subj = filterOptions.subjects.find((s) => s.value === e.value);
            setSelectedCourseId(subj?.courseId || null);
          }}
          placeholder="Subject"
          disabled={!selectedGrade || filterOptions.subjects.length === 0}
          style={{ width: "200px" }}
        />

        {/* Status Filters - Now placed right after dropdowns */}
        <div className="flex gap-3 align-items-center ml-2">
          {[
            { label: "Completed", value: "completed" as StatusValue },
            { label: "In Progress", value: "in-progress" as StatusValue },
            { label: "Not Started", value: "not-started" as StatusValue },
          ].map((status) => (
            <div key={status.value} className="flex align-items-center gap-1">
              <Checkbox
                inputId={status.value}
                checked={selectedStatuses.includes(status.value)}
                onChange={() =>
                  setSelectedStatuses(
                    selectedStatuses.includes(status.value)
                      ? selectedStatuses.filter((s) => s !== status.value)
                      : [...selectedStatuses, status.value]
                  )
                }
              />
              <label
                htmlFor={status.value}
                className="text-sm whitespace-nowrap"
              >
                {status.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Right side - Buttons */}
      <div className="flex gap-2 align-items-center">
        <Button
          label="Load"
          icon="pi pi-filter"
          className="p-button-sm"
          onClick={onLoad}
        />
        <Button
          label="Export"
          icon="pi pi-download"
          className="p-button-sm p-button-outlined"
        />
      </div>
    </div>
  );
};
