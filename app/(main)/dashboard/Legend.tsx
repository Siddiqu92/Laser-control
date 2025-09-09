import React from "react";

export const Legend = () => {
  return (
    <div className="flex gap-4">
      <div className="flex align-items-center gap-2">
        <span className="pi pi-check-circle text-green-500" style={{ fontSize: "1.1rem" }} />
        <span className="p-text-secondary text-sm">Completed</span>
      </div>
      <div className="flex align-items-center gap-2">
        <span
          style={{
            display: "inline-block",
            padding: "0.1rem 0.3rem",
            borderRadius: "4px",
            fontSize: "0.7rem",
            fontWeight: 600,
            background: "#fffbeb",
            color: "#d97706",
            border: "1px solid #d9770620",
            minWidth: "2rem",
            textAlign: "center",
          }}
        >
          50%
        </span>
        <span className="p-text-secondary text-sm">Attempted</span>
      </div>
      <div className="flex align-items-center gap-2">
        <span className="pi pi-times-circle text-red-500" style={{ fontSize: "1.1rem" }} />
        <span className="p-text-secondary text-sm">Not Started</span>
      </div>
    </div>
  );
};