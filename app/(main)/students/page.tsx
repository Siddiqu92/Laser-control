"use client";

import { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import api from "@/service/api";
import StudentForm from "./form"; // 👈 import StudentForm

interface Student {
  id: string;
  name: string;
  class: string;
  rollNo: string;
  email: string;
}

export default function StudentsPage() {
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);

  const getStudents = async () => {
    try {
      const res = await api.get(
        `/users?fields[]=id&fields[]=first_name&fields[]=last_name&filter[_and][0][role][name][_contains]=student`
      );

      const data = res.data.data.map((s: any, index: number) => ({
        id: s.id,
        name: `${s.first_name} ${s.last_name}`,
        class: `Class ${index + 1}`,
        rollNo: `R-${index + 100}`,
        email: s.email ?? "-",
      }));

      setStudents(data);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStudents();
  }, []);

  const handleAddStudent = (newStudent: any) => {
    const student = {
      id: `${students.length + 1}`,
      name: `${newStudent.firstName} ${newStudent.lastName}`,
      class: newStudent.class,
      rollNo: newStudent.rollNo,
      email: newStudent.email,
    };
    setStudents((prev) => [...prev, student]);
    setShowForm(false);
  };

  const actionTemplate = (rowData: Student) => (
    <div className="flex gap-2">
      <Button icon="pi pi-eye" className="p-button-sm p-button-rounded p-button-info" tooltip="View Details" />
      <Button icon="pi pi-pencil" className="p-button-sm p-button-rounded p-button-warning" tooltip="Edit" />
      <Button icon="pi pi-trash" className="p-button-sm p-button-rounded p-button-danger" tooltip="Delete" />
    </div>
  );

  return (
    <div className="layout-main">
      <div className="flex justify-content-between align-items-center mb-4">
        <div>
          <span className="text-600">Manage all registered students in the system</span>
        </div>
        <Button label="Add New Student" icon="pi pi-plus" className="p-button-primary" onClick={() => setShowForm(true)} />
      </div>

      <div className="surface-card p-4 border-round shadow-2">
        <div className="flex justify-content-end mb-3">
          <span className="p-input-icon-left w-full md:w-20rem">
            <i className="pi pi-search" />
            <InputText
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search students..."
              className="w-full"
            />
          </span>
        </div>

        <DataTable
          value={students}
          paginator
          rows={5}
          loading={loading}
          dataKey="id"
          globalFilter={globalFilter}
          emptyMessage="No students found."
          className="p-datatable-sm"
        >
          <Column field="name" header="Name" sortable />
          <Column field="class" header="Class" sortable />
          <Column field="rollNo" header="Roll No" sortable />
          <Column field="email" header="Email" sortable />
          <Column header="Actions" body={actionTemplate} style={{ width: "180px" }} />
        </DataTable>
      </div>

      {/* Student Form Dialog */}
      <StudentForm visible={showForm} onHide={() => setShowForm(false)} onSubmit={handleAddStudent} />
    </div>
  );
}
