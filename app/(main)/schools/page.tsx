"use client";

import { useState } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import AppBreadCrumb from "@/layout/AppBreadCrumb";

interface School {
    id: number;
    name: string;
    location: string;
    students: number;
    status: "Active" | "Inactive";
}

export default function SchoolsPage() {
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const [schools] = useState<School[]>([
        { id: 1, name: "City Grammar School", location: "Lahore", students: 500, status: "Active" },
        { id: 2, name: "Beaconhouse School", location: "Karachi", students: 650, status: "Active" },
        { id: 3, name: "Roots International", location: "Islamabad", students: 400, status: "Inactive" },
    ]);

    const statusTemplate = (rowData: School) => {
        return (
            <Tag
                value={rowData.status}
                severity={rowData.status === "Active" ? "success" : "danger"}
            />
        );
    };

    const actionTemplate = (rowData: School) => {
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
                 
                    <span className="text-600">Manage all registered schools in the system</span>
                </div>
                <Button label="Add New School" icon="pi pi-plus" className="p-button-primary" />
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
                            placeholder="Search schools..."
                            className="w-full"
                        />
                    </span>
                </div>

                {/* DataTable */}
                <DataTable
                    value={schools}
                    paginator
                    rows={5}
                    dataKey="id"
                    globalFilter={globalFilter}
                    emptyMessage="No schools found."
                    className="p-datatable-sm"
                >
                    <Column field="name" header="School Name" sortable />
                    <Column field="location" header="Location" sortable />
                    <Column field="students" header="Students" sortable />
                    <Column field="status" header="Status" body={statusTemplate} sortable />
                    <Column header="Actions" body={actionTemplate} style={{ width: "150px" }} />
                </DataTable>
            </div>
        </div>
    );
}
