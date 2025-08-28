import React, { useEffect, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
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
  filterOptions,
  onLoad,
  loadedCourseName,
}) => {
  const [loading, setLoading] = useState(false); 


  useEffect(() => {
    if (selectedGrade && filterOptions.subjects.length > 0) {
      const firstSubject = filterOptions.subjects[0];
      setSelectedSubject(firstSubject.value);
      setSelectedCourseId(firstSubject.courseId);
    }
  }, [selectedGrade, filterOptions.subjects, setSelectedSubject, setSelectedCourseId]);

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
      {/* Top row: Course Info (left) + Filters (right) */}
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
            options={filterOptions.grades}
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.value)}
            placeholder="Select Grade"
            className="w-10rem"
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
            className="w-12rem"
          />

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
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
