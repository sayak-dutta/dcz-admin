import { useState, useEffect, useCallback } from 'react';
import { adminGroupsAPI } from '@/lib/adminApi';

export const useAdminGroups = (initialParams = {}) => {
	const [groups, setGroups] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const fetchGroups = useCallback(async (params = {}) => {
		try {
			setLoading(true);
			setError(null);

			const queryParams = { ...initialParams, ...params };
			const response = await adminGroupsAPI.getAllGroups(queryParams);

			setGroups(response.data.groups || response.data || []);
			return response.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch groups';
			setError(errorMessage);
			console.error('Groups fetch error:', err);
			return null;
		} finally {
			setLoading(false);
		}
	}, [initialParams]);

	const getGroupDetails = useCallback(async (groupId) => {
		try {
			const response = await adminGroupsAPI.getGroupDetails(groupId);
			return response.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch group details';
			setError(errorMessage);
			throw new Error(errorMessage);
		}
	}, []);

	const updateGroupStatus = useCallback(async (groupId, statusData) => {
		try {
			await adminGroupsAPI.updateGroupStatus(groupId, statusData);
			await fetchGroups(); // Refresh the list
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to update group status';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	}, [fetchGroups]);

	const deleteGroup = useCallback(async (groupId) => {
		try {
			await adminGroupsAPI.deleteGroup(groupId);
			await fetchGroups(); // Refresh the list
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to delete group';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	}, [fetchGroups]);

	const getGroupMembers = useCallback(async (groupId, params = {}) => {
		try {
			const response = await adminGroupsAPI.getGroupMembers(groupId, params);
			return response.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch group members';
			setError(errorMessage);
			return null;
		}
	}, []);

	const getGroupPosts = useCallback(async (groupId, params = {}) => {
		try {
			const response = await adminGroupsAPI.getGroupPosts(groupId, params);
			return response.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch group posts';
			setError(errorMessage);
			return null;
		}
	}, []);

	useEffect(() => {
		fetchGroups();
	}, [fetchGroups]);

	return {
		groups,
		loading,
		error,
		fetchGroups,
		getGroupDetails,
		updateGroupStatus,
		deleteGroup,
		getGroupMembers,
		getGroupPosts,
		refetch: () => fetchGroups(),
	};
};
