import { useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { FiSearch } from "react-icons/fi";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip";
  import { Icon } from "@iconify-icon/react";


const SearchBar = ({ value, onChange, placeholder = "Search" }) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <FiSearch className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        placeholder={placeholder}
      />
    </div>
  );
};

const FacultyTable = ({
  globalFilter,
  setGlobalFilter,
  columnVisibility,
  setColumnVisibility,
  data,
}) => {
  const [pageSize, setPageSize] = useState(() => {
    const savedPageSize = localStorage.getItem("schoolTablePageSize");
    return savedPageSize ? parseInt(savedPageSize) : 10;
  });
  const [pageIndex, setPageIndex] = useState(() => {
    const savedPageIndex = localStorage.getItem("schoolTablePageIndex");
    return savedPageIndex ? parseInt(savedPageIndex) : 0;
  });
  



  useEffect(() => {
    setPageIndex(0);
  }, [data]);

 

 

  // Set initial column visibility
  const defaultColumnVisibility = {
    fullname: true,
    email: true,
    schoolCode: true,
    facultyType: true,
    campus: true,
    actions: true,
  };

  // Use the provided columnVisibility or default to all visible
  const effectiveColumnVisibility = columnVisibility || defaultColumnVisibility;

  const columns = [
      {
        accessorKey: 'name',
        header: () => <span className="text-sm">Fullname</span>,
        cell: info => <div className="text-sm">{info.getValue()}</div>
      },
      {
        accessorKey: 'workEmail',
        header: () => <span className="text-sm">Email Address</span>,
        cell: info => <div className="text-sm">{info.getValue()}</div>
      },
      {
        accessorKey: 'schoolCode',
        header: () => <span className="text-sm">School Code</span>,
        cell: info => <div className="text-sm flex flex-row text-center items-center gap-1 justify-start"> <span>{info.row.original.school.code}</span>   <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Icon
              icon="tdesign:info-circle-filled"
              className="w-4 h-4 mt-1 text-gray-400"
            />
          </TooltipTrigger>
          <TooltipContent>{info.row.original.school.name}</TooltipContent>
        </Tooltip>
      </TooltipProvider></div>
      },
      {
        accessorKey: 'facultyType',
        header: () => <span className="text-sm">Role</span>,
        cell: info => (
          <div className="inline-flex h-hug24px rounded-sm border py-[4px] px-[9px] bg-accent2-300 items-center justify-center whitespace-nowrap text-sm capitalize">
            {info.getValue()}
          </div>
        )
      },
     
      {
        accessorKey: 'campus',
        header: () => <span className="text-sm">Campus</span>,
        cell: info => (
          <div className="inline-flex rounded-md py-[4px] px-[9px]  items-center justify-center whitespace-nowrap text-sm capitalize">
            {info.row.original.campus.name}
          </div>
        )
      },
      {
        id: 'actions',
        header: () => <span className="text-sm"> </span>,
        cell: info => (
            <>
            {
                info.row.original.facultyType === 'supervisor' ? ( <Link 
                    to={`/faculty/supervisor/profile/${info.row.original.id}`}
                    className="rounded border border-semantic-bg-border shadow-sm py-[4px] px-[8px] hover:bg-gray-50 text-sm"
                  >
                        Open
                  </Link>): (
                    <Link 
                    to={`/faculty/profile/${info.row.original.id}`}
                    className="rounded border border-semantic-bg-border shadow-sm py-[4px] px-[8px] hover:bg-gray-50 text-sm"
                  >
                        Open
                  </Link>
                )
            }
            </>
         
        )
      }
  ];

  const table = useReactTable({
    data: data || [], // Data is already filtered by campus in SchoolManagement component
    columns,
    state: {
      globalFilter,
      columnVisibility: effectiveColumnVisibility,
      pagination: {
        pageSize,
        pageIndex,
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({
          pageIndex,
          pageSize,
        });
        setPageIndex(newState.pageIndex);
        setPageSize(newState.pageSize);
        localStorage.setItem(
          "schoolTablePageIndex",
          newState.pageIndex.toString()
        );
        localStorage.setItem(
          "schoolTablePageSize",
          newState.pageSize.toString()
        );
      }
    },
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  return (
    <div className="bg-white rounded-lg shadow-sm">
     

      {/* Table Controls */}
      <div className="p-4 flex justify-between items-center border-b">
        <div className="w-[240px]">
          <SearchBar
            value={globalFilter ?? ""}
            onChange={(value) => setGlobalFilter(String(value))}
            placeholder="Search by Name"
          />
        </div>
        <div className="flex items-center gap-4">
          {/* <SchoolTablePageSize
          pageSize={pageSize}
          setPageSize={setPageSize}
          setPageIndex={setPageIndex}
        /> */}
          <div className="flex items-center gap-4">
        

            <Link
              to="/faculty/supervisor/add"
              className="inline-flex items-center px-4 py-2 bg-[#27357E] text-white rounded-lg text-sm font-medium hover:bg-[#1F2861]"
            >
              Add Supervisor
              <span className="ml-2">+</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Table Structure */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-4 text-left text-xs font-bold  text-[#111827] capitalize tracking-wider bg-gray-50"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
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
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-2 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 bg-white">
      <div className="flex items-center text-sm text-gray-500">
        Showing{' '}
        <span className="font-medium mx-1">
          {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
        </span>
        to{' '}
        <span className="font-medium mx-1">
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getPrePaginationRowModel().rows.length
          )}
        </span>
        of{' '}
        <span className="font-medium mx-1">{table.getPrePaginationRowModel().rows.length}</span>{' '}
        results
      </div>
      <div className="flex items-center gap-2">
        <button
          className="border rounded p-1 text-sm disabled:opacity-50"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </button>
        {Array.from({ length: table.getPageCount() }, (_, i) => i + 1).map(pageNumber => (
          <button
            key={pageNumber}
            className={`w-8 h-8 rounded text-sm ${
              pageNumber === table.getState().pagination.pageIndex + 1
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'text-gray-500'
            }`}
            onClick={() => table.setPageIndex(pageNumber - 1)}
          >
            {pageNumber}
          </button>
        ))}
        <button
          className="border rounded p-1 text-sm disabled:opacity-50"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </button>
      </div>
    </div>

    </div>
  );
};

export default FacultyTable;
