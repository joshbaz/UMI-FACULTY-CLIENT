import React from "react";
import { format, parseISO } from "date-fns";

const ViewStudentPersonalInfo = ({ studentData }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-[Inter-SemiBold] text-gray-900">
          Personal Information
        </h2>
      </div>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-[Inter-Medium] text-gray-700">
              Title
            </label>
            <div className="mt-2 p-2 bg-gray-50 text-base text-[Inter-Regular] rounded-[6px] border border-gray-200 capitalize">
              {studentData?.student?.title || "N/A"}
            </div>
          </div>
          <div>
            <label className="block text-sm font-[Inter-Medium] text-gray-700">
              Full Name
            </label>
            <div className="mt-2 p-2 bg-gray-50 text-base text-[Inter-Regular] rounded-[6px] border border-gray-200 capitalize">
              {studentData?.student?.firstName} {studentData?.student?.lastName}
            </div>
          </div>
          <div>
            <label className="block text-sm font-[Inter-Medium] text-gray-700">
              Email
            </label>
            <div className="mt-2 p-2 bg-gray-50 text-base text-[Inter-Regular] rounded-[6px] border border-gray-200">
              {studentData?.student?.email || "N/A"}
            </div>
          </div>
          <div>
            <label className="block text-sm font-[Inter-Medium] text-gray-700">
              Phone Number
            </label>
            <div className="mt-2 p-2 bg-gray-50 text-base text-[Inter-Regular] rounded-[6px] border border-gray-200">
              {studentData?.student?.phoneNumber || "N/A"}
            </div>
          </div>
          <div>
            <label className="block text-sm font-[Inter-Medium] text-gray-700">
              Date of Birth
            </label>
            <div className="mt-2 p-2 bg-gray-50 text-base text-[Inter-Regular] rounded-[6px] border border-gray-200">
              {studentData?.student?.dateOfBirth
                ? format(
                    parseISO(studentData.student.dateOfBirth),
                    "yyyy-MM-dd"
                  )
                : "N/A"}
            </div>
          </div>
          <div>
            <label className="block text-sm font-[Inter-Medium] text-gray-700">
              Gender
            </label>
            <div className="mt-2 p-2 bg-gray-50 capitalize text-base text-[Inter-Regular] rounded-[6px] border border-gray-200">
              {studentData?.student?.gender || "N/A"}
            </div>
          </div>
          <div>
            <label className="block text-sm font-[Inter-Medium] text-gray-700">
              School
            </label>
            <div className="mt-2 p-2 bg-gray-50 text-base text-[Inter-Regular] rounded-[6px] border border-gray-200">
              {studentData?.student?.school?.name || "N/A"}
            </div>
          </div>
          <div>
            <label className="block text-sm font-[Inter-Medium] text-gray-700">
              Campus
            </label>
            <div className="mt-2 p-2 bg-gray-50 text-base text-[Inter-Regular] rounded-[6px] border border-gray-200">
              {studentData?.student?.campus?.name || "N/A"}
            </div>
          </div>
          <div>
            <label className="block text-sm font-[Inter-Medium] text-gray-700">
              Department
            </label>
            <div className="mt-2 p-2 bg-gray-50 text-base text-[Inter-Regular] rounded-[6px] border border-gray-200">
              {studentData?.student?.department?.name || "N/A"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewStudentPersonalInfo;
