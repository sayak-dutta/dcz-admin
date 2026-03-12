import { useState, useEffect, useCallback } from 'react';
import { adminUsersAPI, adminUsersMgmtAPI } from '@/lib/adminApi';

export const useAdminUsers = (initialParams = {}) => {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 20,
		total: 0,
		totalPages: 0,
	});

	const fetchUsers = useCallback(async (params = {}) => {
		try {
			setLoading(true);
			setError(null);

			const queryParams = { ...initialParams, ...params };
			const response = await adminUsersAPI.getAllUsers(queryParams);

			setUsers(response.data.data?.users || response.data.users || response.data.data || response.data || []);
			setPagination(response.data.data?.pagination || response.data.pagination || {
				page: queryParams.page || 1,
				limit: queryParams.limit || 20,
				total: response.data.data?.total || response.data.total || response.data.data?.length || response.data.length || 0,
				totalPages: Math.ceil((response.data.data?.total || response.data.total || response.data.data?.length || response.data.length || 0) / (queryParams.limit || 20)),
			});

			return response.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch users';
			setError(errorMessage);
			console.error('Users fetch error:', err);
			return null;
		} finally {
			setLoading(false);
		}
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	const getUserDetails = useCallback(async (userId) => {
		try {
			const response = await adminUsersAPI.getUserDetails(userId);
			return response.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch user details';
			setError(errorMessage);
			throw new Error(errorMessage);
		}
	}, []);

	const updateUserStatus = useCallback(async (userId, statusData) => {
		try {
			await adminUsersAPI.updateUserStatus(userId, statusData);
			await fetchUsers();
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to update user status';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	}, [fetchUsers]);

	const banUser = useCallback(async (userData) => {
		try {
			await adminUsersAPI.banUser(userData);
			await fetchUsers();
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to ban user';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	}, [fetchUsers]);

	const unbanUser = useCallback(async (userData) => {
		try {
			await adminUsersAPI.unbanUser(userData);
			await fetchUsers();
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to unban user';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	}, [fetchUsers]);

	const bulkBanUsers = useCallback(async (userData) => {
		try {
			await adminUsersAPI.bulkBanUsers(userData);
			await fetchUsers();
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to ban users';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	}, [fetchUsers]);

	const bulkUnbanUsers = useCallback(async (userData) => {
		try {
			await adminUsersAPI.bulkUnbanUsers(userData);
			await fetchUsers();
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to unban users';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	}, [fetchUsers]);

	const approveVideoKyc = useCallback(async (userId) => {
		try {
			await adminUsersAPI.approveVideoKyc(userId);
			await fetchUsers();
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to approve Video KYC';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	}, [fetchUsers]);

	const rejectVideoKyc = useCallback(async (userId, reasonData) => {
		try {
			await adminUsersAPI.rejectVideoKyc(userId, reasonData);
			await fetchUsers();
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to reject Video KYC';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	}, [fetchUsers]);

	// ─── New CRUD via /api/admin/users-mgmt ───────────────────────────

	const createUser = useCallback(async (data) => {
		try {
			const response = await adminUsersMgmtAPI.createUser(data);
			await fetchUsers();
			return { success: true, data: response.data };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to create user';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	}, [fetchUsers]);

	const updateUser = useCallback(async (userId, data) => {
		try {
			const response = await adminUsersMgmtAPI.updateUser(userId, data);
			await fetchUsers();
			return { success: true, data: response.data };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to update user';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	}, [fetchUsers]);

	const deleteUser = useCallback(async (userId, permanent = false) => {
		try {
			await adminUsersMgmtAPI.deleteUser(userId, permanent);
			await fetchUsers();
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to delete user';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	}, [fetchUsers]);

	const bulkDeleteUsers = useCallback(async (userIds, permanent = false) => {
		try {
			await adminUsersMgmtAPI.bulkDeleteUsers({ userIds, permanent });
			await fetchUsers();
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to delete users';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	}, [fetchUsers]);

	const resetUserPassword = useCallback(async (userId, data) => {
		try {
			await adminUsersMgmtAPI.resetUserPassword(userId, data);
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to reset password';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	}, []);

	// Only fetch on initial mount if initialParams are provided
	useEffect(() => {
		if (Object.keys(initialParams).length > 0) {
			fetchUsers(initialParams);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Only run once on mount

	return {
		users,
		loading,
		error,
		pagination,
		fetchUsers,
		getUserDetails,
		updateUserStatus,
		banUser,
		unbanUser,
		bulkBanUsers,
		bulkUnbanUsers,
		createUser,
		updateUser,
		deleteUser,
		bulkDeleteUsers,
		resetUserPassword,
		approveVideoKyc,
		rejectVideoKyc,
		refetch: () => fetchUsers(),
	};
};
