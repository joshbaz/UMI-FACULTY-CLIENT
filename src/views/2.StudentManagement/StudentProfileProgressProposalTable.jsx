import React, { useState, useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  getFilteredRowModel,
  createColumnHelper,
} from "@tanstack/react-table";
import { useNavigate, useParams } from "react-router-dom";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Icon } from "@iconify-icon/react";
// import { useGetStudentProposals } from "../../store/tanstackStore/services/queries";

const StudentProfileProgressProposalTable = ({
  setIsStatusDrawerOpen,
  setSelectedStatus,
  studentId,
  proposals,
  isLoadingProposals,
}) => {
  let { id } = useParams();
  const navigate = useNavigate();
  const [globalFilter, setGlobalFilter] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
//   const { data: proposals, isLoading: isLoadingProposals } = useGetStudentProposals(id);

  const columnHelper = createColumnHelper();

  const handleStatusClick = useCallback((rowData) => {
    setSelectedStatus(rowData);
    setIsStatusDrawerOpen(true);
  }, [setSelectedStatus, setIsStatusDrawerOpen]);

  const handleSubmitProposal = useCallback(() => {
    navigate(`/students/submit-proposal/${studentId}`);
  }, [navigate, studentId]);

  const handleFilterChange = useCallback((e) => {
    const value = e.target.value;
    setGlobalFilter(value);
  }, []);

  const fuzzyFilter = useCallback((row, columnId, value) => {
    const getValue = (obj, path) => {
      const parts = path.split('.');
      let current = obj;
      for (const part of parts) {
        if (current == null) return '';
        current = current[part];
      }
      return current;
    };

    const searchValue = value.toLowerCase();
    const cellValue = String(getValue(row.original, columnId) || '').toLowerCase();
    return cellValue.includes(searchValue);
  }, []);

  const columns = useMemo(() => [
    columnHelper.accessor("title", {
      header: "Title",
      cell: (info) => (
        <span className="whitespace-normal break-words max-w-[200px] line-clamp-4">
          {info.getValue() || "Untitled"}
        </span>
      ),
    }),
    columnHelper.accessor("statuses", {
      header: "Status",
      cell: (info) => {
        const statuses = info.getValue();
        const currentStatus = statuses?.length > 0 ? statuses[statuses.length - 1] : null;
        const statusName = currentStatus?.definition?.name || 'PENDING';
        
        return (
          <span
            style={{
              color: currentStatus?.definition?.color || '#000',
              backgroundColor: `${currentStatus?.definition?.color}18` || '#00000018',
              border: `1px solid ${currentStatus?.definition?.color || '#000'}`,
              padding: '0.25rem 0.5rem',
              borderRadius: '0.375rem',
              display: 'inline-block'
            }}
            className="capitalize"
          >
            {statusName}
          </span>
        );
      },
    }),
    columnHelper.accessor("submissionDate", {
      header: "Submitted",
      cell: (info) =>
        info.getValue() ? new Date(info.getValue()).toLocaleDateString() : "-",
    }),
    columnHelper.accessor("defenseDate", {
      header: "Defense",
      cell: (info) =>
        info.getValue() ? new Date(info.getValue()).toLocaleDateString() : "-",
    }),
    columnHelper.accessor("gradedAt", {
      header: "Graded",
      cell: (info) =>
        info.getValue() ? new Date(info.getValue()).toLocaleDateString() : "-",
    }),
    columnHelper.accessor("grade", {
      header: "Grade",
      cell: (info) => (
        <span className="font-medium">{info.getValue() || "Not graded"}</span>
      ),
    }),
    columnHelper.accessor("submittedBy", {
      header: "Submitted By",
      cell: (info) => {
        const submittedBy = info.row.original.submittedBy;
        return (
          <div className="flex items-center gap-1">
            <span>{submittedBy?.name || "-"}</span>
            {submittedBy && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Icon
                      icon="tdesign:info-circle-filled"
                      className="w-4 h-4 text-gray-400"
                    />
                  </TooltipTrigger>
                  <TooltipContent>{submittedBy.email}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor("id", {
      header: "",
      cell: (info) => (
        <button
          onClick={() => handleStatusClick(info.row.original)}
          className="rounded border text-gray-700 border-semantic-bg-border shadow-sm py-1 px-2 hover:bg-gray-50 font-[Roboto-Medium] text-sm"
        >
          Open
        </button>
      ),
    }),
  ], [handleStatusClick]);

  const table = useReactTable({
    data: proposals || [],
    columns,
    state: {
      globalFilter,
      pagination: {
        pageSize,
        pageIndex,
      },
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoadingProposals) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Loading proposals...</p>
      </div>
    );
  }

  if (!proposals || proposals?.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 mb-3">Proposal Not Submitted</p>
        <button onClick={handleSubmitProposal} className="px-4 py-2 bg-[#23388F] text-white text-sm font-medium rounded-lg hover:bg-blue-700">
          Submit Proposal
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg px-2">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={handleFilterChange}
            placeholder="Search title..."
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={pageSize}
          onChange={e => table.setPageSize(Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {[10, 20, 30, 40, 50].map(size => (
            <option key={size} value={size}>
              Show {size}
            </option>
          ))}
        </select>
      </div>

      <table className="w-full ">
        <thead className="bg-[#f9fafd]">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-2 py-3 text-left text-[#111827] text-opacity-90 font-[Inter-SemiBold] text-sm"
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
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-2 py-2 whitespace-nowrap text-[#111827] font-[Inter-Regular] text-xs"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 bg-white">
        <div className="flex font-[Roboto-Regular] items-center text-sm text-gray-500">
          Showing{" "}
          <span className="font-[Roboto-Medium] mx-1">
            {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
          </span>
          to{" "}
          <span className="font-[Roboto-Medium] mx-1">
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getPrePaginationRowModel().rows.length
            )}
          </span>
          of{" "}
          <span className="font-[Roboto-Medium] mx-1">
            {table.getPrePaginationRowModel().rows.length}
          </span>{" "}
          results
        </div>
        <div className="flex items-center gap-2">
          <button
            className="border border-gray-300 rounded p-1 font-[Roboto-Regular] text-sm disabled:opacity-50"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>
          {Array.from({ length: table.getPageCount() }, (_, i) => i + 1).map(
            (pageNumber) => (
              <button
                key={pageNumber}
                className={`w-8 h-8 rounded text-sm ${
                  pageNumber === table.getState().pagination.pageIndex + 1
                    ? "bg-blue-50 text-blue-600 font-[Roboto-Medium]"
                    : "text-gray-500"
                }`}
                onClick={() => table.setPageIndex(pageNumber - 1)}
              >
                {pageNumber}
              </button>
            )
          )}
          <button
            className="border border-gray-300 rounded p-1 font-[Roboto-Regular] text-sm disabled:opacity-50"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default React.memo(StudentProfileProgressProposalTable);