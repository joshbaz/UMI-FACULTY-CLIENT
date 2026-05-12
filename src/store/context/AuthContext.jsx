import { createContext, useEffect, useState, useCallback } from "react";
import { queryClient } from "@/utils/tanstack";

export const AuthContext = createContext();
const TOKEN_STORAGE_KEY = 'umi_auth_token';

export const AuthContextProvider = ({ children }) => {
    const [token, setToken] = useState(() => {
        return localStorage.getItem(TOKEN_STORAGE_KEY) || null;
    });

    const updateUser = useCallback((data) => {
        // Clear all cached queries from the previous user before setting the new token
        queryClient.clear();
        setToken(data.token);
        localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        // Clear all cached queries so the next user gets fresh data
        queryClient.clear();
    }, []);

    useEffect(() => {
        if (token) {
            localStorage.setItem(TOKEN_STORAGE_KEY, token);
        }
    }, [token]);

    return (
        <AuthContext.Provider value={{ token, updateUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
