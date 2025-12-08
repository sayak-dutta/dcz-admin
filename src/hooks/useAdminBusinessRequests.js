import { useState, useEffect, useCallback } from 'react';
import { adminBusinessRequestsAPI } from '@/lib/adminApi';

export const useAdminBusinessRequests = (initialParams = {}) => {
	const [businessRequests, setBusinessRequests] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const fetchBusinessRequests = useCallback(async (params = {}) => {
		try {
			setLoading(true);
			setError(null);

			const queryParams = { ...initialParams, ...params };
			const response = await adminBusinessRequestsAPI.getAllBusinessRequests(queryParams);

			setBusinessRequests(response.data.businessRequests || response.data || []);
			return response.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch business requests';
			setError(errorMessage);
			console.error('Business requests fetch error:', err);
			return null;
		} finally {
			setLoading(false);
		}
	}, [initialParams]);

	const getBusinessRequestDetails = useCallback(async (requestId) => {
		try {
			const response = await adminBusinessRequestsAPI.getBusinessRequestDetails(requestId);
			return response.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch business request details';
			setError(errorMessage);
			throw new Error(errorMessage);
		}
	}, []);

	const approveBusinessRequest = useCallback(async (requestId) => {
		try {
			await adminBusinessRequestsAPI.approveBusinessRequest(requestId);
			await fetchBusinessRequests(); // Refresh the list
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to approve business request';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	}, [fetchBusinessRequests]);

	const rejectBusinessRequest = useCallback(async (requestId, reason) => {
		try {
			await adminBusinessRequestsAPI.rejectBusinessRequest(requestId, { reason });
			await fetchBusinessRequests(); // Refresh the list
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to reject business request';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	}, [fetchBusinessRequests]);

	useEffect(() => {
		fetchBusinessRequests();
	}, [fetchBusinessRequests]);

	return {
		businessRequests,
		loading,
		error,
		fetchBusinessRequests,
		getBusinessRequestDetails,
		approveBusinessRequest,
		rejectBusinessRequest,
		refetch: () => fetchBusinessRequests(),
	};
};
