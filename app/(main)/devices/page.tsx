"use client";

import { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import api from "@/service/api"; 
import DeviceForm from "./form"; // 👈 import form

interface Device {
    id: number;
    student_roll_no: string;
    student_name: string;
    student_grade: string;
    os: string;
    os_version: string;
    model: string;
    ip_address: string;
    battery_level: string;
    device_status: string | null;
}

export default function DevicesPage() {
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const [devices, setDevices] = useState<Device[]>([]);
    const [formVisible, setFormVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    // Fetch devices
    useEffect(() => {
        fetchDevices();
    }, []);

    const fetchDevices = async () => {
        try {
            const res = await api.get("/items/device");
            setDevices(res.data.data);
        } catch (err) {
            console.error("Error fetching devices:", err);
        }
    };

    // Handle form submit
    const handleFormSubmit = async (data: any) => {
        try {
            setLoading(true);
            await api.post("/items/device", data);
            setFormVisible(false);
            fetchDevices(); // refresh
        } catch (err) {
            console.error("Error adding device:", err);
        } finally {
            setLoading(false);
        }
    };

    // Status badge template
    const statusTemplate = (rowData: Device) => {
        const status = rowData.device_status || "Unknown";
        let severity: "success" | "warning" | "danger" | "info" = "info";

        if (status === "Connected") severity = "success";
        else if (status === "Disconnected") severity = "danger";
        else if (status === null) severity = "warning";

        return <Tag value={status} severity={severity} />;
    };

    // Actions column
    const actionTemplate = () => {
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
                    <span className="text-600">Manage all devices connected to the school system</span>
                </div>
                <Button 
                    label="Add New Device" 
                    icon="pi pi-plus" 
                    className="p-button-primary" 
                    onClick={() => setFormVisible(true)} 
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
                            placeholder="Search devices..."
                            className="w-full"
                        />
                    </span>
                </div>

                {/* DataTable */}
                <DataTable
                    value={devices}
                    paginator
                    rows={5}
                    dataKey="id"
                    globalFilter={globalFilter}
                    emptyMessage="No devices found."
                    className="p-datatable-sm"
                >
                    <Column field="id" header="ID" sortable style={{ width: "80px" }} />
                    <Column field="student_roll_no" header="Roll No" sortable />
                    <Column field="student_name" header="Student Name" sortable />
                    <Column field="student_grade" header="Grade" sortable />
                    <Column field="model" header="Device Model" sortable />
                    <Column field="os" header="OS" sortable />
                    <Column field="os_version" header="OS Version" sortable />
                    <Column field="ip_address" header="IP Address" sortable />
                    <Column field="battery_level" header="Battery (%)" sortable />
                    <Column header="Status" body={statusTemplate} sortable />
                    <Column header="Actions" body={actionTemplate} />
                </DataTable>
            </div>

            {/* Device Form Modal */}
            <DeviceForm
                visible={formVisible}
                onHide={() => setFormVisible(false)}
                onSubmit={handleFormSubmit}
                loading={loading}
            />
        </div>
    );
}
