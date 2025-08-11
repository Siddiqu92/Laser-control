"use client";

import { useState } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import AppBreadCrumb from "@/layout/AppBreadCrumb";

interface Teacher {
    id: number;
    name: string;
    subject: string;
    email: string;
}

export default function TeachersPage() {
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const [teachers] = useState<Teacher[]>([
        { id: 1, name: "John Doe", subject: "Mathematics", email: "john@example.com" },
        { id: 2, name: "Sarah Smith", subject: "Science", email: "sarah@example.com" },
        { id: 3, name: "David Johnson", subject: "English", email: "david@example.com" },
        { id: 4, name: "Emily Brown", subject: "Computer Science", email: "emily@example.com" },
    ]);

    const actionTemplate = (rowData: Teacher) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-pencil" className="p-button-sm p-button-rounded p-button-warning" />
                <Button icon="pi pi-trash" className="p-button-sm p-button-rounded p-button-danger" />
            </div>
        );
    };

    return (
        <div className="layout-main">
            {/* Page Header */}
            <div className="flex justify-content-between align-items-center mb-4">
                <div>
                    <span className="text-600">Manage all registered teachers in the system</span>
                </div>
                <Button label="Add New Teacher" icon="pi pi-plus" className="p-button-primary" />
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
