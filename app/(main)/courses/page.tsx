"use client";

import { useState } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import AppBreadCrumb from "@/layout/AppBreadCrumb";

interface Course {
    id: number;
    code: string;
    name: string;
    description: string;
    credits: number;
    status: "Active" | "Inactive";
}

export default function CoursesPage() {
    const [globalFilter, setGlobalFilter] = useState<string>("");

    const [courses] = useState<Course[]>([
        {
            id: 1,
            code: "CS101",
            name: "Introduction to Programming",
            description: "Basic programming concepts using Python.",
            credits: 3,
            status: "Active",
        },
        {
            id: 2,
            code: "BUS201",
            name: "Principles of Marketing",
            description: "Core marketing principles and strategies.",
            credits: 4,
            status: "Active",
        },
        {
            id: 3,
            code: "DES301",
            name: "Digital Illustration",
            description: "Advanced tools and techniques for vector graphics.",
            credits: 2,
            status: "Inactive",
        },
    ]);

    // Status badge
    const statusTemplate = (rowData: Course) => {
        return (
            <Tag
                value={rowData.status}
                severity={rowData.status === "Active" ? "success" : "danger"}
            />
        );
    };

    // Actions buttons
    const actionTemplate = (rowData: Course) => {
        return (
            <div className="flex gap-2">
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
                   
                    <span className="text-600">Manage all available courses in the system</span>
                </div>
                <Button label="Add New Course" icon="pi pi-plus" className="p-button-primary" />
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
                            placeholder="Search courses..."
                            className="w-full"
                        />
                    </span>
                </div>

                {/* DataTable */}
                <DataTable
                    value={courses}
                    paginator
                    rows={5}
                    dataKey="id"
                    globalFilter={globalFilter}
                    emptyMessage="No courses found."
                    className="p-datatable-sm"
                >
                    <Column field="code" header="Course Code" sortable style={{ minWidth: "120px" }} />
                    <Column field="name" header="Course Name" sortable style={{ minWidth: "200px" }} />
                    <Column field="description" header="Description" style={{ minWidth: "300px" }} />
                    <Column field="credits" header="Credits" sortable style={{ width: "100px" }} />
                    <Column header="Status" body={statusTemplate} style={{ width: "120px" }} sortable />
                    <Column header="Actions" body={actionTemplate} style={{ width: "150px" }} />
                </DataTable>
            </div>
        </div>
    );
}
