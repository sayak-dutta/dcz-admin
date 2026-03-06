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
			const data = response.data;

			// MFA required — backend returns a short-lived tempToken instead of full JWT
			if (data?.mfaRequired || data?.mfaNotSetup) {
				return {
					success: false,
					mfaRequired: data.mfaRequired || false,
					mfaNotSetup: data.mfaNotSetup || false,
					tempToken: data.tempToken,
				};
			}

			// Normal login (no MFA configured on this account)
			const token = data?.data?.token || data?.token;
			const user = data?.data?.user || data?.user || data?.admin;

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

	// Verify TOTP code — exchanges tempToken + 6-digit code for full JWT
	const verifyMfa = useCallback(async (code, tempToken) => {
		try {
			setLoading(true);
			setError(null);

			const response = await adminAuthAPI.verifyMfa({ code }, tempToken);
			const data = response.data;

			const token = data?.data?.token || data?.token;
			const user = data?.data?.user || data?.user;

			if (token && user) {
				localStorage.setItem(STORAGE_KEYS.ADMIN_JWT_TOKEN, token);
				localStorage.setItem(STORAGE_KEYS.ADMIN_USER_DATA, JSON.stringify(user));
				setAdminUser(user);
				return { success: true };
			} else {
				throw new Error('MFA verification failed — invalid response');
			}
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Invalid or expired TOTP code';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		} finally {
			setLoading(false);
		}
	}, []);

	// Setup MFA — get QR code URI
	const setupMfa = useCallback(async (tempToken) => {
		try {
			const response = await adminAuthAPI.setupMfa(tempToken);
			return { success: true, data: response.data };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to initialize MFA setup';
			return { success: false, error: errorMessage };
		}
	}, []);

	// Confirm MFA setup — verify first code to activate TOTP
	const confirmMfaSetup = useCallback(async (code, tempToken) => {
		try {
			const response = await adminAuthAPI.confirmMfa({ code }, tempToken);
			return { success: true, data: response.data };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Invalid or expired TOTP code';
			return { success: false, error: errorMessage };
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
		verifyMfa,
		setupMfa,
		confirmMfaSetup,
		getProfile,
		checkAuthStatus,
	};
};
