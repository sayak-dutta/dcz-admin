import { useState, useEffect } from 'react';
import { verificationAPI } from '@/lib/api';

export const useVerifications = (params = {}) => {
	const [verifications, setVerifications] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [stats, setStats] = useState({
		pendingVerifications: 0,
		approvedToday: 0,
		rejectedToday: 0,
		avgReviewTime: '0h'
	});

	const fetchVerifications = async (searchParams = {}) => {
		setLoading(true);
		setError(null);

		try {
			const response = await verificationAPI.getPendingVerifications({
				...params,
				...searchParams
			});

			setVerifications(response.data.verifications || response.data);

			// Update stats if provided
			if (response.data.stats) {
				setStats(response.data.stats);
			}
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to fetch verifications');
			console.error('Error fetching verifications:', err);
		} finally {
			setLoading(false);
		}
	};

	const approveVerification = async (verificationId) => {
		try {
			await verificationAPI.approveVerification(verificationId);
			// Refresh verifications list
			await fetchVerifications(params);
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to approve verification';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	};

	const rejectVerification = async (verificationId, reason) => {
		try {
			await verificationAPI.rejectVerification(verificationId, reason);
			// Refresh verifications list
			await fetchVerifications(params);
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to reject verification';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	};

	const requestNewVerification = async (userId, message) => {
		try {
			await verificationAPI.requestNewVerification(userId, message);
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to request new verification';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	};

	useEffect(() => {
		fetchVerifications(params);
	}, []);

	return {
		verifications,
		loading,
		error,
		stats,
		fetchVerifications,
		approveVerification,
		rejectVerification,
		requestNewVerification,
		refetch: () => fetchVerifications(params)
	};
};
