"use client";

import { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { Tag } from "primereact/tag";
import { InputTextarea } from "primereact/inputtextarea";
import { Toast } from "primereact/toast";
import api from "@/service/api";

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

    // Add Program Dialog
    const [showDialog, setShowDialog] = useState(false);
    const [newProgram, setNewProgram] = useState<Partial<ProgramOfStudy>>({
        name: "",
        description: "",
        type: "",
        status: "Active",
    });

    const statusOptions = [
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "Inactive" },
    ];

    const typeOptions = [
        { label: "Undergraduate", value: "Undergraduate" },
        { label: "Postgraduate", value: "Postgraduate" },
        { label: "Diploma", value: "Diploma" },
    ];

    // Fetch API data
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

    // Submit new program
    const handleAddProgram = async () => {
        try {
            const res = await api.post("/items/program_of_study", newProgram);
            setPrograms([...programs, res.data.data]);
            setShowDialog(false);
            setNewProgram({ name: "", description: "", type: "", status: "Active" });
        } catch (error) {
            console.error("Failed to add program:", error);
        }
    };

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
                <Button
                    label="Add New Program"
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
                    <Column field="type" header="Type" style={{ width: "150px" }} />
                    <Column header="Status" body={statusTemplate} style={{ width: "120px" }} sortable />
                    <Column header="Actions" body={actionTemplate} style={{ width: "150px" }} />
                </DataTable>
            </div>

            {/* Add New Program Dialog */}
            <Dialog
                header="Add New Program"
                visible={showDialog}
                style={{ width: "500px" }}
                modal
                onHide={() => setShowDialog(false)}
                footer={
                    <div className="flex justify-end gap-2">
                        <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={() => setShowDialog(false)} />
                        <Button label="Save" icon="pi pi-check" className="p-button-primary" onClick={handleAddProgram} />
                    </div>
                }
            >
                <div className="flex flex-column gap-3">
                    <div>
                        <label className="block mb-2">Program Name</label>
                        <InputText
                            value={newProgram.name}
                            onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })}
                            placeholder="Enter program name"
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label className="block mb-2">Description</label>
                        <InputTextarea
                            value={newProgram.description || ""}
                            onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
                            placeholder="Enter description"
                            className="w-full"
                            rows={3}
                        />
                    </div>
                    <div>
                        <label className="block mb-2">Type</label>
                        <Dropdown
                            value={newProgram.type}
                            options={typeOptions}
                            onChange={(e) => setNewProgram({ ...newProgram, type: e.value })}
                            placeholder="Select type"
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label className="block mb-2">Status</label>
                        <Dropdown
                            value={newProgram.status}
                            options={statusOptions}
                            onChange={(e) => setNewProgram({ ...newProgram, status: e.value })}
                            className="w-full"
                        />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
