import { useState } from "react";
// import './App.css'
import { toast } from "sonner";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./views/1.Dashboard/Dashboard";
import StudentManagement from "./views/2.StudentManagement/StudentManagement";
import ProtectedRoutes from "./routes/ProtectedRoutes";
import OrdinaryRoutes from "./routes/OrdinaryRoutes";
import Login from "./views/0.Auth/Login";
import DashboardLayout from "./layouts/DashboardLayout";
import { AuthContextProvider } from "./store/context/AuthContext";
import StudentProfile from "./views/2.StudentManagement/StudentProfile";
import GradeManagement from "./views/3.GradeManagement/GradeManagement";
import SubmitStudentProposal from "./views/2.StudentManagement/StudentSubmitProposal";
import GradeProposal from "./views/3.GradeManagement/GradeProposal";
import NotificationsManagement from "./views/4.Notifications/NotificationsManagement";
import Settings from "./views/5.Settings/Settings";
import GradeBook from "./views/3.GradeManagement/GradeBook";
import GradeBookAddInternalExaminer from "./views/3.GradeManagement/GradeBookAddInternalExaminer";
import FacultyStatsManagement from "./views/6.FacultyStatistics/FacultyStatsManagement";
function App() {
  return (
    <>
     <AuthContextProvider>
     <Router>
        <Routes>
          <Route path="/" element={<ProtectedRoutes> <DashboardLayout /> </ProtectedRoutes>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="students/profile/:id" element={<StudentProfile />} />
            <Route path="students/submit-proposal/:id" element={<SubmitStudentProposal />} />

            <Route path="grades" element={<GradeManagement />} />
            <Route path="grades/proposal/:id" element={<GradeProposal />} />
            <Route path="grades/book/:id" element={<GradeBook />} />
            <Route path="grades/book/add-internal-examiner/:id" element={<GradeBookAddInternalExaminer />} />
            <Route path="notifications" element={<NotificationsManagement />} />
            <Route path="statistics" element={<FacultyStatsManagement />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route  element={<OrdinaryRoutes />}>
            <Route path="/login" element={<Login />} />
          </Route>
        </Routes>
      </Router>

     </AuthContextProvider>
     
    </>
  );
}

export default App;
