"use client";

import { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import AppBreadCrumb from "@/layout/AppBreadCrumb";
import api from "@/service/api"; 
import TeacherForm from "./form";

interface Teacher {
    id: string;
    name: string;
    email?: string;
    subject?: string;
}

export default function TeachersPage() {
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showForm, setShowForm] = useState(false); 

    // API call to fetch teachers
    const getTeachers = async () => {
        try {
            const res = await api.get(
                `/users?fields[]=id&fields[]=first_name&fields[]=last_name&filter[_and][0][role][name][_contains]=teacher`
            );

            const data = res.data.data.map((t: any) => ({
                id: t.id,
                name: `${t.first_name} ${t.last_name}`,
                email: t.email ?? "-",
                subject: t.subject ?? "-", 
            }));

            setTeachers(data);
        } catch (error) {
            console.error("Failed to fetch teachers:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getTeachers();
    }, []);

    const actionTemplate = (rowData: Teacher) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-pencil" className="p-button-sm p-button-rounded p-button-warning" />
                <Button icon="pi pi-trash" className="p-button-sm p-button-rounded p-button-danger" />
            </div>
        );
    };

    // handle new teacher submission
    const handleAddTeacher = async (teacher: any) => {
        try {
            // call API to save teacher
            await api.post("/users", {
                first_name: teacher.first_name,
                last_name: teacher.last_name,
                email: teacher.email,
                subject: teacher.subject,
                role: "teacher"
            });
            getTeachers(); // refresh list
        } catch (error) {
            console.error("Failed to add teacher:", error);
        }
    };

    return (
        <div className="layout-main">
            {/* Page Header */}
            <div className="flex justify-content-between align-items-center mb-4">
                <div>
                    <span className="text-600">Manage all registered teachers in the system</span>
                </div>
                <Button 
                    label="Add New Teacher" 
                    icon="pi pi-plus" 
                    className="p-button-primary" 
                    onClick={() => setShowForm(true)} 
                />
            </div>

            {/* Teacher Form Dialog */}
            <TeacherForm 
                visible={showForm} 
                onHide={() => setShowForm(false)} 
                onSubmit={handleAddTeacher} 
            />

            {/* Card with Table */}
            <div className="surface-card p-4 border-round shadow-2">
                {/* Search Bar */}
                <div className="flex justify-content-end mb-3">
                    <span className="p-input-icon-left w-full md:w-20rem">
                        <i className="pi pi-search" />
                        <InputText
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Search teachers..."
                            className="w-full"
                        />
                    </span>
                </div>

                {/* DataTable */}
                <DataTable
                    value={teachers}
                    paginator
                    rows={5}
                    loading={loading}
                    dataKey="id"
                    globalFilter={globalFilter}
                    emptyMessage="No teachers found."
                    className="p-datatable-sm"
                >
                    <Column field="name" header="Name" sortable />
                    <Column field="subject" header="Subject" sortable />
                    <Column field="email" header="Email" sortable />
                    <Column header="Actions" body={actionTemplate} style={{ width: "150px" }} />
                </DataTable>
            </div>
        </div>
    );
}
