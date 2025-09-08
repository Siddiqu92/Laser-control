"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { ProgressSpinner } from "primereact/progressspinner";
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
    statuses: { label: string; value: StatusValue }[];
  };
  onLoad: (courseName: string | null) => Promise<void> | void;
  loadedCourseName: string | null;
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
  loadedCourseName,
}) => {
  const [loading, setLoading] = useState(false);

  // ✅ Sort grades: Kindergarten first, then Grade 1..N
  const sortedGrades = useMemo(() => {
    return [...filterOptions.grades].sort((a, b) => {
      if (a.label.toLowerCase().includes("kindergarten")) return -1;
      if (b.label.toLowerCase().includes("kindergarten")) return 1;

      const numA = parseInt(a.label.replace(/[^0-9]/g, ""), 10);
      const numB = parseInt(b.label.replace(/[^0-9]/g, ""), 10);

      if (isNaN(numA) || isNaN(numB)) {
        return a.label.localeCompare(b.label);
      }
      return numA - numB;
    });
  }, [filterOptions.grades]);

  // Auto-select first subject when grade is selected
  useEffect(() => {
    if (selectedGrade && filterOptions.subjects.length > 0 && !selectedSubject) {
      const firstSubject = filterOptions.subjects[0];
      setSelectedSubject(firstSubject.value);
      setSelectedCourseId(firstSubject.courseId);
    }
  }, [selectedGrade, filterOptions.subjects, selectedSubject, setSelectedCourseId, setSelectedSubject]);

  const handleLoad = async () => {
    if (!selectedGrade || !selectedSubject) {
      onLoad(null);
      return;
    }

    const subj = filterOptions.subjects.find((s) => s.value === selectedSubject);
    const courseName = subj
      ? `${selectedGrade} ${subj.label}`
      : `${selectedGrade} ${selectedSubject}`;

    setLoading(true);
    try {
      await onLoad(courseName);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  return (
    <div className="surface-card border-1 surface-border border-round p-3 mb-4">
      <div className="flex justify-content-between align-items-center flex-wrap gap-3">
        {/* Course Info */}
        <div className="text-mg font-bold text-900">
          {loadedCourseName || "No Course Selected"}
        </div>

        {/* Filters and Buttons */}
        <div className="flex align-items-center flex-wrap gap-3">
          {/* Grade Dropdown */}
          <Dropdown
            id="grade"
            options={sortedGrades}  
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.value)}
            placeholder="Select Grade"
            className="w-10rem h-3rem"
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
            placeholder="Select Subject"
            disabled={!selectedGrade || filterOptions.subjects.length === 0}
            className="w-12rem h-3rem"
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

          {/* Buttons / Loader */}
          <div className="flex gap-2 align-self-end">
            {loading ? (
              <ProgressSpinner
                style={{ width: "30px", height: "30px" }}
                strokeWidth="6"
                fill="var(--surface-ground)"
                animationDuration=".5s"
              />
            ) : (
              <Button
                label="Load"
                icon="pi pi-filter"
                size="small"
                onClick={handleLoad}
                className="h-3rem"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};