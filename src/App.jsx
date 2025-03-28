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
