/* eslint-disable react/prop-types */
import { X } from 'lucide-react'
import { DUMMY_DATA } from './NotificationsManagement'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent
} from "@/components/ui/sheet"

const NotificationDrawer = ({ isOpen, onClose, notificationId }) => {
  // Find the notification data based on the ID
  const notificationData = DUMMY_DATA.find(item => item.id === notificationId) || {
    id: 2,
    type: "Proposal Submission Delayed",
    studentName: "Apio Asiimwe",
    priority: "Important",
    remarks: "Submission overdue by 7 days",
  }

  // Default student data
  const data = {
    name: notificationData.studentName,
    studentId: 'C5X2Q4Y3V',
    type: 'Masters Student',
    dateOfAdmission: '29/01/2025',
    currentStatus: 'Normal Progress',
    totalTime: '120 days',
    notificationType: notificationData.type,
    notificationDetail: notificationData.remarks,
    system: 'DRIMS System',
    timeAgo: '2 hours ago'
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[500px] bg-background p-0">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex justify-center py-4 mt-8 mb-5">
            <Card className="w-[460px]">
              <CardHeader className="p-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  Notification
                </CardTitle>
                <Button
                  onClick={onClose}
                  variant="primary"
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  <span>Close Window</span>
                </Button>
              </CardHeader>
            </Card>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col items-center space-y-6 mt-4">
            {/* Profile Container */}
            <Card className="w-[460px]">
              <CardContent className="p-4 flex justify-between items-start">
                <div className="flex gap-3">
                  <Avatar className="w-10 h-10 bg-muted">
                    <AvatarFallback className="text-white text-sm font-medium">
                      {data.name?.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-foreground font-medium">{data.name}</h3>
                    <p className="text-muted-foreground text-sm">{data.type}</p>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Student ID</p>
                  <p className="text-foreground">{data.studentId}</p>
                </div>
              </CardContent>
            </Card>

            {/* Details Container */}
            <Card className="w-[460px]">
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-muted-foreground text-sm">Date of Admission</p>
                    <p className="text-foreground">{data.dateOfAdmission}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Current Status</p>
                    <Badge variant="success" className="mt-1">
                      {data.currentStatus}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Total Time</p>
                    <p className="text-foreground">{data.totalTime}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Container */}
            <Card className="w-[460px]">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-foreground font-medium mb-1">
                      {data.notificationType}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {data.notificationDetail}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={onClose}
                  >
                    Notify Admin
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-yellow-100 rounded-full w-6 h-6 flex items-center justify-center">
                      <span className="text-yellow-800 text-xs">⚠</span>
                    </div>
                    <span className="text-muted-foreground text-sm">{data.system}</span>
                  </div>
                  <span className="text-muted-foreground text-sm">{data.timeAgo}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default NotificationDrawer
