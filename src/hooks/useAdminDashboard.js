import { useState, useEffect, useCallback } from 'react';
import { adminDashboardAPI } from '@/lib/adminApi';

export const useAdminDashboard = () => {
	const [stats, setStats] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const fetchStats = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			const response = await adminDashboardAPI.getStats();
			setStats(response.data.data);

			return response.data.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch dashboard stats';
			setError(errorMessage);
			console.error('Dashboard stats error:', err);
			return null;
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchStats();
	}, [fetchStats]);

	return {
		stats,
		loading,
		error,
		fetchStats,
		refetch: () => fetchStats(),
	};
};
