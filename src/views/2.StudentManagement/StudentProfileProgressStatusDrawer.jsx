import React, { useMemo, useCallback } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { X } from "lucide-react"
import { useNavigate } from "react-router-dom"

const StudentProfileProgressStatusDrawer = ({ isOpen, onClose, studentId, studentData, selectedStatus }) => {
  const navigate = useNavigate();

  // Memoize calculations and data formatting
  const { totalDays, data } = useMemo(() => {
    const startDate = selectedStatus?.startDate ? new Date(selectedStatus.startDate) : null;
    const endDate = selectedStatus?.endDate ? new Date(selectedStatus.endDate) : new Date();
    const totalDays = startDate ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) : 0;

    const data = {
      name: studentData?.firstName + " " + studentData?.lastName,
      studentId: studentData?.id,
      type: studentData?.programLevel,
      email: studentData?.email,
      currentStatus: selectedStatus?.definition?.name,
      statusColor: selectedStatus?.definition?.color,
      admissionDate: studentData?.createdAt ? new Date(studentData.createdAt).toLocaleDateString() : '',
      statusStartDate: startDate?.toLocaleDateString(),
      statusEndDate: selectedStatus?.endDate ? endDate.toLocaleDateString() : 'Current',
      totalTime: `${totalDays} days`,
    };

    return { totalDays, data };
  }, [studentData, selectedStatus]);

  // Memoize handlers
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleNavigateToProfile = useCallback(() => {
    navigate(`/students/profile/${data.studentId}`);
  }, [navigate, data.studentId]);

  // Memoize avatar text
  const avatarText = useMemo(() => {
    return data.name
      ?.split(" ")
      .map((n) => n[0])
      .join("");
  }, [data.name]);

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent side="right" hideCloseButton className="bg-gray-100 px-0 flex min-w-[600px] w-fit">
        <div className="flex flex-1 w-full h-full flex-col z-50">
          {/* Header */}
          <div className="flex justify-center py-4 mt-0 mb-0">
            <div className="flex justify-between items-center bg-white rounded-lg border p-4 mx-2 w-full">
              <SheetHeader>
                <SheetTitle className="text-base font-medium text-gray-900 capitalize">
                  Status Details
                </SheetTitle>
              </SheetHeader>
              <Button
                onClick={handleClose}
                className="bg-primary-500 hover:bg-primary-800 text-white"
                size="sm"
              >
                <X className="h-4 w-4 mr-2" />
                Close Window
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex flex-col items-center  space-y-6 px-4 pb-6">
              {/* Profile Container */}
              <div className="flex justify-center">
                <div className="flex justify-between items-start bg-transparent py-2 px-2 w-[560px]">
                  <div className="flex gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-gray-400 text-white">
                        {avatarText}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-gray-900 font-medium">
                        {data.name}
                      </h3>
                      <p className="text-gray-600 text-sm capitalize">
                        {data.type}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">
                      Student ID
                    </p>
                    <p className="text-gray-900 text-sm font-medium">
                      {data.studentId}
                    </p>
                  </div>
                </div>
              </div>

              {/* Details Container */}
              <div className="flex justify-center">
                <div className="bg-transparent px-2 w-[560px]">
                  <div className="grid grid-cols-3 gap-4 place-items-center">
                    <div>
                      <p className="text-gray-600 text-sm">
                        Status Start Date
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-gray-900 text-sm font-medium">
                          {data.statusStartDate}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">
                        Status
                      </p>
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium capitalize"
                        style={{
                          color: data.statusColor,
                          backgroundColor: `${data.statusColor}18`,
                          border: `1px solid ${data.statusColor}`,
                        }}
                      >
                        {data.currentStatus}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">
                        Total Time
                      </p>
                      <span className="text-gray-500 font-medium text-sm">
                        {data.totalTime}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* More Details Button */}
              <div className="absolute bottom-2  mx-auto hidden">
                <Button
                  onClick={handleNavigateToProfile}
                  variant="outline"
                  className="bg-primary-500 text-white hover:text-primary-500 hover:border-primary-500"
                >
                  View More Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default React.memo(StudentProfileProgressStatusDrawer)