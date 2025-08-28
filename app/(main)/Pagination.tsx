import React from "react";
import { Paginator, PaginatorPageChangeEvent } from "primereact/paginator";

interface PaginationProps {
  first: number;
  rows: number;
  totalRecords: number;
  onPageChange: (event: PaginatorPageChangeEvent) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  first,
  rows,
  totalRecords,
  onPageChange,
}) => {
  const startItem = Math.min(first + 1, totalRecords);
  const endItem = Math.min(first + rows, totalRecords);

  return (
    <div className="flex align-items-center justify-content-center gap-4 mt-4">
      {/* Showing text */}
      <div className="text-gray-700 text-lm font-medium">
        Showing {startItem} to {endItem} of {totalRecords} students
      </div>

      {/* Paginator */}
      <Paginator
        first={first}
        rows={rows}
        totalRecords={totalRecords}
        onPageChange={onPageChange}
        rowsPerPageOptions={[5, 10, 25, 50]}
        template={{
          layout:
            "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown",
        }}
        pageLinkSize={3} 
      />
    </div>
  );
};
