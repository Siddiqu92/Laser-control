"use client";

import { useState } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import AppBreadCrumb from "@/layout/AppBreadCrumb";

interface ProgramOfStudy {
    id: number;
    name: string;
    courses: string;
    description: string;
    status: "Active" | "Inactive";
}

export default function ProgramsOfStudyPage() {
    const [globalFilter, setGlobalFilter] = useState<string>("");

    const [programs] = useState<ProgramOfStudy[]>([
        {
            id: 1,
            name: "Computer Science",
            courses: "Programming Fundamentals, Data Structures, Web Development",
            description: "Covers core concepts of computing, programming, and systems.",
            status: "Active",
        },
        {
            id: 2,
            name: "Business Administration",
            courses: "Marketing, Accounting, Organizational Behavior",
            description: "Focuses on business operations, management, and leadership skills.",
            status: "Active",
        },
        {
            id: 3,
            name: "Graphic Design",
            courses: "Typography, Branding, Digital Illustration",
            description: "Explores creative design principles and modern design tools.",
            status: "Inactive",
        },
    ]);

    // Status badge template
    const statusTemplate = (rowData: ProgramOfStudy) => {
        return (
            <Tag
                value={rowData.status}
                severity={rowData.status === "Active" ? "success" : "danger"}
            />
        );
    };

    // Action buttons template
    const actionTemplate = (rowData: ProgramOfStudy) => {
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
                    <span className="text-600">Manage all programs and their associated courses</span>
                </div>
                <Button label="Add New Program" icon="pi pi-plus" className="p-button-primary" />
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
                            placeholder="Search programs..."
                            className="w-full"
                        />
                    </span>
                </div>

                {/* DataTable */}
                <DataTable
                    value={programs}
                    paginator
                    rows={5}
                    dataKey="id"
                    globalFilter={globalFilter}
                    emptyMessage="No programs found."
                    className="p-datatable-sm"
                >
                    <Column field="name" header="Program Name" sortable style={{ minWidth: "200px" }} />
                    <Column field="courses" header="Courses" style={{ minWidth: "250px" }} />
                    <Column field="description" header="Description" style={{ minWidth: "300px" }} />
                    <Column header="Status" body={statusTemplate} style={{ width: "120px" }} sortable />
                    <Column header="Actions" body={actionTemplate} style={{ width: "150px" }} />
                </DataTable>
            </div>
        </div>
    );
}
