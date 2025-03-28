import React, { useState, useCallback, memo, useMemo } from "react";
import { Icon } from "@iconify-icon/react";


import { toast } from "sonner";
import { addReviewersService, addPanelistsService } from "@/store/tanstackStore/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGetPanelists, useGetReviewers, useGetStudentProposals } from "../../store/tanstackStore/services/queries";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useParams } from "react-router-dom";
import { queryClient } from "../../utils/tanstack";
import { debounce } from 'lodash';

// 1. Memoize the search components
const SearchInput = memo(({ value, onChange, placeholder }) => (
  <Input
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
  />
));

const StudentProfileProgressProposalDrawer = ({ isOpen, onClose,   proposalData }) => {
let {id:studentId} = useParams();

const { data: proposals, isLoading: isLoadingProposals } = useGetStudentProposals(studentId);



const proposal = useMemo(() => {
  if (!proposalData || !proposals?.proposals) return null;
  const foundProposal = proposals.proposals.find(p => p.id === proposalData?.id);
  return foundProposal || proposalData;
}, [proposalData, proposals]);

  const { data: reviewersData, isLoading: isLoadingReviewers } = useGetReviewers();
  const { data: panelistsData, isLoading: isLoadingPanelists } = useGetPanelists();

  const [isDefenseDateModalOpen, setIsDefenseDateModalOpen] = useState(false);
  const [isReviewerModalOpen, setIsReviewerModalOpen] = useState(false);
  const [isPanelistModalOpen, setIsPanelistModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [manualReviewer, setManualReviewer] = useState({ name: "", email: "" });
  const [selectedReviewers, setSelectedReviewers] = useState([]);
  
  const [panelistSearchTerm, setPanelistSearchTerm] = useState("");
  const [manualPanelist, setManualPanelist] = useState({ name: "", email: "" });
  const [selectedPanelists, setSelectedPanelists] = useState([]);



  // 2. Debounce search handlers
  const debouncedSearchHandler = useMemo(
    () => debounce((value) => {
      setSearchTerm(value);
    }, 300),
    []
  );

  const handleSearchTermChange = useCallback((e) => {
    debouncedSearchHandler(e.target.value);
  }, [debouncedSearchHandler]);

  const handleDefenseDateModalOpen = useCallback(() => {
    setIsDefenseDateModalOpen(true);
  }, []);

  const handleDefenseDateModalClose = useCallback(() => {
    setIsDefenseDateModalOpen(false);
  }, []);

  const handleReviewerModalOpen = useCallback(() => {
    setIsReviewerModalOpen(true);
  }, []);

  const handlePanelistModalOpen = useCallback(() => {
    setIsPanelistModalOpen(true);
  }, []);

  const handlePanelistSearchTermChange = useCallback((e) => {
    setPanelistSearchTerm(e.target.value);
  }, []);

  const handleManualReviewerChange = useCallback((field) => (e) => {
    setManualReviewer(prev => ({...prev, [field]: e.target.value}));
  }, []);

  const handleManualPanelistChange = useCallback((field) => (e) => {
    setManualPanelist(prev => ({...prev, [field]: e.target.value}));
  }, []);

  const handleAddManualReviewer = useCallback(() => {
    if (manualReviewer.name && manualReviewer.email) {
      const newReviewer = {
        id: `manual-${Date.now()}`,
        name: manualReviewer.name,
        email: manualReviewer.email
      };
      setSelectedReviewers(prev => [...prev, newReviewer]);
      setManualReviewer({ name: "", email: "" });
    }
  }, [manualReviewer]);

  const handleAddManualPanelist = useCallback(() => {
    if (manualPanelist.name && manualPanelist.email) {
      const newPanelist = {
        id: `manual-${Date.now()}`,
        name: manualPanelist.name,
        email: manualPanelist.email
      };
      setSelectedPanelists(prev => [...prev, newPanelist]);
      setManualPanelist({ name: "", email: "" });
    }
  }, [manualPanelist]);

  // 5. Memoize handlers
  const handleReviewerSelection = useCallback((reviewer) => {
    setSelectedReviewers(prev => {
      const exists = prev.some(r => r.id === reviewer.id);
      return exists 
        ? prev.filter(r => r.id !== reviewer.id)
        : [...prev, reviewer];
    });
  }, []);

  // 6. Memoize filtered data
  const filteredReviewers = useMemo(() => {
    if (!searchTerm || !reviewersData?.reviewers) return [];
    return reviewersData.reviewers
      .filter(reviewer => 
        reviewer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reviewer.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 5);
  }, [searchTerm, reviewersData]);

  const handleRemoveReviewer = useCallback((reviewerId) => {
    setSelectedReviewers(prev => prev.filter(r => r.id !== reviewerId));
  }, []);

  const handleRemovePanelist = useCallback((panelistId) => {
    setSelectedPanelists(prev => prev.filter(p => p.id !== panelistId));
  }, []);

  const resetReviewerModal = useCallback(() => {
    setIsReviewerModalOpen(false);
    setSelectedReviewers([]);
    setManualReviewer({ name: "", email: "" });
    setSearchTerm("");
    // onClose();
    // queryClient.invalidateQueries({queryKey: ['studentProposals']});
    // queryClient.invalidateQueries({queryKey: ['student']});
  }, []);

  const resetPanelistModal = useCallback(() => {
    setIsPanelistModalOpen(false);
    setSelectedPanelists([]);
    setManualPanelist({ name: "", email: "" });
    setPanelistSearchTerm("");
    // onClose();
    // queryClient.invalidateQueries({queryKey: ['studentProposals']});
    // queryClient.invalidateQueries({queryKey: ['student']});
  }, []);

  // 4. Optimize mutation with better state updates
  const addReviewersMutation = useMutation({
    mutationFn: (reviewers) => addReviewersService(proposal?.id, reviewers),
    onSuccess: () => {
      toast.success("Reviewers added successfully");
      resetReviewerModal();
      // onClose();
    },
    onSettled: async (data, error) => {
      if (!error) {
        // Batch updates
    //  window.location.reload();
        
    await Promise.all([
      queryClient.removeQueries({
        queryKey: ['studentProposals', studentId],
        exact: true
      }),
      queryClient.removeQueries({
        queryKey: ['student', studentId],
        exact: true
      }),
      // queryClient.invalidateQueries({
      //   queryKey: ['studentProposals', studentId],
      //   exact: true
      // }),
      // queryClient.invalidateQueries({
      //   queryKey: ['student', studentId],
      //   exact: true
      // })
    ]);
       
      }
    }
  });

  const addPanelistsMutation = useMutation({
    mutationFn: (panelists) => addPanelistsService(proposal?.id, panelists),
    onSuccess: () => {
      toast.success("Panelists added successfully", {
        duration: 5000,
        action: {
          label: "Close",
          onClick: () => toast.dismiss()
        }
      });
      resetPanelistModal();
      // onClose();
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to add panelists", {
        duration: 5000,
        action: {
          label: "Close",
          onClick: () => toast.dismiss()
        }
      });
    },
    onSettled: async (data, error) => {
      if (!error) {
        try {
          // Safe refetch with error handling
          await Promise.all([
            queryClient.removeQueries({
              queryKey: ['studentProposals', studentId],
              exact: true
            }),
            queryClient.removeQueries({
              queryKey: ['student', studentId],
              exact: true
            }),
            // queryClient.invalidateQueries({
            //   queryKey: ['studentProposals', studentId],
            //   exact: true
            // }),
            // queryClient.invalidateQueries({
            //   queryKey: ['student', studentId],
            //   exact: true
            // })
          ]);
        } catch (refetchError) {
          console.error('Error refetching data:', refetchError);
          toast.error("Updated successfully but couldn't refresh data", {
            duration: 3000
          });
        }
      }
    }
  });

  const handleAddReviewers = useCallback(() => {
    if (proposal?.id && selectedReviewers.length > 0) {
      addReviewersMutation.mutate(selectedReviewers);
    }
  }, [proposal?.id, selectedReviewers, addReviewersMutation]);

  const handleAddPanelists = useCallback(() => {
    if (proposal?.id && selectedPanelists.length > 0) {
      addPanelistsMutation.mutate(selectedPanelists);
    }
  }, [proposal?.id, selectedPanelists, addPanelistsMutation]);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="min-w-[600px] p-0">
          <SheetHeader className="p-4 border-b">
            <div className="flex justify-between items-center z-50">
              <SheetTitle>Proposal Details</SheetTitle>
              <Button  className="bg-primary-500 hover:bg-primary-800 text-white" onClick={onClose}>
                <X className="w-4 h-4 mr-2" />
                Close Window
              </Button>
            </div>
          </SheetHeader>

          <div className="overflow-y-auto h-full p-6">
            {proposal ? (
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <Label className="text-sm font-[Inter-Regular] text-gray-500">Title</Label>
                  <p className="text-gray-900 text-base font-[Inter-Regular]">{proposal.title}</p>
                </div>

                {/* Status */}
                <div>
                  <Label className="text-sm font-[Inter-Regular] text-gray-500 ">Status</Label>
                  {proposal.statuses?.length > 0 && (
                    <span
                      style={{
                        color: proposal.statuses[proposal.statuses.length - 1]?.definition?.color || "#000",
                        backgroundColor: `${proposal.statuses[proposal.statuses.length - 1]?.definition?.color}18` || "#00000018",
                        border: `1px solid ${proposal.statuses[proposal.statuses.length - 1]?.definition?.color || "#000"}`,
                      }}
                      className="px-2 py-1 rounded-md text-sm font-[Inter-Regular] capitalize inline-block"
                    >
                      {proposal.statuses[proposal.statuses.length - 1]?.definition?.name?.toLowerCase() || "Pending"}
                    </span>
                  )}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-[Inter-Regular] text-gray-500">Submitted Date</Label>
                    <p className="text-gray-900 text-base font-[Inter-Regular]">
                      {proposal.submittedAt ? new Date(proposal.submittedAt).toLocaleDateString() : "-"}
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div>
                      <Label className="text-sm font-[Inter-Regular] text-gray-500">Defense Date</Label>
                      <p className="text-gray-900 text-base font-[Inter-Regular]">
                        {proposal.defenseDate ? new Date(proposal.defenseDate).toLocaleDateString() : "-"}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" className="border border-primary-600 text-primary-600 text-xs  font-[Inter-Regular] hover:text-primary-700 hover:bg-primary-100 " onClick={handleDefenseDateModalOpen}>
                      Set Defense Date
                    </Button>
                  </div>
                </div>

                {/* Submitted By */}
                <div>
                  <Label className="text-sm font-[Inter-Regular] text-gray-500">Submitted By</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 text-base font-[Inter-Regular]">{proposal.submittedBy?.name}</span>
                    {proposal.submittedBy && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Icon icon="tdesign:info-circle-filled" className="w-4 h-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>{proposal.submittedBy.email}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>

                {/* Grade */}
                <div>
                  <Label className="text-sm font-[Inter-Regular] text-gray-500">Grade</Label>
                  <p className="text-gray-900 text-base font-[Inter-Regular]">{proposal.grade || "Not graded"}</p>
                </div>

                {/* Reviewers */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm font-[Inter-Regular] text-gray-500">Reviewers</Label>
                    <Button size="sm" variant="outline" className="border border-primary-600 text-primary-600 text-xs  font-[Inter-Regular] hover:text-primary-700 hover:bg-primary-100 " onClick={handleReviewerModalOpen}>
                      Add Reviewer
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {proposal.reviewers?.length > 0 ? (
                      proposal.reviewers.map((reviewer) => (
                        <div key={reviewer.id} className="flex items-center gap-2">
                          <span className="text-gray-900 text-base font-[Inter-Regular]">{reviewer.name}</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Icon icon="tdesign:info-circle-filled" className="w-4 h-4 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>{reviewer.email}</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm italic">No reviewers assigned</p>
                    )}
                  </div>
                </div>

                {/* Panelists */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm font-[Inter-Regular] text-gray-500">Panelists</Label>
                    <Button size="sm" variant="outline" className="border border-primary-600 text-primary-600 text-xs  font-[Inter-Regular] hover:text-primary-700 hover:bg-primary-100 " onClick={handlePanelistModalOpen}>
                      Add Panelist
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {proposal.panelists?.length > 0 ? (
                      proposal.panelists.map((panelist) => (
                        <div key={panelist.id} className="flex items-center gap-2">
                          <span className="text-gray-900 text-base font-[Inter-Regular]">{panelist.name}</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Icon icon="tdesign:info-circle-filled" className="w-4 h-4 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>{panelist.email}</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm italic">No panelists assigned</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">No proposal selected</div>
            )}
             {/* More Details Button */}
             <div className="mt-5 w-full flex justify-center  mx-auto ">
                <Button
                 
                  variant="outline"
                  className="bg-primary-500 text-white hover:text-primary-500 hover:border-primary-500"
                >
                  View More Details
                </Button>
              </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Defense Date Modal */}
      <Dialog open={isDefenseDateModalOpen} onOpenChange={setIsDefenseDateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Defense Date</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input type="datetime-local" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleDefenseDateModalClose}>
              Cancel
            </Button>
            <Button onClick={handleDefenseDateModalClose}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reviewer Modal */}
      <Dialog open={isReviewerModalOpen} onOpenChange={setIsReviewerModalOpen}>
        <DialogContent className="max-w-[80vh] max-h-[90vh]">
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

      {/* Panelist Modal */}
      <Dialog open={isPanelistModalOpen} onOpenChange={setIsPanelistModalOpen}>
        <DialogContent className="max-w-[80vh] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Add Panelist</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Search panelist..."
              value={panelistSearchTerm}
              onChange={handlePanelistSearchTermChange}
            />

            {/* Panelist search results */}
            {panelistSearchTerm && (
              isLoadingPanelists ? (
                <div className="text-center py-4 text-gray-600">Loading panelists...</div>
              ) : panelistsData && panelistsData?.panelists?.length > 0 ? (
                <div className="border rounded-md shadow-sm">
                  {panelistsData?.panelists
                    ?.filter(panelist =>
                      panelist.name.toLowerCase().includes(panelistSearchTerm.toLowerCase()) ||
                      panelist.email.toLowerCase().includes(panelistSearchTerm.toLowerCase())
                    )
                    .slice(0, 5)
                    .map(panelist => (
                      <div
                        key={panelist.id}
                        className={`p-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer ${
                          selectedPanelists.some(p => p.id === panelist.id) ? 'bg-primary-50 border-l-4 border-primary-500' : ''
                        }`}
                        onClick={() => handlePanelistSelection(panelist)}
                      >
                        <div>
                          <div className="font-medium text-gray-800">{panelist.name}</div>
                          <div className="text-sm text-gray-500">{panelist.email}</div>
                        </div>
                        {selectedPanelists.some(p => p.id === panelist.id) && (
                          <Icon icon="mdi:check" className="w-5 h-5 text-primary-600" />
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-md">No panelists found</div>
              )
            )}

            {/* Manual panelist entry */}
            <div className="border-t pt-4">
              <Label className="text-sm font-[Inter-Regular] mb-2">Add panelist manually</Label>
              <div className="space-y-3">
                <Input
                  type="text"
                  placeholder="Name"
                  value={manualPanelist.name}
                  onChange={handleManualPanelistChange('name')}
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={manualPanelist.email}
                  onChange={handleManualPanelistChange('email')}
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleAddManualPanelist}
                  disabled={!manualPanelist.name || !manualPanelist.email}
                >
                  Add to Selected
                </Button>
              </div>
            </div>

            {/* Selected panelists */}
            {selectedPanelists.length > 0 && (
              <div>
                <Label className="text-sm font-[Inter-Regular] mb-2">Selected panelists</Label>
                <div className="space-y-2">
                  {selectedPanelists.map(panelist => (
                    <div key={panelist.id} className="flex justify-between items-center p-2.5 bg-gray-100 rounded-md capitalize">
                      <span className="font-medium text-gray-800">{panelist.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePanelist(panelist.id)}
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
              onClick={resetPanelistModal}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddPanelists}
              disabled={addPanelistsMutation.isPending || selectedPanelists.length === 0}
            >
              {addPanelistsMutation.isPending ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// 7. Memoize sub-components
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

export default memo(StudentProfileProgressProposalDrawer);