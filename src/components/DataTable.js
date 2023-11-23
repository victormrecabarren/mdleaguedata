import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { AgGridReact } from "ag-grid-react";

export const DataTable = ({ owners, columnDefs }) => {
  return <AgGridReact rowData={owners} columnDefs={columnDefs}></AgGridReact>;
};
