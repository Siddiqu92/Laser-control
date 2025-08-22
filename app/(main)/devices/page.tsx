"use client";

import { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import api from "@/service/api"; 

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

    // Fetch devices
    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const res = await api.get("/items/device");
                setDevices(res.data.data);
            } catch (err) {
                console.error("Error fetching devices:", err);
            }
        };
        fetchDevices();
    }, []);

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
                    {/* <h2 className="m-0">Devices</h2> */}
                    <span className="text-600">Manage all devices connected to the school system</span>
                </div>
                <Button label="Add New Device" icon="pi pi-plus" className="p-button-primary" />
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
                    <Column field="student_roll_no" header="Roll No" sortable style={{ minWidth: "120px" }} />
                    <Column field="student_name" header="Student Name" sortable style={{ minWidth: "180px" }} />
                    <Column field="student_grade" header="Grade" sortable style={{ minWidth: "120px" }} />
                    <Column field="model" header="Device Model" sortable style={{ minWidth: "180px" }} />
                    <Column field="os" header="OS" sortable style={{ minWidth: "120px" }} />
                    <Column field="os_version" header="OS Version" sortable style={{ minWidth: "120px" }} />
                    <Column field="ip_address" header="IP Address" sortable style={{ minWidth: "150px" }} />
                    <Column field="battery_level" header="Battery (%)" sortable style={{ minWidth: "120px" }} />
                    <Column header="Status" body={statusTemplate} style={{ width: "150px" }} sortable />
                    <Column header="Actions" body={actionTemplate} style={{ width: "150px" }} />
                </DataTable>
            </div>
        </div>
    );
}
