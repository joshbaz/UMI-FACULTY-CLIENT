import { format } from "date-fns";
import { ArrowLeft, Search, Loader2 } from "lucide-react";
import React, { useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "@iconify-icon/react";
import { useGetProposal } from "../../store/tanstackStore/services/queries";
import GradeProposalTableTabs from "./GradeProposalTableTabs";
import GradeProposalReviewerTable from "./GradeProposalReviewerTable";
import GradeProposalPanelistTable from "./GradeProposalPanelistTable";
import GradeProposalUpdateReviewerMark from "./GradeProposalUpdateReviewerMark";
import GradeProposalUpdatePanelistMark from "./GradeProposalUpdatePanelistMark";

const GradeProposal = () => {
  let navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Reviewers");
  const [isUpdateReviewerDrawerOpen, setIsUpdateReviewerDrawerOpen] = useState(false);
  const [isUpdatePanelistDrawerOpen, setIsUpdatePanelistDrawerOpen] = useState(false);
  const [selectedReviewer, setSelectedReviewer] = useState(null);
  const [selectedPanelist, setSelectedPanelist] = useState(null);
  const { id: proposalId } = useParams();
  const { data: proposal, isPending: isLoading, error, refetch:refetchProposal } = useGetProposal(proposalId);

  

  const currentStatus = useMemo(
    () => proposal?.proposal?.statuses?.find((s) => s.isCurrent),
    [proposal?.proposal?.statuses]
  );

  const { totalDays, expectedDays } = useMemo(() => {
    const statusDate = currentStatus?.createdAt
      ? new Date(currentStatus.createdAt)
      : new Date();
    const totalDays = Math.ceil(
      (new Date() - statusDate) / (1000 * 60 * 60 * 24)
    );
    const expectedDays = currentStatus?.definition?.expectedDuration || null;
    return { totalDays, expectedDays };
  }, [currentStatus?.createdAt, currentStatus?.definition?.expectedDuration]);

  const reviewers = useMemo(() => {
    return proposal?.proposal?.reviewers || [];
  }, [proposal?.proposal?.reviewers]);


  const handleReviewerUpdateClick = useCallback((reviewer) => {
    setSelectedReviewer(reviewer);
    setIsUpdateReviewerDrawerOpen(true);
  }, []);

  const handlePanelistUpdateClick = useCallback((panelist) => {
    setSelectedPanelist(panelist);
    setIsUpdatePanelistDrawerOpen(true);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-green-900" />
        <div className="text-lg font-[Inter-Medium] text-gray-600">
          {" "}
          Loading proposal data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">Error loading proposal data</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Search Bar */}
      <div className="flex px-6 justify-between items-center border-b border-gray-300 h-[89px]"></div>

      {/* Header */}
      <div className="flex justify-between items-center px-6 py-1">
        <h1 className="text-2xl font-[Inter-Medium]">Proposal</h1>
        <span className="text-sm font-[Inter-Regular] text-gray-500">
          Last login: {format(new Date(), "MM-dd-yyyy hh:mm:ssaa")}
        </span>
      </div>

      <div className="px-6 py-4 mb-4">
        <div className="bg-white p-4 rounded-[10px] shadow-md">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-4 py-2 bg-[#23388F] text-white rounded-[6px] gap-2 hover:bg-blue-600"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <span className="text-lg font-[Inter-SemiBold] capitalize text-gray-900">
                {`${proposal?.proposal?.student?.firstName} ${proposal?.proposal?.student?.lastName}` || "Loading..."}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 px-6">
        <div>
          <h3 className="text-sm font-[Inter-Regular] text-[#626263] mb-1">
            Proposal ID
          </h3>
          <div className="flex gap-2">
            <span className="text-sm font-[Inter-Regular] text-gray-900">
              {proposalId || "Not Available"}
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-[Inter-Regular] text-[#626263] mb-1">
            Defense Date
          </h3>
          <span className="text-sm font-[Inter-Regular] text-gray-900">
            {proposal?.proposal?.defenseDate 
              ? format(new Date(proposal.proposal.defenseDate), "MM-dd-yyyy")
              : "Not Scheduled"}
          </span>
        </div>

        <div>
          <h3 className="text-sm font-[Inter-Regular] text-[#626263] mb-1">
            Current Status
          </h3>
          <span
            style={{
              color: currentStatus?.definition?.color || "#6B7280",
              backgroundColor:
                `${currentStatus?.definition?.color}18` || "#F3F4F6",
              border: `1px solid ${
                currentStatus?.definition?.color || "#6B7280"
              }`,
            }}
            className="inline-flex px-2 py-0.5 rounded-[4px] text-sm font-[Inter-Regular] capitalize"
          >
            {currentStatus?.definition?.name || "Unknown"}
          </span>
        </div>

        <div>
          <h3 className="text-sm font-[Inter-Regular] text-[#626263] mb-1">
            Total Time
          </h3>
          <span className="text-sm font-[Inter-Regular] text-gray-900">
            {totalDays} {expectedDays && `of ${expectedDays} days`}
          </span>
        </div>
      </div>

      <div className="bg-white py-4 rounded-lg shadow-md mx-6 mb-8">
        <GradeProposalTableTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="px-4 mt-4">
          {activeTab === "Reviewers" ? (
            <GradeProposalReviewerTable reviewers={reviewers} proposalId={proposalId} refetchProposal={refetchProposal} onUpdateClick={handleReviewerUpdateClick}    />
          ) : (
            <GradeProposalPanelistTable panelists={proposal?.proposal?.panelists || []} proposalId={proposalId} onUpdateClick={handlePanelistUpdateClick} />
          )}
        </div>
      </div>

      <GradeProposalUpdateReviewerMark isOpen={isUpdateReviewerDrawerOpen} onClose={() => setIsUpdateReviewerDrawerOpen(false)} reviewer={selectedReviewer} proposalId={proposalId} proposal={proposal} />
      <GradeProposalUpdatePanelistMark isOpen={isUpdatePanelistDrawerOpen} onClose={() => setIsUpdatePanelistDrawerOpen(false)} panelist={selectedPanelist} proposalId={proposalId} proposal={proposal} />
    </div>  
  );
};

export default GradeProposal;
