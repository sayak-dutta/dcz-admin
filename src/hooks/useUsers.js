import { useState, useEffect } from 'react';
import { userAPI } from '@/lib/api';

export const useUsers = (params = {}) => {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 20,
		total: 0,
		totalPages: 0
	});

	const fetchUsers = async (searchParams = {}) => {
		setLoading(true);
		setError(null);

		try {
			const response = await userAPI.getAllUsers({
				...params,
				...searchParams
			});

			setUsers(response.data.users || response.data);
			setPagination(response.data.pagination || {
				page: searchParams.page || 1,
				limit: searchParams.limit || 20,
				total: response.data.total || response.data.length,
				totalPages: Math.ceil((response.data.total || response.data.length) / (searchParams.limit || 20))
			});
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to fetch users');
			console.error('Error fetching users:', err);
		} finally {
			setLoading(false);
		}
	};

	const banUser = async (userId, reason) => {
		try {
			await userAPI.banUser(userId, reason);
			// Refresh users list
			await fetchUsers(params);
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to ban user';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	};

	const unbanUser = async (userId) => {
		try {
			await userAPI.unbanUser(userId);
			// Refresh users list
			await fetchUsers(params);
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to unban user';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	};

	const updateUser = async (userId, userData) => {
		try {
			await userAPI.updateUser(userId, userData);
			// Refresh users list
			await fetchUsers(params);
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to update user';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	};

	useEffect(() => {
		fetchUsers(params);
	}, []);

	return {
		users,
		loading,
		error,
		pagination,
		fetchUsers,
		banUser,
		unbanUser,
		updateUser,
		refetch: () => fetchUsers(params)
	};
};
