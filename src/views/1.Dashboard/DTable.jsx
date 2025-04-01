import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
  } from "@tanstack/react-table";
  import { useState } from "react";
  import { ChevronDown, Plus } from "lucide-react";
  
  const dataTable = [
    { id: 1, fullname: "Joshua Kimbareeba", campus: "Kampala", category: "Masters", status: "Under Examination" },
 
  ];
  
  const columns = [
    { accessorKey: "fullname", header: "Fullname" },
    { accessorKey: "campus", header: "Campus" },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-md ${
            row.original.category === "PhD"
              ? "bg-yellow-200 text-yellow-800"
              : "bg-orange-200 text-orange-800"
          }`}
        >
          {row.original.category}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: () => (
        <span className="px-2 py-1 text-xs font-semibold rounded-md border border-gray-400 text-gray-700">
          Under Examination
        </span>
      ),
    },
  ];
  
  const DTable = () => {
    const [data] = useState(dataTable);
  
    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
    });
  
    return (
      <div className="bg-white w-full p-4 rounded-lg shadow-md">
        {/* Header */}
        <div className="flex flex-col space-y-2 mb-2">
          <h2 className="text-lg font-semibold">Recently Added</h2>
          <div className="flex justify-between items-center mb-3">
            <div className="flex gap-2">
              <button className="bg-[#23388F] text-white px-3 py-1 rounded-md text-sm flex items-center">
                View More <ChevronDown size={14} className="ml-1" />
              </button>
              <button className="bg-gray-200 px-3 py-1 rounded-md text-sm flex items-center">
                Add Student <Plus size={14} className="ml-1" />
              </button>
            </div>
          </div>
        </div>
  
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {/* Header Row */}
            <thead className="bg-gray-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-300">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="p-3 text-left text-sm font-semibold"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
  
            {/* Table Body */}
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-gray-300 hover:bg-gray-50 text-sm">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  export default DTable;
  