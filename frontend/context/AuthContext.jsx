import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { jwtDecode } from "jwt-decode";
import useCartStore from '../stores/useCartStore';
import useWishlistStore from '../stores/useWishlistStore';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const refreshTimeoutRef = useRef(null);

    const fetchCart = useCartStore(state => state.fetchCart);
    const fetchWishlist = useWishlistStore(state => state.fetchWishlist);
    const clearCart = useCartStore(state => state.clearCart);
    const clearWishlist = useWishlistStore(state => state.clearWishlist);

    // Function to refresh user state from current token
    const refreshUser = () => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check if token is expired
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    setIsAuthenticated(true);
                    setUser({ ...decoded });
                    // Schedule next refresh
                    scheduleTokenRefresh(token);
                }
            } catch (error) {
                console.error("Invalid token:", error);
                logout();
            }
        }
    };

    // Function to proactively refresh the token
    const scheduleTokenRefresh = (token) => {
        // Clear any existing timeout
        if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
        }

        try {
            const decoded = jwtDecode(token);
            const expiryTime = decoded.exp * 1000;
            const currentTime = Date.now();

            // Refresh 2 minutes before expiry (28th minute if 30 min lifetime)
            const refreshTime = expiryTime - currentTime - (2 * 60 * 1000);

            if (refreshTime > 0) {
                console.log(`Scheduling token refresh in ${Math.round(refreshTime / 1000 / 60)} minutes`);
                refreshTimeoutRef.current = setTimeout(async () => {
                    const refreshToken = localStorage.getItem('refresh_token');
                    if (refreshToken) {
                        try {
                            const response = await api.post('refresh/', { refresh: refreshToken });
                            const { access } = response.data;
                            localStorage.setItem('access_token', access);

                            // Re-schedule for the new token
                            scheduleTokenRefresh(access);

                            // Update user state if needed (e.g. if token content changed)
                            const newDecoded = jwtDecode(access);
                            setUser({ ...newDecoded });

                            console.log("Proactive token refresh successful");
                        } catch (error) {
                            console.error("Proactive token refresh failed:", error);
                            logout();
                        }
                    }
                }, refreshTime);
            } else {
                // If it's already within 2 minutes of expiry, refresh immediately
                console.log("Token expiring soon, refreshing immediately");
                // We'll let the axios interceptor or initializeAuth handle this if needed, 
                // but for a smooth experience we could trigger a refresh here.
            }
        } catch (error) {
            console.error("Error scheduling refresh:", error);
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    // Check if token is expired
                    if (decoded.exp * 1000 < Date.now()) {
                        logout();
                    } else {
                        setIsAuthenticated(true);
                        setUser({ ...decoded });
                        // Fetch cart and wishlist once authenticated
                        fetchCart();
                        fetchWishlist();
                        // Schedule proactive refresh
                        scheduleTokenRefresh(token);
                    }
                } catch (error) {
                    console.error("Invalid token:", error);
                    logout();
                }
            }
            setLoading(false);
        };

        initializeAuth();

        // Listen for token refresh events from axios interceptor
        const handleTokenRefresh = (event) => {
            console.log("Token refreshed, updating user state");
            refreshUser();
        };

        // Listen for logout events from axios interceptor
        const handleAuthLogout = () => {
            console.log("Auth logout event received");
            logout();
        };

        window.addEventListener('tokenRefreshed', handleTokenRefresh);
        window.addEventListener('authLogout', handleAuthLogout);

        return () => {
            window.removeEventListener('tokenRefreshed', handleTokenRefresh);
            window.removeEventListener('authLogout', handleAuthLogout);
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }
        };
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('login/', { email, password });
            const { access, refresh } = response.data;

            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            const decoded = jwtDecode(access);
            setUser({ ...decoded });
            setIsAuthenticated(true);

            // Schedule proactive refresh
            scheduleTokenRefresh(access);

            // Fetch cart and wishlist on login
            fetchCart();
            fetchWishlist();

            return { success: true };
        } catch (error) {
            // Don't log full stack for common auth errors
            if (error.response?.status !== 401) {
                console.error('Login failed:', error);
            }
            return {
                success: false,
                error: error.response?.data?.detail || error.response?.data || 'Login failed'
            };
        }
    };

    const register = async (userData) => {
        try {
            await api.post('register/', userData);
            // Optionally auto-login or require login after register
            return { success: true };
        } catch (error) {
            console.error('Registration failed:', error);
            return {
                success: false,
                error: error.response?.data || 'Registration failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        setIsAuthenticated(false);
        if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
        }
        // Clear stores on logout
        clearCart();
        clearWishlist();
    };

    const resetPassword = async (email) => {
        try {
            await api.post('password-reset/', { email });
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Request failed'
            };
        }
    };

    const confirmPasswordReset = async (uid, token, new_password) => {
        try {
            await api.post('password-reset-confirm/', {
                uid,
                token,
                new_password
            });
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Reset failed'
            };
        }
    };

    const updateProfile = async (userData) => {
        try {
            const response = await api.patch('profile/', userData);
            const updatedUser = response.data;

            // Update local user state
            // Maintain other fields that might be in the token but not in the response (like user_id if not returned)
            setUser(prev => ({ ...prev, ...updatedUser }));

            // Optional: If we want to persist name changes in token we'd need a new token, 
            // but for now we trust the API response.

            return { success: true, data: updatedUser };
        } catch (error) {
            console.error('Update profile failed:', error);
            return {
                success: false,
                error: error.response?.data || 'Update failed'
            };
        }
    };

    const changePassword = async (passwordData) => {
        try {
            await api.put('change-password/', passwordData);
            return { success: true };
        } catch (error) {
            console.error('Change password failed:', error);
            return {
                success: false,
                error: error.response?.data || 'Change password failed'
            };
        }
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        resetPassword,
        confirmPasswordReset,
        updateProfile,
        changePassword
    };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
