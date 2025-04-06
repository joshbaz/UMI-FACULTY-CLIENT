import React, { useState } from "react";
import {
  Sheet,
  SheetContent, 
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Pencil, Percent } from "lucide-react";
import { format } from "date-fns";
import { useGetFacultyProfile } from "../../store/tanstackStore/services/queries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { addReviewerMarkService } from "../../store/tanstackStore/services/api";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Reviewer verdict options
const REVIEWER_VERDICTS = {
  PASS: 'PASS',
  PASS_WITH_MINOR_CORRECTIONS: 'PASS_WITH_MINOR_CORRECTIONS',
  PASS_WITH_MAJOR_CORRECTIONS: 'PASS_WITH_MAJOR_CORRECTIONS',
  FAIL: 'FAIL',
};

const validationSchema = Yup.object({
  verdict: Yup.string().required("Verdict is required"),
  comments: Yup.string().required("Comments are required"),
});

const GradeProposalViewReviewerMark = ({
  isOpen,
  onClose,
  reviewer,
  proposalId,
  proposal,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { data: facultyData } = useGetFacultyProfile();
  const queryClient = useQueryClient();

  const existingGrade = proposal?.reviewGrades?.find(
    (grade) => grade.gradedById === reviewer?.id
  );

  const initialValues = {
    verdict: existingGrade?.verdict || "",
    comments: existingGrade?.feedback || "",
  };

  const submitGradeMutation = useMutation({
    mutationFn: async (gradeData) => addReviewerMarkService(gradeData.proposalId, gradeData.reviewerId, gradeData.verdict, gradeData.feedback),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.resetQueries({ queryKey: ["proposal", proposalId] });
      setIsEditModalOpen(false);
    },
  });

  const updateGradeMutation = useMutation({
    mutationFn: async (gradeData) => {
      const response = await fetch(
        `/api/proposal-review-grades/${gradeData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(gradeData),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update grade");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["proposal", proposalId]);
      setIsEditModalOpen(false);
    },
  });

  const handleSubmit = (values) => {
    const gradeData = {
      proposalId,
      verdict: values.verdict,
      feedback: values.comments,
      reviewerId: reviewer.id,
      submittedById: facultyData?.faculty?.id,
    };

    if (existingGrade) {
      submitGradeMutation.mutate(gradeData);
    } else {
      submitGradeMutation.mutate(gradeData);
    }
  };

  const getVerdictLabel = (verdict) => {
    switch (verdict) {
      case 'PASS':
        return 'Pass';
      case 'PASS_WITH_MINOR_CORRECTIONS':
        return 'Pass with Minor Corrections';
      case 'PASS_WITH_MAJOR_CORRECTIONS':
        return 'Pass with Major Corrections';
      case 'FAIL':
        return 'Fail';
      default:
        return 'Not Specified';
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="min-w-[440px] p-0">
          <SheetHeader className="p-4 border-b">
            <div className="flex justify-between items-center z-50">
              <SheetTitle className="text-base font-[Inter-Medium]">
                Reviewer's Report
              </SheetTitle>
              <Button
                className="bg-primary-500 hover:bg-primary-800 text-white"
                onClick={onClose}
              >
                <X className="w-4 h-4 mr-2" />
                Close Window
              </Button>
            </div>
          </SheetHeader>

          <div className="p-6 space-y-6">
            {/* Reviewer Info */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                {reviewer?.name?.charAt(0)}
              </div>
              <div>
                <p className="text-gray-900 text-base capitalize font-[Inter-Medium]">
                  {reviewer?.name}
                </p>
                <p className="text-gray-700 font-[Inter-Regular] text-sm">
                  {reviewer?.email}
                </p>
              </div>
            </div>

            {/* Verdict */}
            <div className="space-y-2">
              <Label className="text-sm font-[Inter-Regular] text-gray-800">
                Verdict
              </Label>
              <div className="text-lg font-[Inter-Medium]">
                {existingGrade?.verdict ? getVerdictLabel(existingGrade.verdict) : "Not specified"}
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-2">
              <Label className="text-sm font-[Inter-Regular] text-gray-800">
                Comments
              </Label>
              <div className="p-4 bg-gray-50 rounded-md text-sm font-[Inter-Regular] text-gray-700">
                {existingGrade?.feedback || "No comments provided"}
              </div>
            </div>

         

            {/* Edit Button */}
            <Button
              onClick={() => setIsEditModalOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit Report
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Reviewer's Report</DialogTitle>
          </DialogHeader>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ errors, touched, isSubmitting, setFieldValue, values }) => (
              <Form className="space-y-6">
                {/* Verdict Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-[Inter-Regular] text-gray-800">
                    Verdict
                  </Label>
                  <Select
                    name="verdict"
                    value={values.verdict}
                    onValueChange={(value) => setFieldValue("verdict", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a verdict" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(REVIEWER_VERDICTS).map(([key, value]) => (
                        <SelectItem key={key} value={value}>
                          {getVerdictLabel(value)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.verdict && touched.verdict && (
                    <div className="text-red-500 text-sm">{errors.verdict}</div>
                  )}
                </div>

                {/* Comments */}
                <div className="space-y-2">
                  <Label className="text-sm font-[Inter-Regular] text-gray-800">
                    Comments
                  </Label>
                  <Field
                    as={Textarea}
                    name="comments"
                    placeholder="Please enter the reviewer's feedback"
                    rows={4}
                    className="text-sm font-[Inter-Regular] !ring-0 !ring-offset-0 !outline-none"
                  />
                  {errors.comments && touched.comments && (
                    <div className="text-red-500 text-sm">{errors.comments}</div>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={
                    isSubmitting ||
                    submitGradeMutation.isPending ||
                    updateGradeMutation.isPending
                  }
                >
                  {submitGradeMutation.isPending || updateGradeMutation.isPending
                    ? "Saving..."
                    : "Save Changes"}
                </Button>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GradeProposalViewReviewerMark;