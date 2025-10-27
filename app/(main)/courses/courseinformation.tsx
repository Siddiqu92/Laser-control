"use client";
import React, { useState } from "react";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { CourseDetails } from "./types/courseTypes";
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';

interface CourseInformationProps {
  course: CourseDetails | null;
  courseMetadata: any;
}

const CourseInformation: React.FC<CourseInformationProps> = ({
  course,
  courseMetadata,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    character_voice: course?.character_voice || "",
    name: course?.name || "",
    description: course?.description || "",
    status: course?.status || "",
    course_type: course?.course_type || "base",
    program_of_study: course?.program_of_study || "",
    session: course?.session || "",
  });

  const statusOptions = [
    { label: "WIP", value: "wip" },
    { label: "Complete", value: "complete" },
    { label: "Execute", value: "execute" },
    { label: "Archive", value: "archive" },
  ];

  const courseTypeOptions = [
    { label: "Base", value: "base" },
    { label: "Standard", value: "standard" },
  ];

  const programGradeOptions = [
    { label: "Kindergarten", value: "kindergarten" },
    { label: "Grade 1", value: "grade1" },
    { label: "Grade 2", value: "grade2" },
    { label: "Grade 3", value: "grade3" },
    { label: "Grade 4", value: "grade4" },
    { label: "Grade 5", value: "grade5" },
  ];

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setEditMode(false);
    setFormData({
      character_voice: course?.character_voice || "",
      name: course?.name || "",
      description: course?.description || "",
      status: course?.status || "",
      course_type: course?.course_type || "base",
      program_of_study: course?.program_of_study || "",
      session: course?.session || "",
    });
  };

  const handleSave = () => {
    console.log("Saving data:", formData);
    setEditMode(false);
  };

  const programGrade =
    course?.name?.split("(")[0]?.trim() ||
    formData.program_of_study ||
    "-";

  const sessionDisplay =
    course?.name?.match(/\((.*?)\)/)?.[1] ||
    formData.session ||
    "-";

  const headerTemplate = (
    <div className="flex justify-content-between align-items-center px-3 pt-3 pb-1">
      <h3 className="m-0 text-2xl font-bold text-900">Course Information</h3>
      <div>
        {!editMode ? (
          <Button
            label="Edit"
            icon="pi pi-pencil"
            className="p-button-text text-lg font-semibold"
            onClick={() => setEditMode(true)}
          />
        ) : (
          <div className="flex gap-2">
            <Button
              label="Cancel"
              icon="pi pi-times"
              className="p-button-text text-lg font-semibold"
              onClick={handleCancel}
            />
            <Button
              label="Save"
              icon="pi pi-check"
              className="p-button-primary text-lg font-semibold"
              onClick={handleSave}
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderFieldContent = (field: string, value: any, editComponent: React.ReactNode) => {
    if (!editMode) {
      return (
        <div className="text-900">
          {value || <span className="text-600">-</span>}
        </div>
      );
    }
    return editComponent;
  };

  return (
    <Card header={headerTemplate} className="mb-4">
      <div className="grid p-3">



      {/* Character Voice */}
<div className="col-12">
  <div className="p-3 border-1 border-200 border-round">
    <div className="font-semibold text-900 mb-2">Character Voice</div>
    <div className="text-900">
      {!editMode ? (
        <div className="flex align-items-center gap-2">
          <RecordVoiceOverIcon 
            className="text-primary"
            sx={{ 
              fontSize: '20px',
              color: 'var(--primary-color) !important'
            }} 
          />
          {formData.character_voice ? (
            <span>{formData.character_voice}</span>
          ) : (
            <span className="text-600">This text will be spoken by character</span>
          )}
        </div>
      ) : (
        <div className="relative">
          <RecordVoiceOverIcon 
            className="absolute left-3 top-3 text-primary"
            sx={{ 
              fontSize: '20px',
              zIndex: 10,
              color: 'var(--primary-color) !important'
            }} 
          />
          <InputTextarea
            value={formData.character_voice}
            onChange={(e) => handleChange("character_voice", e.target.value)}
            rows={2}
            className="w-full pl-10"
            placeholder="This text will be spoken by character"
          />
        </div>
      )}
    </div>
  </div>
</div>



        {/* Name */}
        <div className="col-12">
          <div className="p-3 border-1 border-200 border-round">
            <div className="font-semibold text-900 mb-2">Name</div>
            <div className="text-900">
              {renderFieldContent(
                "name",
                formData.name,
                <InputText
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full"
                  placeholder="Enter course name"
                />
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="col-12">
          <div className="p-3 border-1 border-200 border-round">
            <div className="font-semibold text-900 mb-2">Description</div>
            <div className="text-900">
              {renderFieldContent(
                "description",
                formData.description || "No description available",
                <InputTextarea
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={3}
                  className="w-full"
                  placeholder="Enter course description"
                />
              )}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="col-12 md:col-6">
          <div className="p-3 border-1 border-200 border-round">
            <div className="font-semibold text-900 mb-2">Status</div>
            <div className="text-900">
              {renderFieldContent(
                "status",
                formData.status,
                <Dropdown
                  value={formData.status}
                  options={statusOptions}
                  optionLabel="label"
                  placeholder="Select Status"
                  className="w-full"
                  onChange={(e) => handleChange("status", e.value)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Course Type */}
        <div className="col-12 md:col-6">
          <div className="p-3 border-1 border-200 border-round">
            <div className="font-semibold text-900 mb-2">Course Type</div>
            <div className="text-900">
              {renderFieldContent(
                "course_type",
                formData.course_type,
                <Dropdown
                  value={formData.course_type}
                  options={courseTypeOptions}
                  optionLabel="label"
                  placeholder="Select Course Type"
                  className="w-full"
                  onChange={(e) => handleChange("course_type", e.value)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Program / Grade */}
        <div className="col-12 md:col-6">
          <div className="p-3 border-1 border-200 border-round">
            <div className="font-semibold text-900 mb-2">Program / Grade</div>
            <div className="text-900">
              {renderFieldContent(
                "program_of_study",
                programGrade,
                <Dropdown
                  value={formData.program_of_study}
                  options={programGradeOptions}
                  optionLabel="label"
                  placeholder="Select Grade"
                  className="w-full"
                  onChange={(e) => handleChange("program_of_study", e.value)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Session */}
        <div className="col-12 md:col-6">
          <div className="p-3 border-1 border-200 border-round">
            <div className="font-semibold text-900 mb-2">Session</div>
            <div className="text-900">
              {renderFieldContent(
                "session",
                sessionDisplay,
                <InputText
                  value={formData.session}
                  onChange={(e) => handleChange("session", e.target.value)}
                  className="w-full"
                  placeholder="Enter session"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CourseInformation;