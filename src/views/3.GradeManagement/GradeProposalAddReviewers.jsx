import React, { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Search, Plus, X, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useGetProposal, useGetReviewers } from "../../store/tanstackStore/services/queries";
import { createReviewerService, addReviewersService } from "../../store/tanstackStore/services/api";
import { queryClient } from "@/utils/tanstack";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper
} from "@tanstack/react-table";
// import { Icon } from "@iconify/react";

const GradeProposalAddReviewers = () => {
  const navigate = useNavigate();
  const { id: proposalId } = useParams(); // Get proposal ID from URL params
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(
    parseInt(localStorage.getItem("pageSize")) || 10
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(localStorage.getItem("currentPage")) || 1
  );
  const [selectedReviewers, setSelectedReviewers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newReviewer, setNewReviewer] = useState({
    name: "",
    email: "",
    primaryPhone: "",
    secondaryPhone: "",
    institution: "Uganda Management Institute",
    specialization: ""
  });

  // Specialization options
  const specializationOptions = [
    "Computer Science",
    "Business Administration",
    "Finance",
    "Economics",
    "Public Administration",
    "Human Resource Management",
    "Project Management",
    "Information Technology",
    "Data Science",
    "Marketing",
    "Accounting",
    "Education",
    "Engineering",
    "Health Sciences",
    "Law",
    "Social Sciences",
    "Other"
  ];

  // Query to fetch proposal details
  const { data: proposalData, isLoading: isProposalLoading, error: proposalError } = useGetProposal(proposalId);
  
  // Query to fetch all reviewers
  const { data: reviewersData, isLoading: isReviewersLoading, error: reviewersError } = useGetReviewers();

 
  // Mutation for assigning reviewers
  const addReviewersMutation = useMutation({
    mutationFn: () => addReviewersService(proposalId, selectedReviewers),
    onSuccess: (data) => {
      toast.success(data?.message || "Reviewers added successfully", {
        duration: 5000,
        action: {
          label: "Undo",
          onClick: () => toast.dismiss()
        }
      });
      queryClient.resetQueries({ queryKey: ['proposal', proposalId] });
      navigate(-1);
    },
    onError: (error) => {
      console.error("Error assigning reviewers:", error);
      toast.error(error?.message || "Error assigning reviewers. Please try again.", {
        duration: 40000,
        action: {
          label: "Close",
          onClick: () => toast.dismiss()
        }
      });
    }
  });

  // Mutation for creating a new reviewer
  const createReviewerMutation = useMutation({
    mutationFn: createReviewerService,
    onSuccess: (data) => {
      toast.success(data?.message || "Reviewer created successfully");
      setSelectedReviewers(prev => [...prev, data.reviewer]);
      setShowModal(false);
      setNewReviewer({ 
        name: "", 
        email: "", 
        primaryPhone: "", 
        secondaryPhone: "", 
        institution: "Uganda Management Institute",
        specialization: ""
      });
      queryClient.resetQueries({ queryKey: ['reviewers'] });
    },
    onError: (error) => {
      console.error("Error creating reviewer:", error);
      toast.error(error?.message || "Error creating reviewer. Please try again.");
    }
  });

  // Save pagination state to localStorage
  useEffect(() => {
    localStorage.setItem("pageSize", pageSize);
    localStorage.setItem("currentPage", currentPage);
  }, [pageSize, currentPage]);

  // Filter reviewers based on search
  const filteredReviewers = useMemo(() => {
    if (!reviewersData?.reviewers) return [];
    
    return reviewersData.reviewers.filter((reviewer) => {
      const matchesSearch =
        reviewer?.name
          ?.toLowerCase()
          ?.includes(searchTerm?.toLowerCase()) ||
        reviewer?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase());
      
      return matchesSearch;
    });
  }, [reviewersData, searchTerm]);

  // Pagination logic with useMemo
  const paginatedReviewers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    let paginatedData = filteredReviewers.slice(
      startIndex,
      startIndex + pageSize
    );

    if (paginatedData.length === 0 && filteredReviewers.length > 0) {
      // Reset the current page when the selected page size is too large for the available data
      setCurrentPage(1);
      paginatedData = filteredReviewers.slice(0, pageSize);
    }

    return paginatedData;
  }, [filteredReviewers, currentPage, pageSize]);

  const handleAssignToggle = (reviewer) => {
    setSelectedReviewers(prev => {
      const isSelected = prev.find(r => r.id === reviewer.id);
      if (isSelected) {
        return prev.filter(r => r.id !== reviewer.id);
      } else {
        return [...prev, reviewer];
      }
    });
  };

  const handleSave = () => {
    if (selectedReviewers.length > 0) {
      addReviewersMutation.mutate();
    }
  };

  const handleCreateReviewer = (e) => {
    e.preventDefault();
    createReviewerMutation.mutate(newReviewer);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReviewer(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate total pages
  const totalPages = Math.ceil(filteredReviewers.length / pageSize);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // TanStack Table setup
  const columnHelper = createColumnHelper();
  
  const columns = [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: info => <div className="text-sm font-medium text-gray-900">{info.getValue()}</div>
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: info => <div className="text-sm text-gray-500">{info.getValue()}</div>
    }),
    columnHelper.accessor('institution', {
      header: 'Institution',
      cell: info => <div className="text-sm text-gray-500">{info.getValue()}</div>
    }),
    columnHelper.accessor('specialization', {
      header: 'Specialization',
      cell: info => <div className="text-sm text-gray-500">{info.getValue() || "Not specified"}</div>
    }),
    columnHelper.accessor('id', {
      header: 'Action',
      cell: info => {
        const reviewer = info.row.original;
        const isSelected = selectedReviewers.some(r => r.id === reviewer.id);
        return (
          <button
            onClick={() => handleAssignToggle(reviewer)}
            className={`px-3 py-1 text-xs font-medium rounded-md ${
              isSelected
                ? 'bg-red-100 text-red-800 hover:bg-red-200'
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
          >
            {isSelected ? 'Unassign' : 'Assign'}
          </button>
        );
      }
    })
  ];

  const table = useReactTable({
    data: paginatedReviewers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isProposalLoading || isReviewersLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (proposalError || reviewersError) {
    return (
      <div className="p-6 text-red-500">
        Error loading data: {proposalError?.message || reviewersError?.message}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Search Bar */}
      <div className="p-6 border-b min-h-[90px] border-gray-300 w-full"></div>

      {/* Control Panel */}
      <div className="px-6 py-4 mb-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg gap-2 hover:bg-primary-900"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <div className="flex flex-col">
                <span className="text-lg font-medium text-gray-900">
                  Proposal: {proposalData?.proposal?.title || "Loading..."}
                </span>
                <span className="text-sm font-[Inter-Medium] capitalize text-gray-600">
                  Student: {`${proposalData?.proposal?.student?.firstName} ${proposalData?.proposal?.student?.lastName}` || "Not Available"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs, Search, Table, and Pagination */}
      <div className="p-6">
        <div className="bg-white pb-6 rounded-lg shadow-md">
          {/* Tabs */}
          <div className="flex flex-row items-center gap-8 border-b min-h-[68px] px-6 ">
            <h2 className="text-lg font-semibold">
              Assign Reviewers:{" "}
              <span className="text-sm text-gray-500">
                ({selectedReviewers.length}) Reviewers Selected
              </span>
            </h2>
          </div>

          <div className="flex justify-between items-center my-4 px-6">
            <div className="relative w-[600px]">
              <h2 className="text-sm font-normal text-[#626263]">
                All available reviewers are shown in this table. Use the search to find the reviewer you want, then click 'Assign' to link them to the proposal.
              </h2>
            </div>
          </div>

          {/* Search, Page Size, Add New Button */}
          <div className="flex justify-between items-center my-4 px-6">
            <div className="relative w-[600px]">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by Name or Email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg gap-2 hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                Add New Reviewer
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-2 py-1 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {[5, 10, 15, 20, 25].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="px-6">
            {/* Reviewer Table using TanStack Table */}
            <div className="min-w-full overflow-hidden border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th 
                          key={header.id}
                          scope="col" 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map(row => {
                      const isSelected = selectedReviewers.some(r => r.id === row.original.id);
                      return (
                        <tr 
                          key={row.id} 
                          className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                        >
                          {row.getVisibleCells().map(cell => (
                            <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </td>
                          ))}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                        <div className="text-sm font-medium">No reviewers found</div>
                        <div className="text-xs mt-1">Please add a new reviewer or adjust your search criteria</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination and Entries Info */}
            <div className="flex justify-between items-center mt-4 px-2">
              <div className="text-sm text-gray-600">
                Showing {Math.min(filteredReviewers.length, (currentPage - 1) * pageSize + 1)} to {Math.min(filteredReviewers.length, currentPage * pageSize)} of {filteredReviewers.length} entries
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
                >
                  First
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <div className="flex items-center space-x-1">
                  {[...Array(totalPages).keys()].map((page) => (
                    <button
                      key={page + 1}
                      onClick={() => handlePageChange(page + 1)}
                      className={`px-3 py-1 border rounded-md text-sm ${
                        currentPage === page + 1
                          ? 'bg-primary-500 text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {page + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
                >
                  Next
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
                >
                  Last
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center gap-4 pt-8">
            <button 
              onClick={handleSave}
              disabled={selectedReviewers.length === 0 || addReviewersMutation.isPending}
              className="min-w-[200px] text-lg flex items-center justify-center px-4 py-2 bg-primary-500 text-white rounded-lg gap-2 hover:bg-primary-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addReviewersMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Dialog for adding new reviewer */}
      <dialog
        open={showModal}
        className="fixed inset-0 z-50 bg-transparent"
        onClick={(e) => {
          if (e.target === e.currentTarget) setShowModal(false);
        }}
      >
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Add New Reviewer</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateReviewer}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={newReviewer.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Dr. John Smith"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={newReviewer.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="john.smith@example.com"
                />
              </div>
              
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Phone
                  </label>
                  <input
                    type="tel"
                    name="primaryPhone"
                    value={newReviewer.primaryPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Secondary Phone
                  </label>
                  <input
                    type="tel"
                    name="secondaryPhone"
                    value={newReviewer.secondaryPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1 (555) 987-6543"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Institution
                </label>
                <input
                  type="text"
                  name="institution"
                  value={newReviewer.institution}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="University of Example"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area of Specialization
                </label>
                <select
                  name="specialization"
                  value={newReviewer.specialization}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a specialization</option>
                  {specializationOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {newReviewer.specialization === "Other" && (
                  <input
                    type="text"
                    name="customSpecialization"
                    value={newReviewer.customSpecialization || ""}
                    onChange={handleInputChange}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Please specify your specialization"
                  />
                )}
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createReviewerMutation.isPending}
                  className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50"
                >
                  {createReviewerMutation.isPending ? 'Creating...' : 'Create Reviewer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default GradeProposalAddReviewers;