import React, { useState, useMemo, useCallback, memo, useEffect } from 'react'
import { format } from 'date-fns'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table'
import { UserPlus } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteReviewerService, addReviewersService } from '../../store/tanstackStore/services/api'
import { toast } from 'sonner'
import { Icon } from "@iconify-icon/react"
import { useGetReviewers } from "../../store/tanstackStore/services/queries"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { debounce } from 'lodash';

const SearchInput = memo(({ value, onChange, placeholder }) => (
  <Input
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
  />
))
{/** Delete Modal */}
const DeleteModal = ({ isOpen, onClose, onConfirm, reviewer, isPending }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[400px]">
        <h3 className="text-lg font-[Inter-Medium] text-gray-900 mb-4">Delete Reviewer</h3>
        <p className="text-sm font-[Inter-Regular] text-gray-600 mb-6">
          Are you sure you want to delete reviewer <span className="font-[Inter-Medium]">{reviewer.name}</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-sm font-[Inter-Medium] text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="px-4 py-2 text-sm font-[Inter-Medium] text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};
{/** Pagination Buttons */}
const PaginationButtons = memo(({ table, currentPage, totalPages }) => {
  const pagesToShow = useMemo(() => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);

    if (currentPage <= 3) {
      pages.push(2, 3);
      pages.push('...');
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push('...');
      pages.push(totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push('...');
      pages.push(currentPage - 1, currentPage, currentPage + 1);
      pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="flex items-center gap-1">
      {pagesToShow.map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="w-8 h-8 flex items-center justify-center text-gray-500">...</span>
          ) : (
            <button
              className={`w-8 h-8 rounded text-sm transition-colors ${
                page === currentPage
                  ? "bg-blue-50 text-blue-600 font-[Inter-Medium]"
                  : "text-gray-500 hover:bg-blue-50"
              }`}
              onClick={() => table.setPageIndex(page - 1)}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}
    </div>
  );
});
{/** Reviewers List */}
const ReviewersList = memo(({ reviewers, selectedReviewers, onSelect }) => (
  <div className="border rounded-md shadow-sm">
    {reviewers.map(reviewer => (
      <ReviewerItem 
        key={reviewer.id}
        reviewer={reviewer}
        isSelected={selectedReviewers.some(r => r.id === reviewer.id)}
        onSelect={() => onSelect(reviewer)}
      />
    ))}
  </div>
));
{/** Reviewer Item */}
const ReviewerItem = memo(({ reviewer, isSelected, onSelect }) => (
  <div
    className={`p-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer ${
      isSelected ? 'bg-primary-50 border-l-4 border-primary-500' : ''
    }`}
    onClick={onSelect}
  >
    <div>
      <div className="font-medium text-gray-800">{reviewer.name}</div>
      <div className="text-sm text-gray-500">{reviewer.email}</div>
    </div>
    {isSelected && (
      <Icon icon="mdi:check" className="w-5 h-5 text-primary-600" />
    )}
  </div>
));

{/** Main- Grade Proposal Reviewer Table */}
const GradeProposalReviewerTable = ({ reviewers, proposalId, onUpdateClick, reviewGrades, onViewClick }) => {
  const [globalFilter, setGlobalFilter] = useState('')
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedReviewer, setSelectedReviewer] = useState(null)
  const [tableData, setTableData] = useState(reviewers)
  const [isReviewerModalOpen, setIsReviewerModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [manualReviewer, setManualReviewer] = useState({ name: "", email: "" })
  const [selectedReviewers, setSelectedReviewers] = useState([])

  const { data: reviewersData, isLoading: isLoadingReviewers } = useGetReviewers()
  let queryClient = useQueryClient()

  useEffect(() => {
    setTableData(reviewers)
  }, [reviewers])

  const debouncedSearchHandler = useMemo(
    () => debounce((value) => {
      setSearchTerm(value)
    }, 300),
    []
  )

  const handleSearchTermChange = useCallback((e) => {
    debouncedSearchHandler(e.target.value)
  }, [debouncedSearchHandler])

  const handleManualReviewerChange = useCallback((field) => (e) => {
    setManualReviewer(prev => ({...prev, [field]: e.target.value}))
  }, [])

  const handleAddManualReviewer = useCallback(() => {
    if (manualReviewer.name && manualReviewer.email) {
      const newReviewer = {
        id: `manual-${Date.now()}`,
        name: manualReviewer.name,
        email: manualReviewer.email
      }
      setSelectedReviewers(prev => [...prev, newReviewer])
      setManualReviewer({ name: "", email: "" })
    }
  }, [manualReviewer])

  const handleReviewerSelection = useCallback((reviewer) => {
    setSelectedReviewers(prev => {
      const exists = prev.some(r => r.id === reviewer.id)
      return exists 
        ? prev.filter(r => r.id !== reviewer.id)
        : [...prev, reviewer]
    })
  }, [])

  const handleRemoveReviewer = useCallback((reviewerId) => {
    setSelectedReviewers(prev => prev.filter(r => r.id !== reviewerId))
  }, [])

  const resetReviewerModal = useCallback(() => {
    setIsReviewerModalOpen(false)
    setSelectedReviewers([])
    setManualReviewer({ name: "", email: "" })
    setSearchTerm("")
  }, [])

  const addReviewersMutation = useMutation({
    mutationFn: (reviewers) => addReviewersService(proposalId, reviewers),
    onSuccess: () => {
      toast.success("Reviewers added successfully")
     
    },
    onSettled: async (data, error) => {
      if (!error) {
         Promise.all([
           await queryClient.resetQueries({ queryKey: ['proposal', proposalId] }),
           resetReviewerModal()
        ])
      }
    }
  })

  const handleAddReviewers = useCallback(() => {
    if (selectedReviewers.length > 0) {
      addReviewersMutation.mutate(selectedReviewers)
    }
  }, [selectedReviewers, addReviewersMutation])

  const filteredReviewers = useMemo(() => {
    if (!searchTerm || !reviewersData?.reviewers) return []
    return reviewersData.reviewers
      .filter(reviewer => 
        reviewer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reviewer.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 5)
  }, [searchTerm, reviewersData])

  const deleteReviewerMutation = useMutation({
    mutationFn: ({ proposalId, reviewerId }) => deleteReviewerService(proposalId, reviewerId),
    onSuccess: async() => {
      toast.success('Reviewer deleted successfully')
    },
    onError: (error) => {
      toast.error(error.message, {
        position: 'center',
        autoClose: 10000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      })
    },
    onSettled: async(data, error) => {
        if(!error){
            await Promise.all([
                await queryClient.resetQueries({ queryKey: ['proposal', proposalId] }),
                setDeleteModalOpen(false),
                setSelectedReviewer(null)
            ])
        }
    }
  })

  const handleOpenDelete = useCallback((reviewer) => {
 
    if (proposalId) {
      setSelectedReviewer(reviewer)
      setDeleteModalOpen(true)
    } else {
      toast.error('Proposal ID is required', {
        position: 'top-center',
        autoClose: 10000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      })
    }
  }, [])

  const handleConfirmDelete = useCallback(() => {
    if (selectedReviewer && proposalId) {
      deleteReviewerMutation.mutate({
        proposalId,
        reviewerId: selectedReviewer.id
      })
    }
  }, [selectedReviewer, proposalId, deleteReviewerMutation])

  const columns = useMemo(() => [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: (info) => info.getValue(),
    },
    {
      header: 'Email',
      accessorKey: 'email',
      cell: (info) => info.getValue(),
    },
    {
      header: 'Comments',
      accessorKey: 'comments',
      cell: (info) => {
        const reviewerId = info.row.original.id;
        const grade = reviewGrades.find(grade => grade.gradedById === reviewerId);
        return <div className='text-xs font-[Inter-Regular] whitespace-pre-wrap text-gray-600'>{grade ? grade.feedback : '-'}</div>;
      },
    },
    {
      header: 'Verdict',
      accessorKey: 'verdict',
      cell: (info) => {
        const reviewerId = info.row.original.id;
        const grade = reviewGrades.find(grade => grade.gradedById === reviewerId);
        return grade ? `${grade.verdict}` : '-';
      },
    },
    {
      header: 'Submitted',
      accessorKey: 'createdAt',
      cell: (info) => {
        const reviewerId = info.row.original.id;
        const grade = reviewGrades.find(grade => grade.gradedById === reviewerId);
        return grade && grade.createdAt 
          ? format(new Date(grade.createdAt), 'dd-MMM-yyyy') 
          : '-';
      },
    },
    {
      header: 'Updated',
      accessorKey: 'updatedAt',
      cell: (info) => {
        const reviewerId = info.row.original.id;
        const grade = reviewGrades.find(grade => grade.gradedById === reviewerId);
        return grade && grade.updatedAt 
          ? format(new Date(grade.updatedAt), 'dd-MMM-yyyy') 
          : '-';
      },
    },
    {
      header: '',
      accessorKey: 'action',
      cell: (info) => {
        const reviewerId = info.row.original.id;
        const grade = reviewGrades.find(grade => grade.gradedById === reviewerId);
        return (
          <div className='flex items-center justify-end gap-4'>
            {grade ? (
              <button
                onClick={() => onViewClick(info.row.original)} // Assuming there's a function to handle viewing
                className="rounded border text-gray-700 border-semantic-bg-border shadow-sm py-1 px-2 hover:bg-gray-50 font-[Inter-Medium] text-sm"
              >
                View
              </button>
            ) : (
              <>
                <button
                  onClick={() => onUpdateClick(info.row.original)}
                  className="rounded border text-gray-700 border-semantic-bg-border shadow-sm py-1 px-2 hover:bg-gray-50 font-[Inter-Medium] text-sm"
                >
                  Update
                </button>

                <button
                  onClick={() => handleOpenDelete(info.row.original)}
                  className="rounded py-1 px-2 border border-[#FB3836] text-red-800 bg-red-100 flex items-center justify-center overflow-hidden"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        );
      }
    },
  ], [handleOpenDelete, reviewGrades])

  const handlePaginationChange = useCallback((updater) => {
    if (typeof updater === 'function') {
      const newState = updater({ pageIndex, pageSize })
      setPageIndex(newState.pageIndex)
      setPageSize(newState.pageSize)
    }
  }, [pageIndex, pageSize])

  const handleGlobalFilterChange = useCallback((e) => {
    setGlobalFilter(e.target.value)
  }, [])

  const handlePageSizeChange = useCallback((e) => {
    setPageSize(Number(e.target.value))
    setPageIndex(0)
  }, [])

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      globalFilter,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true
  })

  const pagination = useMemo(() => ({
    pageIndex,
    pageSize,
    pageCount: Math.ceil(tableData.length / pageSize),
    currentPage: pageIndex + 1,
  }), [pageIndex, pageSize, tableData.length]);

  return (
    <div>
      {/* Search Bar, Show, Add Reviewers */}
      <div className="flex items-center w-full justify-between mb-4">
        <div className="relative w-1/3">
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={handleGlobalFilterChange}
            placeholder="Search..."
            className="px-4 w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1">
            <span className="text-sm font-[Inter-Medium] text-gray-600">Show:</span>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              {[5, 10, 20, 30, 40, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
         
          <button 
            onClick={() => setIsReviewerModalOpen(true)}
            className="px-4 py-2 bg-transparent text-sm font-[Inter-Medium] border border-primary-500 text-primary-500 rounded-md hover:bg-primary-100  focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center gap-2"
          >
            <UserPlus size={16} />
            Add Reviewers
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id}
                    scope="col" 
                    className="px-6 py-3 text-left text-sm font-[Inter-Medium] text-gray-700 capitalize tracking-wider"
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
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td 
                    key={cell.id}
                    className="px-6 py-4 whitespace-nowrap text-sm font-[Inter-Regular] text-gray-900"
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 bg-white">
        <div className="text-sm text-gray-600 font-[Inter-Regular]">
          Showing {pagination.pageIndex * pageSize + 1} to{' '}
          {Math.min((pagination.pageIndex + 1) * pageSize, table.getFilteredRowModel().rows.length)}{' '}
          of {table.getFilteredRowModel().rows.length} entries
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 text-sm font-[Inter-Medium] border border-gray-300 rounded-md disabled:opacity-50 transition-colors hover:bg-gray-50"
          >
            Previous
          </button>

          <PaginationButtons 
            table={table}
            currentPage={pagination.currentPage}
            totalPages={pagination.pageCount}
          />

          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 text-sm font-[Inter-Medium] border border-gray-300 rounded-md disabled:opacity-50 transition-colors hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        reviewer={selectedReviewer}
        isPending={deleteReviewerMutation.isPending}
      />

      {/* Reviewer Modal */}
      <Dialog open={isReviewerModalOpen} onOpenChange={setIsReviewerModalOpen}>
        <DialogContent className="max-w-[80vh] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Reviewer</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <SearchInput 
              value={searchTerm}
              onChange={handleSearchTermChange}
              placeholder="Search reviewer..."
            />

            {/* Use filtered data */}
            {searchTerm && (
              isLoadingReviewers ? (
                <div className="text-center py-4 text-gray-600">Loading reviewers...</div>
              ) : reviewersData && reviewersData?.reviewers?.length > 0 ? (
                <ReviewersList 
                  reviewers={filteredReviewers}
                  selectedReviewers={selectedReviewers}
                  onSelect={handleReviewerSelection}
                />
              ) : (
                <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-md">No reviewers found</div>
              )
            )}

            {/* Manual reviewer entry */}
            <div className="border-t pt-4">
              <Label className="text-sm font-[Inter-Regular] mb-2">Add reviewer manually</Label>
              <div className="space-y-3">
                <Input
                  type="text"
                  placeholder="Name"
                  value={manualReviewer.name}
                  onChange={handleManualReviewerChange('name')}
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={manualReviewer.email}
                  onChange={handleManualReviewerChange('email')}
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleAddManualReviewer}
                  disabled={!manualReviewer.name || !manualReviewer.email}
                >
                  Add to Selected
                </Button>
              </div>
            </div>

            {/* Selected reviewers */}
            {selectedReviewers.length > 0 && (
              <div>
                <Label className="text-sm font-[Inter-Regular] mb-2">Selected reviewers</Label>
                <div className="space-y-2">
                  {selectedReviewers.map(reviewer => (
                    <div key={reviewer.id} className="flex justify-between items-center p-2.5 bg-gray-100 rounded-md capitalize">
                      <span className="font-medium text-gray-800">{reviewer.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveReviewer(reviewer.id)}
                      >
                        <Icon icon="mdi:close" height={20} width={20} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={resetReviewerModal}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddReviewers}
              disabled={addReviewersMutation.isPending || selectedReviewers.length === 0}
            >
              {addReviewersMutation.isPending ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

GradeProposalReviewerTable.displayName = 'GradeProposalReviewerTable'
export default React.memo(GradeProposalReviewerTable)