"use client";

import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";

interface TeacherFormProps {
  visible: boolean;
  onHide: () => void;
  onSubmit: (teacher: any) => void;
}

const subjects = [
  { label: "Mathematics", value: "Mathematics" },
  { label: "Science", value: "Science" },
  { label: "English", value: "English" },
  { label: "Computer Science", value: "Computer Science" },
];

export default function TeacherForm({ visible, onHide, onSubmit }: TeacherFormProps) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    subject: "",
  });

  const handleChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({ first_name: "", last_name: "", email: "", subject: "" }); // reset form
    onHide();
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={onHide} />
      <Button label="Save" icon="pi pi-check" className="p-button-primary" onClick={handleSubmit} />
    </div>
  );

  return (
    <Dialog
      header="Add New Teacher"
      visible={visible}
      onHide={onHide}
      footer={footer}
      style={{ width: "500px" }}
      modal
    >
      <div className="flex flex-column gap-3">
        <div>
          <label className="block mb-2">First Name</label>
          <InputText
            value={formData.first_name}
            onChange={(e) => handleChange("first_name", e.target.value)}
            className="w-full"
            placeholder="Enter first name"
          />
        </div>

        <div>
          <label className="block mb-2">Last Name</label>
          <InputText
            value={formData.last_name}
            onChange={(e) => handleChange("last_name", e.target.value)}
            className="w-full"
            placeholder="Enter last name"
          />
        </div>

        <div>
          <label className="block mb-2">Email</label>
          <InputText
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full"
            placeholder="Enter email"
          />
        </div>

        <div>
          <label className="block mb-2">Subject</label>
          <Dropdown
            value={formData.subject}
            options={subjects}
            onChange={(e) => handleChange("subject", e.value)}
            placeholder="Select subject"
            className="w-full"
          />
        </div>
      </div>
    </Dialog>
  );
}
