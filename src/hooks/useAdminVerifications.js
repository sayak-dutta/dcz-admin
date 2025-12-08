import { useState, useEffect, useCallback } from 'react';
import { adminVerificationsAPI } from '@/lib/adminApi';

export const useAdminVerifications = (initialParams = {}) => {
	const [verifications, setVerifications] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [stats, setStats] = useState({
		pending: 0,
		approved: 0,
		rejected: 0,
		total: 0,
	});

	const fetchVerifications = useCallback(async (params = {}) => {
		try {
			setLoading(true);
			setError(null);

			const queryParams = { ...initialParams, ...params };
			const response = await adminVerificationsAPI.getAllVerifications(queryParams);

			setVerifications(response.data.verifications || response.data || []);

			// Update stats if provided
			if (response.data.stats) {
				setStats(response.data.stats);
			}

			return response.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch verifications';
			setError(errorMessage);
			console.error('Verifications fetch error:', err);
			return null;
		} finally {
			setLoading(false);
		}
	}, [initialParams]);

	const getVerificationDetails = useCallback(async (verificationId) => {
		try {
			const response = await adminVerificationsAPI.getVerificationDetails(verificationId);
			return response.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch verification details';
			setError(errorMessage);
			throw new Error(errorMessage);
		}
	}, []);

	const approveVerification = useCallback(async (verificationId) => {
		try {
			await adminVerificationsAPI.approveVerification(verificationId);
			await fetchVerifications(); // Refresh the list
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to approve verification';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	}, [fetchVerifications]);

	const rejectVerification = useCallback(async (verificationId, reason) => {
		try {
			await adminVerificationsAPI.rejectVerification(verificationId, { reason });
			await fetchVerifications(); // Refresh the list
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to reject verification';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	}, [fetchVerifications]);

	useEffect(() => {
		fetchVerifications();
	}, [fetchVerifications]);

	return {
		verifications,
		loading,
		error,
		stats,
		fetchVerifications,
		getVerificationDetails,
		approveVerification,
		rejectVerification,
		refetch: () => fetchVerifications(),
	};
};
