import React, { useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {  X } from "lucide-react";
import { useGetFacultyProfile } from "../../store/tanstackStore/services/queries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { addReviewerMarkService } from "../../store/tanstackStore/services/api"; // Import the service
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Defense verdict options
const REVIEWER_VERDICTS = {
  PASS: "PASS",
  PASS_WITH_MINOR_CORRECTIONS: "PASS_WITH_MINOR_CORRECTIONS",
  PASS_WITH_MAJOR_CORRECTIONS: "PASS_WITH_MAJOR_CORRECTIONS",
  FAIL: "FAIL",
};

const validationSchema = Yup.object({
  verdict: Yup.string()
    .required("Verdict is required")
    .oneOf(Object.values(REVIEWER_VERDICTS), "Invalid verdict"),
  comments: Yup.string(), // Made comments optional by removing .required()
});

const GradeProposalUpdateReviewerMark = ({
  isOpen,
  onClose,
  reviewer,
  proposalId,
  proposal,
}) => {
  const { data: facultyData } = useGetFacultyProfile();
  const queryClient = useQueryClient();

  const initialValues = {
    verdict: "",
    comments: "",
  };

  useEffect(() => {
    const existingGrade = proposal?.reviewGrades?.find(
      (grade) => grade.gradedById === reviewer?.id
    );
    if (existingGrade) {
      initialValues.verdict = existingGrade.verdict || "";
      initialValues.comments = existingGrade.feedback || "";
    }
  }, [reviewer, proposal?.reviewGrades]);

  const submitGradeMutation = useMutation({
    mutationFn: async (gradeData) =>
      addReviewerMarkService(
        gradeData.proposalId,
        gradeData.gradedById,
        gradeData.verdict,
        gradeData.feedback
      ),
    onSuccess: () => {
      queryClient.resetQueries({ queryKey: ["proposal", proposalId] });
      onClose();
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
      queryClient.resetQueries({ queryKey: ["proposal", proposalId] });
      onClose();
    },
  });

  const handleSubmit = (values) => {
    const gradeData = {
      proposalId,
      verdict: values.verdict,
      feedback: values.comments || "", // Ensure empty string if comments is null/undefined
      gradedById: reviewer.id,
      submittedById: facultyData?.faculty?.id,
    };

    const existingGrade = proposal?.reviewGrades?.find(
      (grade) => grade.gradedById === reviewer?.id
    );

    if (existingGrade) {
      updateGradeMutation.mutate({
        ...gradeData,
        id: existingGrade.id,
      });
    } else {
      submitGradeMutation.mutate(gradeData);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="min-w-[440px] p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex justify-between items-center z-50">
            <SheetTitle className="text-base font-[Inter-Medium]">
              Update Reviewer's Report
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

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ errors, touched, isSubmitting, setFieldValue, values }) => (
            <Form className="p-6 space-y-6">
              {/* Reviewer Info */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 ">
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
                  <SelectTrigger className="w-full text-sm font-[Inter-Regular]">
                    <SelectValue placeholder="Select a verdict" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(REVIEWER_VERDICTS).map(([key, value]) => (
                      <SelectItem key={key} value={value}>
                        {value.replace(/_/g, " ")}
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
                  Comments (Optional)
                </Label>
                <Field
                  as={Textarea}
                  name="comments"
                  placeholder="Please enter the reviewer's feedback (optional)"
                  rows={4}
                  className="text-sm font-[Inter-Regular] !ring-0 
    !ring-offset-0 
    !outline-none
    focus:!ring-0 
    focus:!outline-none
    focus-visible:!ring-0 
    focus-visible:!outline-none "
                />
                {errors.comments && touched.comments && (
                  <div className="text-red-500 text-sm">{errors.comments}</div>
                )}
              </div>

              {/* Last Update Info */}
              {/* <div className="flex items-center gap-2 text-sm font-[Inter-Regular] text-gray-500">
                <span>
                  Last Update: {format(new Date(), "MM/dd/yyyy hh:mm:ss aa")}
                </span>
                <span>•</span>
                <span>
                  Updated by {facultyData?.faculty?.name || "DHIMS System"}
                </span>
              </div> */}

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
                  : "Confirm"}
              </Button>
            </Form>
          )}
        </Formik>
      </SheetContent>
    </Sheet>
  );
};

export default GradeProposalUpdateReviewerMark;
