import React, { useContext } from 'react'
import {Outlet, Navigate} from 'react-router-dom'
import { AuthContext } from '../store/context/AuthContext';

const OrdinaryRoutes = () => {
    const { token } = useContext(AuthContext);
  return(
    <>
      {token ? (
        <Navigate to="/dashboard" replace />
      ) : (
        <Outlet />
      )}
    </>
  )
};

export default OrdinaryRoutes;