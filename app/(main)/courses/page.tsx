"use client";

 import { useState, useEffect } from "react";
 import Link from "next/link";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import api from "@/service/api";

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

    // Dialog & Form states
    const [showDialog, setShowDialog] = useState<boolean>(false);
    const [formData, setFormData] = useState<Partial<Course>>({
        name: "",
        description: "",
        program_of_study: "",
        session: "",
        status: "draft",
    });

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

    // Handle form input
    const handleChange = (field: keyof Course, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Save Course
    const saveCourse = async () => {
        try {
            await api.post("/items/course", formData);
            setShowDialog(false);
            setFormData({
                name: "",
                description: "",
                program_of_study: "",
                session: "",
                status: "draft",
            });
            getCourses(); // Refresh table
        } catch (error) {
            console.error("Failed to save course:", error);
        }
    };

    return (
        <div className="layout-main">
            {/* Page Header */}
            <div className="flex justify-content-between align-items-center mb-4">
                <div>
                    <span className="text-600">Manage all available courses in the system</span>
                </div>
                <Button
                    label="Add New Course"
                    icon="pi pi-plus"
                    className="p-button-primary"
                    onClick={() => setShowDialog(true)}
                />
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
                     <Column header="Course Name" body={(rowData: Course) => (
                         <Link href={`/courses/courseviewer?courseId=${rowData.id}`} className="text-primary hover:underline">
                             {rowData.name}
                         </Link>
                     )} sortable style={{ minWidth: "220px" }} />
                    <Column field="description" header="Description" style={{ minWidth: "300px" }} />
                    <Column field="program_of_study" header="Program/Grade" style={{ width: "160px" }} />
                    <Column field="session" header="Session" style={{ width: "140px" }} />
                    <Column header="Status" body={statusTemplate} style={{ width: "120px" }} sortable />
                    <Column header="Actions" body={actionTemplate} style={{ width: "150px" }} />
                </DataTable>
            </div>

            {/* Dialog for Add Course */}
            <Dialog
                header="Add New Course"
                visible={showDialog}
                style={{ width: "500px" }}
                modal
                onHide={() => setShowDialog(false)}
            >
                <div className="flex flex-column gap-3">
                    <span className="p-float-label">
                        <InputText
                            value={formData.name || ""}
                            onChange={(e) => handleChange("name", e.target.value)}
                            className="w-full"
                        />
                        <label>Course Name</label>
                    </span>

                    <span className="p-float-label">
                        <InputTextarea
                            value={formData.description || ""}
                            onChange={(e) => handleChange("description", e.target.value)}
                            rows={3}
                            className="w-full"
                        />
                        <label>Description</label>
                    </span>

                    <span className="p-float-label">
                        <InputText
                            value={formData.program_of_study || ""}
                            onChange={(e) => handleChange("program_of_study", e.target.value)}
                            className="w-full"
                        />
                        <label>Program/Grade</label>
                    </span>

                    <span className="p-float-label">
                        <InputText
                            value={formData.session || ""}
                            onChange={(e) => handleChange("session", e.target.value)}
                            className="w-full"
                        />
                        <label>Session</label>
                    </span>

                    <span className="p-float-label">
                        <Dropdown
                            value={formData.status}
                            options={[
                                { label: "Draft", value: "draft" },
                                { label: "Execute", value: "execute" },
                            ]}
                            onChange={(e) => handleChange("status", e.value)}
                            className="w-full"
                        />
                        <label>Status</label>
                    </span>
                </div>

                <div className="flex justify-content-end gap-2 mt-4">
                    <Button
                        label="Cancel"
                        icon="pi pi-times"
                        className="p-button-text"
                        onClick={() => setShowDialog(false)}
                    />
                    <Button
                        label="Save"
                        icon="pi pi-check"
                        className="p-button-primary"
                        onClick={saveCourse}
                    />
                </div>
            </Dialog>
        </div>
    );
}
