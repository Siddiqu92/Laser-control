"use client";

import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import api from "@/service/api";

interface CourseFormProps {
  visible: boolean;
  onHide: () => void;
  onSuccess: () => void;
}

const statusOptions = [
  { label: "Execute", value: "execute" },
  { label: "Pending", value: "pending" },
];

export default function CourseForm({ visible, onHide, onSuccess }: CourseFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    program_of_study: "",
    session: "",
    status: "pending",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post("/items/course", formData);
      onSuccess(); // refresh list
      onHide(); // close modal
    } catch (error) {
      console.error("Failed to add course:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      header="Add New Course"
      visible={visible}
      style={{ width: "500px" }}
      modal
      onHide={onHide}
    >
      <div className="p-fluid flex flex-column gap-3">
        <span className="p-float-label">
          <InputText
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          <label htmlFor="name">Course Name</label>
        </span>

        <span className="p-float-label">
          <InputText
            id="description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />
          <label htmlFor="description">Description</label>
        </span>

        <span className="p-float-label">
          <InputText
            id="program_of_study"
            value={formData.program_of_study}
            onChange={(e) => handleChange("program_of_study", e.target.value)}
          />
          <label htmlFor="program_of_study">Program/Grade</label>
        </span>

        <span className="p-float-label">
          <InputText
            id="session"
            value={formData.session}
            onChange={(e) => handleChange("session", e.target.value)}
          />
          <label htmlFor="session">Session</label>
        </span>

        <Dropdown
          value={formData.status}
          options={statusOptions}
          onChange={(e) => handleChange("status", e.value)}
          placeholder="Select Status"
        />

        <div className="flex justify-content-end gap-2 mt-3">
          <Button label="Cancel" severity="secondary" onClick={onHide} />
          <Button
            label="Save"
            icon="pi pi-check"
            loading={loading}
            onClick={handleSubmit}
          />
        </div>
      </div>
    </Dialog>
  );
}
