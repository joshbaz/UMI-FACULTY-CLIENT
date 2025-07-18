import { useState } from "react";
// import './App.css'
import { toast } from "sonner";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
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
import RequestPasswordReset from "./views/0.Auth/RequestPasswordReset";
import ResetPassword from "./views/0.Auth/ResetPassword";
import GradeProposalAddReviewers from "./views/3.GradeManagement/GradeProposalAddReviewers";
import GradeProposalScheduleDefense from "./views/3.GradeManagement/GradeProposalScheduleDefense";
import FacultyManagement from "./views/4.faculty/FacultyManagement";
import AddSupervisor from "./views/4.faculty/AddSupervisor";
import SupervisorProfile from "./views/4.faculty/SupervisorProfile";
import AssignStudents from "./views/4.faculty/AssignStudents";
import ChangeSupervisor from "./views/2.StudentManagement/ChangeSupervisor";
import PWAInstaller from "./components/PWAInstaller";
// import ResetPassword from "./views/0.Auth/ResetPassword";

function App() {
  return (
    <>
      <PWAInstaller />
      <AuthContextProvider>
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoutes>
                  {" "}
                  <DashboardLayout />{" "}
                </ProtectedRoutes>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              {/** Student Management */}
              <Route path="students" element={<StudentManagement />} />
              <Route path="students/profile/:id" element={<StudentProfile />} />

              <Route
                path="students/submit-proposal/:id"
                element={<SubmitStudentProposal />}
              />
               <Route path="students/change-supervisor/:id" element={<ChangeSupervisor/>} />

              {/** Grade Management */}
              <Route path="grades" element={<GradeManagement />} />
              <Route path="grades/proposal/:id" element={<GradeProposal />} />
              <Route
                path="grades/proposal/add-reviewer/:id"
                element={<GradeProposalAddReviewers />}
              />
              <Route
                path="grades/proposal/schedule-defense/:id"
                element={<GradeProposalScheduleDefense />}
              />
              <Route path="grades/book/:id" element={<GradeBook />} />

              <Route
                path="grades/book/add-internal-examiner/:id"
                element={<GradeBookAddInternalExaminer />}
              />

              {/** Faculty Management */}
              <Route path="faculty" element={<FacultyManagement />} />
              <Route
                path="faculty/supervisor/add"
                element={<AddSupervisor />}
              />
              <Route
                path="faculty/supervisor/profile/:id"
                element={<SupervisorProfile />}
              />
              <Route
                path="faculty/assign-students/:id"
                element={<AssignStudents />}
              />

              {/* <Route path="faculty/profile/:id" element={<FacultyProfile />} /> */}
              <Route
                path="notifications"
                element={<NotificationsManagement />}
              />
              <Route path="statistics" element={<FacultyStatsManagement />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route element={<OrdinaryRoutes />}>
              <Route path="/login" element={<Login />} />
              <Route
                path="/request-password-reset"
                element={<RequestPasswordReset />}
              />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>
          </Routes>
        </Router>
      </AuthContextProvider>
    </>
  );
}

export default App;
