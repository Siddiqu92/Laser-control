"use client";

import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import api from "@/service/api";

interface ProgramOfStudyFormProps {
    visible: boolean;
    onHide: () => void;
    onSave: () => void; // callback to refresh table after save
    editData?: {
        id?: number;
        name: string;
        description: string | null;
        type: string;
        status: string;
    } | null;
}

export default function ProgramOfStudyForm({ visible, onHide, onSave, editData }: ProgramOfStudyFormProps) {
    const [name, setName] = useState(editData?.name || "");
    const [description, setDescription] = useState(editData?.description || "");
    const [type, setType] = useState(editData?.type || "");
    const [status, setStatus] = useState(editData?.status || "Active");
    const [loading, setLoading] = useState(false);

    const typeOptions = [
        { label: "Undergraduate", value: "Undergraduate" },
        { label: "Postgraduate", value: "Postgraduate" },
        { label: "Diploma", value: "Diploma" },
    ];

    const statusOptions = [
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "Inactive" },
    ];

    // Save API call
    const handleSubmit = async () => {
        if (!name || !type) {
            alert("Please fill all required fields.");
            return;
        }

        setLoading(true);
        try {
            if (editData?.id) {
                // Update
                await api.patch(`/items/program_of_study/${editData.id}`, {
                    name,
                    description,
                    type,
                    status,
                });
            } else {
                // Create
                await api.post(`/items/program_of_study`, {
                    name,
                    description,
                    type,
                    status,
                });
            }
            onSave(); // refresh table
            onHide(); // close dialog
        } catch (error) {
            console.error("Failed to save program:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            header={editData ? "Edit Program of Study" : "Add New Program of Study"}
            visible={visible}
            style={{ width: "40vw" }}
            modal
            onHide={onHide}
        >
            <div className="p-fluid formgrid grid">
                {/* Program Name */}
                <div className="field col-12">
                    <label htmlFor="name">Program Name *</label>
                    <InputText
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter program name"
                        required
                    />
                </div>

                {/* Description */}
                <div className="field col-12">
                    <label htmlFor="description">Description</label>
                    <InputTextarea
                        id="description"
                        value={description || ""}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter program description"
                        rows={4}
                    />
                </div>

                {/* Type */}
                <div className="field col-12 md:col-6">
                    <label htmlFor="type">Type *</label>
                    <Dropdown
                        id="type"
                        value={type}
                        options={typeOptions}
                        onChange={(e) => setType(e.value)}
                        placeholder="Select type"
                    />
                </div>

                {/* Status */}
                <div className="field col-12 md:col-6">
                    <label htmlFor="status">Status</label>
                    <Dropdown
                        id="status"
                        value={status}
                        options={statusOptions}
                        onChange={(e) => setStatus(e.value)}
                        placeholder="Select status"
                    />
                </div>
            </div>

            <div className="flex justify-content-end gap-2 mt-4">
                <Button label="Cancel" className="p-button-text" onClick={onHide} />
                <Button label={editData ? "Update" : "Save"} icon="pi pi-check" loading={loading} onClick={handleSubmit} />
            </div>
        </Dialog>
    );
}

