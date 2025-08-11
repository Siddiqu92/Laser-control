"use client";

import { useState } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import AppBreadCrumb from "@/layout/AppBreadCrumb";

interface Student {
    id: number;
    name: string;
    class: string;
    rollNo: string;
    email: string;
}

export default function StudentsPage() {
    const [globalFilter, setGlobalFilter] = useState<string>("");

    // Dummy student data
    const [students] = useState<Student[]>([
        { id: 1, name: "Ali Khan", class: "10-A", rollNo: "101", email: "ali.khan@example.com" },
        { id: 2, name: "Sara Ahmed", class: "9-B", rollNo: "202", email: "sara.ahmed@example.com" },
        { id: 3, name: "Hassan Raza", class: "8-A", rollNo: "303", email: "hassan.raza@example.com" },
        { id: 4, name: "Ayesha Noor", class: "7-C", rollNo: "404", email: "ayesha.noor@example.com" },
    ]);

    // Action buttons template
    const actionTemplate = (rowData: Student) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-eye" className="p-button-sm p-button-rounded p-button-info" tooltip="View Details" />
                <Button icon="pi pi-pencil" className="p-button-sm p-button-rounded p-button-warning" tooltip="Edit" />
                <Button icon="pi pi-trash" className="p-button-sm p-button-rounded p-button-danger" tooltip="Delete" />
            </div>
        );
    };

    return (
        <div className="layout-main">
            

            {/* Page Header */}
            <div className="flex justify-content-between align-items-center mb-4">
                <div>
              
                    <span className="text-600">Manage all registered students in the system</span>
                </div>
                <Button label="Add New Student" icon="pi pi-plus" className="p-button-primary" />
            </div>

            {/* Card with Table */}
            <div className="surface-card p-4 border-round shadow-2">
                {/* Search Bar */}
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

                {/* DataTable */}
                <DataTable
                    value={students}
                    paginator
                    rows={5}
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
        </div>
    );
}
