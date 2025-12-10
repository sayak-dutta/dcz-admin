import { useState, useEffect, useCallback } from 'react';
import { adminChatroomsAPI } from '@/lib/adminApi';

export const useAdminChatrooms = () => {
	const [chatrooms, setChatrooms] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 0,
		hasNext: false,
		hasPrev: false,
	});

	const fetchChatrooms = useCallback(async (params = {}) => {
		try {
			setLoading(true);
			setError(null);

			const response = await adminChatroomsAPI.getAllChatrooms(params);

			setChatrooms(response.data.data.chatrooms || response.data.data || []);
			setPagination(response.data.data.pagination || {
				currentPage: params.page || 1,
				totalPages: Math.ceil((response.data.data.totalChatrooms || response.data.data.length || 0) / (params.limit || 20)),
				hasNext: false,
				hasPrev: false,
			});

			return response.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch chatrooms';
			setError(errorMessage);
			console.error('Chatrooms fetch error:', err);
			return null;
		} finally {
			setLoading(false);
		}
	}, []);

	const getChatroomDetails = useCallback(async (chatroomId) => {
		try {
			const response = await adminChatroomsAPI.getChatroomDetails(chatroomId);
			return response.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch chatroom details';
			setError(errorMessage);
			throw new Error(errorMessage);
		}
	}, []);

	const updateChatroomStatus = useCallback(async (chatroomId, statusData) => {
		try {
			await adminChatroomsAPI.updateChatroomStatus(chatroomId, statusData);
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to update chatroom status';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	}, []);

	const deleteChatroom = useCallback(async (chatroomId) => {
		try {
			await adminChatroomsAPI.deleteChatroom(chatroomId);
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to delete chatroom';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	}, []);

	const getChatroomMessages = useCallback(async (chatroomId, params = {}) => {
		try {
			const response = await adminChatroomsAPI.getChatroomMessages(chatroomId, params);
			return response.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch chatroom messages';
			setError(errorMessage);
			throw new Error(errorMessage);
		}
	}, []);

	const getChatroomParticipants = useCallback(async (chatroomId, params = {}) => {
		try {
			const response = await adminChatroomsAPI.getChatroomParticipants(chatroomId, params);
			return response.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch chatroom participants';
			setError(errorMessage);
			throw new Error(errorMessage);
		}
	}, []);

	const removeParticipant = useCallback(async (chatroomId, userId, reasonData) => {
		try {
			await adminChatroomsAPI.removeParticipant(chatroomId, userId, reasonData);
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to remove participant';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	}, []);

	const banParticipant = useCallback(async (chatroomId, userId, banData) => {
		try {
			await adminChatroomsAPI.banParticipant(chatroomId, userId, banData);
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to ban participant';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	}, []);

	const unbanParticipant = useCallback(async (chatroomId, userId) => {
		try {
			await adminChatroomsAPI.unbanParticipant(chatroomId, userId);
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to unban participant';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	}, []);

	const getBannedUsers = useCallback(async (chatroomId, params = {}) => {
		try {
			const response = await adminChatroomsAPI.getBannedUsers(chatroomId, params);
			return response.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch banned users';
			setError(errorMessage);
			throw new Error(errorMessage);
		}
	}, []);

	return {
		chatrooms,
		loading,
		error,
		pagination,
		fetchChatrooms,
		getChatroomDetails,
		updateChatroomStatus,
		deleteChatroom,
		getChatroomMessages,
		getChatroomParticipants,
		removeParticipant,
		banParticipant,
		unbanParticipant,
		getBannedUsers,
		refetch: fetchChatrooms,
	};
};