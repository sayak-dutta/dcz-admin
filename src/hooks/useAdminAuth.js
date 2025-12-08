import { useState, useEffect, useCallback } from 'react';
import { adminAuthAPI } from '@/lib/adminApi';
import { STORAGE_KEYS } from '@/lib/config';

export const useAdminAuth = () => {
	const [adminUser, setAdminUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const login = useCallback(async (credentials) => {
		try {
			setLoading(true);
			setError(null);

			const response = await adminAuthAPI.login(credentials);
			console.log('Login response:', response.data);

			// Handle different possible response formats
			const token = response.data?.data?.token || response.data?.token;
			const user = response.data?.data?.user || response.data?.user || response.data?.admin;

			if (token && user) {
				localStorage.setItem(STORAGE_KEYS.ADMIN_JWT_TOKEN, token);
				localStorage.setItem(STORAGE_KEYS.ADMIN_USER_DATA, JSON.stringify(user));
				setAdminUser(user);
				return { success: true };
			} else {
				throw new Error('Invalid response format - missing token or user data');
			}
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Login failed';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		} finally {
			setLoading(false);
		}
	}, []);

	const logout = useCallback(async () => {
		try {
			await adminAuthAPI.logout();
			setAdminUser(null);
			setError(null);
		} catch (err) {
			console.error('Logout error:', err);
		}
	}, []);

	const getProfile = useCallback(async () => {
		try {
			const response = await adminAuthAPI.getProfile();
			if (response.data) {
				localStorage.setItem(STORAGE_KEYS.ADMIN_USER_DATA, JSON.stringify(response.data));
				setAdminUser(response.data);
				return response.data;
			}
		} catch (err) {
			console.error('Failed to get admin profile:', err);
			logout();
			return null;
		}
	}, [logout]);

	const checkAuthStatus = useCallback(async () => {
		const token = localStorage.getItem(STORAGE_KEYS.ADMIN_JWT_TOKEN);
		const userData = localStorage.getItem(STORAGE_KEYS.ADMIN_USER_DATA);

		if (!token) {
			setLoading(false);
			return false;
		}

		if (userData) {
			try {
				setAdminUser(JSON.parse(userData));
				setLoading(false);
				return true;
			} catch (err) {
				console.error('Failed to parse stored admin user data:', err);
			}
		}

		// If we have token but no user data, try to get profile
		const profile = await getProfile();
		setLoading(false);
		return !!profile;
	}, [getProfile]);

	useEffect(() => {
		checkAuthStatus();
	}, [checkAuthStatus]);

	const isAuthenticated = !!adminUser;

	return {
		adminUser,
		loading,
		error,
		isAuthenticated,
		login,
		logout,
		getProfile,
		checkAuthStatus,
	};
};
