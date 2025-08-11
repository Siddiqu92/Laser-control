"use client";

import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";

export default function SettingsPage() {
    const [schoolName, setSchoolName] = useState("Springfield High School");
    const [email, setEmail] = useState("info@springfieldhigh.edu");
    const [phone, setPhone] = useState("+1 (555) 123-4567");
    const [address, setAddress] = useState("742 Evergreen Terrace, Springfield");
    const [theme, setTheme] = useState("Light");

    const themeOptions = [
        { label: "Light", value: "Light" },
        { label: "Dark", value: "Dark" },
    ];

    const handleSave = () => {
        // TODO: Save logic here
        console.log("Settings saved:", { schoolName, email, phone, address, theme });
    };

    return (
        <div className="layout-main">
          
            <div className="flex justify-content-between align-items-center mb-4">
                <div>
             
                    <span className="text-600">Manage system and school configuration</span>
                </div>
            </div>

            {/* Settings Card */}
            <div className="surface-card p-4 border-round shadow-2">
                {/* General Settings */}
                <h3 className="mb-3 text-lg font-semibold text-900">General Settings</h3>
                <div className="grid formgrid p-fluid">
                    <div className="field col-12 md:col-6">
                        <label htmlFor="schoolName" className="font-medium mb-2 block">
                            School Name
                        </label>
                        <InputText
                            id="schoolName"
                            value={schoolName}
                            onChange={(e) => setSchoolName(e.target.value)}
                        />
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="email" className="font-medium mb-2 block">
                            Email
                        </label>
                        <InputText
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="phone" className="font-medium mb-2 block">
                            Phone
                        </label>
                        <InputText
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="address" className="font-medium mb-2 block">
                            Address
                        </label>
                        <InputText
                            id="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>
                </div>

                {/* Theme Settings */}
                <h3 className="mt-5 mb-3 text-lg font-semibold text-900">Theme Preferences</h3>
                <div className="grid formgrid p-fluid">
                    <div className="field col-12 md:col-6">
                        <label htmlFor="theme" className="font-medium mb-2 block">
                            Select Theme
                        </label>
                        <Dropdown
                            id="theme"
                            value={theme}
                            options={themeOptions}
                            onChange={(e) => setTheme(e.value)}
                            placeholder="Select Theme"
                        />
                    </div>
                </div>

                {/* Save Button */}
                <div className="mt-4">
                    <Button
                        label="Save Changes"
                        icon="pi pi-check"
                        className="p-button-primary"
                        onClick={handleSave}
                    />
                </div>
            </div>
        </div>
    );
}
