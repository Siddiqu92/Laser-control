"use client";

import { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import api from "@/service/api";
import AppBreadCrumb from "@/layout/AppBreadCrumb";

interface ProgramOfStudy {
    id: number;
    name: string;
    description: string | null;
    status: string;
    type: string;
}

export default function ProgramsOfStudyPage() {
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const [programs, setPrograms] = useState<ProgramOfStudy[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // API call
    const getProgramsOfStudy = async () => {
        try {
            const res = await api.get(`/items/program_of_study`);
            setPrograms(res.data.data);
        } catch (error) {
            console.error("Failed to fetch programs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getProgramsOfStudy();
    }, []);

    // Status badge template
    const statusTemplate = (rowData: ProgramOfStudy) => {
        return (
            <Tag
                value={rowData.status}
                severity={rowData.status === "Active" ? "success" : "warning"}
            />
        );
    };

    // Action buttons template
    const actionTemplate = (rowData: ProgramOfStudy) => {
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
                    <span className="text-600">Manage all programs and their associated details</span>
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
                    loading={loading}
                    dataKey="id"
                    globalFilter={globalFilter}
                    emptyMessage="No programs found."
                    className="p-datatable-sm"
                >
                    <Column field="name" header="Program Name" sortable style={{ minWidth: "200px" }} />
                    <Column field="description" header="Description" style={{ minWidth: "250px" }} />
                    <Column field="type" header="Type" style={{ width: "120px" }} />
                    <Column header="Status" body={statusTemplate} style={{ width: "120px" }} sortable />
                    <Column header="Actions" body={actionTemplate} style={{ width: "150px" }} />
                </DataTable>
            </div>
        </div>
    );
}
