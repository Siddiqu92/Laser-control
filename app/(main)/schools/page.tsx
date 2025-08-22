"use client";

import { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { ApiService } from "@/service/api";

interface School {
    id: number;
    name: string;
    province: string;
    city: string;
    zip_code: string;
    street_address: string;
    is_deleted: boolean;
}

export default function SchoolsPage() {
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const [schools, setSchools] = useState<School[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // dialog states
    const [showDialog, setShowDialog] = useState<boolean>(false);
    const [formData, setFormData] = useState<Partial<School>>({
        name: "",
        province: "",
        city: "",
        zip_code: "",
        street_address: "",
        is_deleted: false,
    });

    useEffect(() => {
        const fetchSchools = async () => {
            try {
                const data = await ApiService.getSchools();
                setSchools(data);
            } catch (error) {
                console.error("Error fetching schools:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSchools();
    }, []);

    const statusTemplate = (rowData: School) => {
        return (
            <Tag
                value={rowData.is_deleted ? "Inactive" : "Active"}
                severity={rowData.is_deleted ? "danger" : "success"}
            />
        );
    };

    const actionTemplate = (rowData: School) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-pencil"
                    className="p-button-sm p-button-rounded p-button-warning"
                />
                <Button
                    icon="pi pi-trash"
                    className="p-button-sm p-button-rounded p-button-danger"
                />
            </div>
        );
    };

    // Handle form input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // // Submit form
    // const handleSubmit = async () => {
    //     try {
    //         // call API to save school
    //         await ApiService.createSchool(formData);
    //         setSchools((prev) => [...prev, { ...(formData as School), id: Date.now() }]); // fake ID for UI
    //         setShowDialog(false);
    //         setFormData({
    //             name: "",
    //             province: "",
    //             city: "",
    //             zip_code: "",
    //             street_address: "",
    //             is_deleted: false,
    //         });
    //     } catch (error) {
    //         console.error("Error adding school:", error);
    //     }
    // };

    return (
        <div className="layout-main">
            {/* Page Header */}
            <div className="flex justify-content-between align-items-center mb-4">
                <div>
                    <span className="text-600">Manage all registered schools in the system</span>
                </div>
                <Button
                    label="Add New School"
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
                    loading={loading}
                >
                    <Column field="name" header="School Name" sortable />
                    <Column field="province" header="Province" sortable />
                    <Column field="city" header="City" sortable />
                    <Column field="zip_code" header="Zip Code" sortable />
                    <Column field="street_address" header="Street Address" sortable />
                    <Column header="Status" body={statusTemplate} sortable />
                    <Column
                        header="Actions"
                        body={actionTemplate}
                        style={{ width: "150px" }}
                    />
                </DataTable>
            </div>

            {/* Add School Dialog */}
            <Dialog
                header="Add New School"
                visible={showDialog}
                style={{ width: "40vw" }}
                modal
                onHide={() => setShowDialog(false)}
            >
                <div className="p-fluid grid">
                    <div className="col-12">
                        <label htmlFor="name">School Name</label>
                        <InputText id="name" name="name" value={formData.name} onChange={handleChange} />
                    </div>
                    <div className="col-6">
                        <label htmlFor="province">Province</label>
                        <InputText id="province" name="province" value={formData.province} onChange={handleChange} />
                    </div>
                    <div className="col-6">
                        <label htmlFor="city">City</label>
                        <InputText id="city" name="city" value={formData.city} onChange={handleChange} />
                    </div>
                    <div className="col-6">
                        <label htmlFor="zip_code">Zip Code</label>
                        <InputText id="zip_code" name="zip_code" value={formData.zip_code} onChange={handleChange} />
                    </div>
                    <div className="col-6">
                        <label htmlFor="street_address">Street Address</label>
                        <InputText id="street_address" name="street_address" value={formData.street_address} onChange={handleChange} />
                    </div>
                </div>

                <div className="flex justify-content-end gap-2 mt-4">
                    <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={() => setShowDialog(false)} />
                    {/* <Button label="Save" icon="pi pi-check" className="p-button-primary" onClick={handleSubmit} /> */}
                </div>
            </Dialog>
        </div>
    );
}
