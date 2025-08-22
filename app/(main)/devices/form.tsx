"use client";

import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

interface DeviceFormProps {
    visible: boolean;
    onHide: () => void;
    onSubmit: (data: any) => void;
    loading?: boolean;
}

export default function DeviceForm({ visible, onHide, onSubmit, loading }: DeviceFormProps) {
    const [formData, setFormData] = useState({
        student_roll_no: "",
        student_name: "",
        student_grade: "",
        os: "",
        os_version: "",
        model: "",
        ip_address: "",
        battery_level: "",
        device_status: "Connected",
    });

    const statusOptions = [
        { label: "Connected", value: "Connected" },
        { label: "Disconnected", value: "Disconnected" },
        { label: "Unknown", value: "Unknown" },
    ];

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        onSubmit(formData);
    };

    const footer = (
        <div className="flex justify-content-end gap-2">
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={onHide} />
            <Button label="Save" icon="pi pi-check" onClick={handleSubmit} loading={loading} />
        </div>
    );

    return (
        <Dialog
            header="Add New Device"
            visible={visible}
            style={{ width: "500px" }}
            modal
            onHide={onHide}
            footer={footer}
        >
            <div className="p-fluid grid">
                <div className="col-12 md:col-6">
                    <label>Roll No</label>
                    <InputText value={formData.student_roll_no} onChange={(e) => handleChange("student_roll_no", e.target.value)} />
                </div>
                <div className="col-12 md:col-6">
                    <label>Student Name</label>
                    <InputText value={formData.student_name} onChange={(e) => handleChange("student_name", e.target.value)} />
                </div>
                <div className="col-12 md:col-6">
                    <label>Grade</label>
                    <InputText value={formData.student_grade} onChange={(e) => handleChange("student_grade", e.target.value)} />
                </div>
                <div className="col-12 md:col-6">
                    <label>Device Model</label>
                    <InputText value={formData.model} onChange={(e) => handleChange("model", e.target.value)} />
                </div>
                <div className="col-12 md:col-6">
                    <label>OS</label>
                    <InputText value={formData.os} onChange={(e) => handleChange("os", e.target.value)} />
                </div>
                <div className="col-12 md:col-6">
                    <label>OS Version</label>
                    <InputText value={formData.os_version} onChange={(e) => handleChange("os_version", e.target.value)} />
                </div>
                <div className="col-12 md:col-6">
                    <label>IP Address</label>
                    <InputText value={formData.ip_address} onChange={(e) => handleChange("ip_address", e.target.value)} />
                </div>
                <div className="col-12 md:col-6">
                    <label>Battery Level</label>
                    <InputText value={formData.battery_level} onChange={(e) => handleChange("battery_level", e.target.value)} />
                </div>
                <div className="col-12">
                    <label>Status</label>
                    <Dropdown
                        value={formData.device_status}
                        options={statusOptions}
                        onChange={(e) => handleChange("device_status", e.value)}
                        placeholder="Select Status"
                        className="w-full"
                    />
                </div>
            </div>
        </Dialog>
    );
}
