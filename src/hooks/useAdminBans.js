import { useState, useEffect, useCallback } from 'react';
import { adminBansAPI, adminUsersAPI } from '@/lib/adminApi';

export const useAdminBans = () => {
	const [bans, setBans] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 0,
		totalBans: 0,
		hasNext: false,
		hasPrev: false,
	});

	const fetchBans = useCallback(async (params = {}) => {
		try {
			setLoading(true);
			setError(null);

			const response = await adminBansAPI.getAllBans(params);

			setBans(response.data.data.bans || response.data.data || []);
			setPagination(response.data.data.pagination || {
				currentPage: params.page || 1,
				totalPages: Math.ceil((response.data.data.totalBans || response.data.data.length || 0) / (params.limit || 20)),
				totalBans: response.data.data.totalBans || response.data.data.length || 0,
				hasNext: false,
				hasPrev: false,
			});

			return response.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch bans';
			setError(errorMessage);
			console.error('Bans fetch error:', err);
			return null;
		} finally {
			setLoading(false);
		}
	}, []);

	const getBanDetails = useCallback(async (userId) => {
		try {
			const response = await adminBansAPI.getBanDetails(userId);
			return response.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch ban details';
			setError(errorMessage);
			throw new Error(errorMessage);
		}
	}, []);

	const unbanUser = useCallback(async (userData) => {
		try {
			await adminUsersAPI.unbanUser(userData);
			await fetchBans(); // Refresh the list after unban
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to unban user';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	}, [fetchBans]);

	return {
		bans,
		loading,
		error,
		pagination,
		fetchBans,
		getBanDetails,
		unbanUser,
		refetch: fetchBans,
	};
};
