"use client";

import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

interface StudentFormProps {
  visible: boolean;
  onHide: () => void;
  onSubmit: (student: any) => void;
}

export default function StudentForm({ visible, onHide, onSubmit }: StudentFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    rollNo: "",
    class: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.firstName || !formData.lastName) {
      alert("Please fill required fields");
      return;
    }
    onSubmit(formData);
    setFormData({ firstName: "", lastName: "", email: "", rollNo: "", class: "" });
  };

  return (
    <Dialog
      header="Add New Student"
      visible={visible}
      style={{ width: "40vw" }}
      modal
      onHide={onHide}
      footer={
        <div className="flex justify-end gap-2">
          <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={onHide} />
          <Button label="Save" icon="pi pi-check" className="p-button-primary" onClick={handleSubmit} />
        </div>
      }
    >
      <div className="p-fluid grid formgrid">
        <div className="field col-6">
          <label htmlFor="firstName">First Name</label>
          <InputText id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} />
        </div>
        <div className="field col-6">
          <label htmlFor="lastName">Last Name</label>
          <InputText id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} />
        </div>
        <div className="field col-6">
          <label htmlFor="email">Email</label>
          <InputText id="email" name="email" value={formData.email} onChange={handleChange} />
        </div>
        <div className="field col-6">
          <label htmlFor="rollNo">Roll No</label>
          <InputText id="rollNo" name="rollNo" value={formData.rollNo} onChange={handleChange} />
        </div>
        <div className="field col-6">
          <label htmlFor="class">Class</label>
          <InputText id="class" name="class" value={formData.class} onChange={handleChange} />
        </div>
      </div>
    </Dialog>
  );
}
