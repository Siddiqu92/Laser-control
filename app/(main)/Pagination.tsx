"use client";
import { Paginator } from "primereact/paginator";

interface PaginationProps {
  first: number;
  rows: number;
  totalRecords: number;
  onPageChange: (e: any) => void;
}

export default function Pagination({ first, rows, totalRecords, onPageChange }: PaginationProps) {
  return (
    <div className="mt-4">
      <Paginator
        first={first}
        rows={rows}
        totalRecords={totalRecords}
        rowsPerPageOptions={[5, 10, 20, 50]}
        onPageChange={onPageChange}
        template={{
          layout: "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown",
        }}
      />
    </div>
  );
}
