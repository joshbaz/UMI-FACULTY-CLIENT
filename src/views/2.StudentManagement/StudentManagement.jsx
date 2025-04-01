import React, { useEffect, useMemo, useState } from "react";
import { useGetAllStudents } from "../../store/tanstackStore/services/queries";
import { Loader2, Search } from "lucide-react";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import StudentManagementTableTabs from "./StudentManagementTableTabs";
import StudentManagementTable from "./StudentManagementTable";

const StudentManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    localStorage.getItem("selectedCategory") || "All Students"
  );
  const [pageSize, setPageSize] = useState(
    parseInt(localStorage.getItem("pageSize")) || 10
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(localStorage.getItem("currentPage")) || 1
  );

  const { data: studentsData, isLoading, error } = useGetAllStudents();

  // Save pagination state to localStorage
  useEffect(() => {
    localStorage.setItem("selectedCategory", selectedCategory);
    localStorage.setItem("pageSize", pageSize);
    localStorage.setItem("currentPage", currentPage);
  }, [selectedCategory, pageSize, currentPage]);

  // Filter students based on search and category using useMemo
  const filteredStudents = useMemo(() => {
    return (studentsData?.students || []).filter(
      (student) =>
        (selectedCategory === "All Students" ||
          student?.programLevel === selectedCategory) &&
        (student?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student?.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [studentsData?.students, selectedCategory, searchTerm]);

  // Pagination logic with useMemo
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    let paginatedData = filteredStudents.slice(
      startIndex,
      startIndex + pageSize
    );

    if (paginatedData.length === 0 && filteredStudents.length > 0) {
      setCurrentPage(1);
      paginatedData = filteredStudents.slice(0, pageSize);
    }

    return paginatedData;
  }, [filteredStudents, currentPage, pageSize]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen gap-2">
      <Loader2 className="h-4 w-4 animate-spin text-green-900" />
    <div className="text-lg font-[Inter-Medium] text-gray-600">  Loading students data...</div>
  </div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen">
    <div className="text-lg font-[Inter-Medium] text-red-600">Error: {error.message}</div>
  </div>;
  }
  return (
    <div className="space-y-6 ">
      {/* Top Search Bar */}
      <div className="flex px-6 justify-between items-center border-b border-gray-300 h-[89px]">
        {/* Search Bar */}
        <div className="relative w-1/2">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-semantic-text-secondary"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-semantic-surface text-sm font-[Inter-Regular]  border border-semantic-bg-border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-200"
          />
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center px-6 py-3">
        <h1 className="text-2xl font-[Inter-Medium]">
          Postgraduate Students Records
        </h1>
        <span className="text-sm font-[Inter-Regular] text-gray-500">
          Last login: {format(new Date(), "MM-dd-yyyy hh:mm:ssaa")}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 px-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="mt-2 text-3xl font-[Inter-Medium]">{studentsData?.students?.length || 0}</p>
          <h3 className="text-sm font-[Inter-Medium] text-gray-500">
            Total Students
          </h3>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="mt-2 text-3xl font-[Inter-Medium]">
            {studentsData?.students?.filter(student => student.isActive)?.length || 0}
          </p>
          <h3 className="text-sm font-[Inter-Medium] text-gray-500">
            Active Students
          </h3>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="mt-2 text-3xl font-[Inter-Medium]">
            {studentsData?.students?.filter(student => student.status === "Workshop")?.length || 0}
          </p>
          <h3 className="text-sm font-[Inter-Medium] text-gray-500">
            <div className="flex items-center gap-1">
              Status: Workshop
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Workshop Status</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </h3>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="mt-2 text-3xl font-[Inter-Medium]">
            {studentsData?.students?.filter(student => student.status === "Normal Progress")?.length || 0}
          </p>
          <h3 className="text-sm font-[Inter-Medium] text-gray-500">
            <div className="flex items-center gap-1">
              Status: Normal Progress
              <TooltipProvider className="z-[9999] h-full">
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Normal Progress Status</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </h3>
        </div>
      </div>

      {/* Tab, Search, Table and Pagination */}
      <div className="bg-white py-4 rounded-lg shadow-md mx-6">
        {/* Tabs */}
        <StudentManagementTableTabs
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          students={studentsData?.students || []}
        />

        {/* Search Input & Page Size Dropdown */}
        <div className="flex justify-between items-center my-4 px-4">
          {/* Search Input */}
          <div className="relative w-96">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm font-[Inter-Regular] border border-semantic-bg-border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-200"
            />
          </div>
          {/* Page Size Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-[Inter-Regular] text-gray-600">Show:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-2 min-w-[55px] py-1 text-sm font-[Inter-Regular] border border-semantic-bg-border rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-200 appearance-none"
              style={{
                backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth="2" d="M7 10l5 5 5-5"/></svg>')`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '1rem',
              }}
            >
              {[5, 10, 15, 20, 25].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="px-4">
          <StudentManagementTable students={paginatedStudents} pageSize={pageSize} setPageSize={setPageSize}  />
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;
