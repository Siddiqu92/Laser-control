"use client";

import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Card } from "primereact/card";

interface SchoolFormData {
  name: string;
  code: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  principal: string;
  level: string;
}

export default function AddSchoolForm() {
  const [formData, setFormData] = useState<SchoolFormData>({
    name: "",
    code: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    principal: "",
    level: "",
  });

  const [loading, setLoading] = useState(false);

  const levels = [
    { label: "Primary", value: "primary" },
    { label: "Secondary", value: "secondary" },
    { label: "Higher Secondary", value: "higher_secondary" },
    { label: "University", value: "university" },
  ];

  const handleChange = (field: keyof SchoolFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 🔹 Replace this with your actual API call
      console.log("Submitting school data:", formData);

      // Example:
      // await api.post("/school", formData);

      setLoading(false);
      alert("School added successfully!");
      setFormData({
        name: "",
        code: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        country: "",
        principal: "",
        level: "",
      });
    } catch (error) {
      console.error("Error adding school:", error);
      setLoading(false);
    }
  };

  return (
    <div className="layout-main">
      <Card title="Add New School" className="shadow-2 p-4">
        <div className="grid formgrid p-fluid">
          {/* School Name */}
          <div className="col-12 md:col-6 mb-3">
            <label htmlFor="name">School Name</label>
            <InputText
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter school name"
            />
          </div>

          {/* School Code */}
          <div className="col-12 md:col-6 mb-3">
            <label htmlFor="code">School Code</label>
            <InputText
              id="code"
              value={formData.code}
              onChange={(e) => handleChange("code", e.target.value)}
              placeholder="Enter school code"
            />
          </div>

          {/* Email */}
          <div className="col-12 md:col-6 mb-3">
            <label htmlFor="email">Email</label>
            <InputText
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="Enter school email"
            />
          </div>

          {/* Phone */}
          <div className="col-12 md:col-6 mb-3">
            <label htmlFor="phone">Phone</label>
            <InputText
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="Enter school phone"
            />
          </div>

          {/* Principal */}
          <div className="col-12 md:col-6 mb-3">
            <label htmlFor="principal">Principal</label>
            <InputText
              id="principal"
              value={formData.principal}
              onChange={(e) => handleChange("principal", e.target.value)}
              placeholder="Enter principal name"
            />
          </div>

          {/* Level */}
          <div className="col-12 md:col-6 mb-3">
            <label htmlFor="level">Level</label>
            <Dropdown
              id="level"
              value={formData.level}
              options={levels}
              onChange={(e) => handleChange("level", e.value)}
              placeholder="Select school level"
            />
          </div>

          {/* City */}
          <div className="col-12 md:col-6 mb-3">
            <label htmlFor="city">City</label>
            <InputText
              id="city"
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
              placeholder="Enter city"
            />
          </div>

          {/* Country */}
          <div className="col-12 md:col-6 mb-3">
            <label htmlFor="country">Country</label>
            <InputText
              id="country"
              value={formData.country}
              onChange={(e) => handleChange("country", e.target.value)}
              placeholder="Enter country"
            />
          </div>

          {/* Address */}
          <div className="col-12 mb-3">
            <label htmlFor="address">Address</label>
            <InputTextarea
              id="address"
              rows={3}
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Enter full school address"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-content-end mt-3">
          <Button
            label="Save School"
            icon="pi pi-check"
            className="p-button-success"
            onClick={handleSubmit}
            loading={loading}
          />
        </div>
      </Card>
    </div>
  );
}
