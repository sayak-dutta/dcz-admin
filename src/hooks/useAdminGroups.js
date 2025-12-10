import { useState, useEffect, useCallback } from 'react';
import { adminGroupsAPI, adminGroupMessagesAPI } from '@/lib/adminApi';

export const useAdminGroups = () => {
	const [groups, setGroups] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 0,
		totalGroups: 0,
		hasNext: false,
		hasPrev: false,
	});

	const fetchGroups = useCallback(async (params = {}) => {
		try {
			setLoading(true);
			setError(null);

			const response = await adminGroupsAPI.getAllGroups(params);

			setGroups(response.data.data.groups || response.data.data || []);
			setPagination(response.data.data.pagination || {
				currentPage: params.page || 1,
				totalPages: Math.ceil((response.data.data.totalGroups || response.data.data.length || 0) / (params.limit || 20)),
				totalGroups: response.data.data.totalGroups || response.data.data.length || 0,
				hasNext: false,
				hasPrev: false,
			});

			return response.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch groups';
			setError(errorMessage);
			console.error('Groups fetch error:', err);
			return null;
		} finally {
			setLoading(false);
		}
	}, []);

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
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to update group status';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	}, []);

	const deleteGroup = useCallback(async (groupId) => {
		try {
			await adminGroupsAPI.deleteGroup(groupId);
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to delete group';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	}, []);

	const getGroupMembers = useCallback(async (groupId, params = {}) => {
		try {
			const response = await adminGroupsAPI.getGroupMembers(groupId, params);
			return response.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch group members';
			setError(errorMessage);
			throw new Error(errorMessage);
		}
	}, []);

	const getGroupMessages = useCallback(async (groupId, params = {}) => {
		try {
			const response = await adminGroupMessagesAPI.getGroupMessages(groupId, params);
			return response.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch group messages';
			setError(errorMessage);
			throw new Error(errorMessage);
		}
	}, []);

	return {
		groups,
		loading,
		error,
		pagination,
		fetchGroups,
		getGroupDetails,
		updateGroupStatus,
		deleteGroup,
		getGroupMembers,
		getGroupMessages,
		refetch: fetchGroups,
	};
};