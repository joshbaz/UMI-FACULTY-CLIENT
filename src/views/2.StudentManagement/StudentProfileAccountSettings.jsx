import React, { useState, useCallback } from "react";
import ViewStudentPersonalInfo from "./Forms/ViewStudentPersonalInfo";
import ViewStudentCourseApplication from "./Forms/ViewStudentCourseApplication";

const STEPS = [
  { id: 1, description: "Personal Information" },
  { id: 2, description: "Course Application Summary" },
];

const StudentProfileAccountSettings = ({ studentData }) => {
  const [currentStep, setCurrentStep] = useState(1);
 

  const handleNext = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  }, []);

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleStepClick = useCallback((stepId) => {
    setCurrentStep(stepId);
  }, []);

  //handle display form
  const FormDisplay = useCallback((step) => {
    switch (step) {
      case 1:
        return <ViewStudentPersonalInfo studentData={studentData} />;
      case 2:
        return <ViewStudentCourseApplication studentData={studentData} />;
      default:
        return null;
    }
  }, [studentData]);

  return (
    <div className="mt-6 mb-8 bg-white rounded-[6px] shadow mx-6">
      {/* Stepper */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {STEPS.map((step) => {
            return (
              <button
                key={step.id}
                onClick={() => handleStepClick(step.id)}
                className={`px-6 py-3 text-sm font-[Inter-Medium] border-b-2 ${
                  currentStep === step.id
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {step.description}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        {FormDisplay(currentStep)}

        {/** navigation buttons */}
        <div className="mt-8 flex justify-end gap-8">
          <button
            onClick={handleBack}
            className={`px-4 py-2 text-sm font-[Inter-Medium] rounded-[6px] border border-gray-300 ${
              currentStep === 1
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-50"
            }`}
            disabled={currentStep === 1}
          >
            Previous Step
          </button>
          <button
            onClick={handleNext}
            className={`px-4 py-2 text-sm font-medium text-gray-700 border-2 border-gray-200 rounded-md hover:text-gray-500 bg-gray-50 ${
              currentStep === STEPS.length
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            disabled={currentStep === STEPS.length}
          >
            Next Step
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileAccountSettings;
