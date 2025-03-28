import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../store/context/AuthContext";

const ProtectedRoutes = ({children}) => {
  const { token } = useContext(AuthContext);
  return (
    <>
      {token ? (
      
              children
          
      ) : (
        <Navigate to="/login" replace />
      )}
    </>
  );
};

export default ProtectedRoutes;
