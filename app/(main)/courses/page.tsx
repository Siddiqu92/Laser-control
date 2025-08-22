"use client";

import { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import  api  from "@/service/api";
import AppBreadCrumb from "@/layout/AppBreadCrumb";

interface Course {
    id: number;
    name: string;
    description: string | null;
    program_of_study: string | null;
    session: string | null;
    status: string;
}

export default function CoursesPage() {
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // API Call
    const getCourses = async () => {
        try {
            const res = await api.get(`/items/course`);
            setCourses(res.data.data);
        } catch (error) {
            console.error("Failed to fetch courses:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getCourses();
    }, []);

    // Status badge
    const statusTemplate = (rowData: Course) => {
        return (
            <Tag
                value={rowData.status}
                severity={rowData.status === "execute" ? "success" : "warning"}
            />
        );
    };

    // Actions buttons
    const actionTemplate = (rowData: Course) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-pencil"
                    className="p-button-sm p-button-rounded p-button-warning"
                    tooltip="Edit"
                />
                <Button
                    icon="pi pi-trash"
                    className="p-button-sm p-button-rounded p-button-danger"
                    tooltip="Delete"
                />
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
                    loading={loading}
                    dataKey="id"
                    globalFilter={globalFilter}
                    emptyMessage="No courses found."
                    className="p-datatable-sm"
                >
                    <Column field="name" header="Course Name" sortable style={{ minWidth: "220px" }} />
                    <Column field="description" header="Description" style={{ minWidth: "300px" }} />
                    <Column field="program_of_study" header="Program/Grade" style={{ width: "160px" }} />
                    <Column field="session" header="Session" style={{ width: "140px" }} />
                    <Column header="Status" body={statusTemplate} style={{ width: "120px" }} sortable />
                    <Column header="Actions" body={actionTemplate} style={{ width: "150px" }} />
                </DataTable>
            </div>
        </div>
    );
}
