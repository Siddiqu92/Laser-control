"use client";

import { useState } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import AppBreadCrumb from "@/layout/AppBreadCrumb";

interface Device {
    id: number;
    name: string;
    type: string;
    assignedTo: string;
    status: "Available" | "In Use" | "Under Maintenance";
}

export default function DevicesPage() {
    const [globalFilter, setGlobalFilter] = useState<string>("");

    const [devices] = useState<Device[]>([
        {
            id: 1,
            name: "Dell Latitude 5420",
            type: "Laptop",
            assignedTo: "John Doe",
            status: "In Use",
        },
        {
            id: 2,
            name: "Epson EB-X41",
            type: "Projector",
            assignedTo: "Library",
            status: "Available",
        },
        {
            id: 3,
            name: "iPad Pro 12.9",
            type: "Tablet",
            assignedTo: "Sarah Smith",
            status: "In Use",
        },
        {
            id: 4,
            name: "HP LaserJet Pro",
            type: "Printer",
            assignedTo: "Admin Office",
            status: "Under Maintenance",
        },
    ]);

    // Status badge template
    const statusTemplate = (rowData: Device) => {
        let severity: "success" | "warning" | "danger" = "success";
        if (rowData.status === "In Use") severity = "warning";
        if (rowData.status === "Under Maintenance") severity = "danger";

        return <Tag value={rowData.status} severity={severity} />;
    };

    // Actions column
    const actionTemplate = (rowData: Device) => {
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
                  
                    <span className="text-600">Manage all devices assigned within the school system</span>
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
                    <Column field="id" header="Device ID" sortable style={{ width: "120px" }} />
                    <Column field="name" header="Device Name" sortable style={{ minWidth: "200px" }} />
                    <Column field="type" header="Type" sortable style={{ minWidth: "150px" }} />
                    <Column field="assignedTo" header="Assigned To" sortable style={{ minWidth: "180px" }} />
                    <Column header="Status" body={statusTemplate} sortable style={{ width: "160px" }} />
                    <Column header="Actions" body={actionTemplate} style={{ width: "150px" }} />
                </DataTable>
            </div>
        </div>
    );
}
