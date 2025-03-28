import { createContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export const AuthContext = createContext();
const TOKEN_STORAGE_KEY = 'umi_auth_token';

export const AuthContextProvider = ({ children }) => {
    const [token, setToken] = useState(() => {
        return localStorage.getItem(TOKEN_STORAGE_KEY) || null;
    });

    const updateUser = (data) => {
        setToken(data.token);
        <Navigate to="/" replace />
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        <Navigate to="/login" replace />
    };

    useEffect(() => {
        if (!token) {
            <Navigate to="/login" replace />
        } else {
            localStorage.setItem(TOKEN_STORAGE_KEY, token);
        }
    }, [token]);

    return (
        <AuthContext.Provider value={{ token, updateUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
