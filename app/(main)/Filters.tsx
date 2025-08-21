"use client";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { StatusValue } from "./types";

interface FiltersProps {
  filterOptions: {
    grades: { label: string; value: string }[];
    subjects: { label: string; value: string; courseId: string }[];
    statuses: { label: string; value: StatusValue }[];
  };
  selectedGrade: string | null;
  setSelectedGrade: (val: string | null) => void;
  selectedSubject: string | null;
  setSelectedSubject: (val: string | null) => void;
  setSelectedCourseId: (val: string | null) => void;
  selectedStatuses: StatusValue[];
  setSelectedStatuses: (val: StatusValue[]) => void;
  onLoad: () => void;
}

export default function Filters({
  filterOptions,
  selectedGrade,
  setSelectedGrade,
  selectedSubject,
  setSelectedSubject,
  setSelectedCourseId,
  selectedStatuses,
  setSelectedStatuses,
  onLoad,
}: FiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 mb-4 p-3 border-round border-1 surface-border">
      {/* Grade Dropdown */}
      <Dropdown
        options={filterOptions.grades}
        value={selectedGrade}
        onChange={(e) => setSelectedGrade(e.value)}
        placeholder="Select Grade"
        className="w-14rem"
      />

      {/* Subject Dropdown */}
      <Dropdown
        options={filterOptions.subjects}
        value={selectedSubject}
        onChange={(e) => {
          setSelectedSubject(e.value);
          const subj = filterOptions.subjects.find((s) => s.value === e.value);
          setSelectedCourseId(subj?.courseId || null);
        }}
        placeholder="Select Subject"
        className="w-14rem"
        disabled={!selectedGrade || filterOptions.subjects.length === 0}
      />

      {/* Status Filters */}
      {filterOptions.statuses.map((status) => (
        <div key={status.value} className="flex align-items-center">
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
          <label htmlFor={status.value} className="ml-2 text-sm">
            {status.label}
          </label>
        </div>
      ))}

      {/* Load Button */}
      <Button label="Load" icon="pi pi-refresh" className="ml-auto" onClick={onLoad} />
    </div>
  );
}
