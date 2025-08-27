import React from "react";
import { Paginator } from "primereact/paginator";

interface PaginationProps {
  first: number;
  rows: number;
  totalRecords: number;
  onPageChange: (event: any) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  first,
  rows,
  totalRecords,
  onPageChange,
}) => {
  return (
    <div className="">
      <Paginator
        first={first}
        rows={rows} 
        totalRecords={totalRecords}
        rowsPerPageOptions={[5, 10, 25, 50]}
        onPageChange={onPageChange}
        template={{
          layout: "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown",
        }}
      />
    </div>
  );
};