import { useState, useEffect, useCallback } from 'react';
import { adminChatroomsAPI } from '@/lib/adminApi';

export const useAdminChatrooms = (initialParams = {}) => {
	const [chatrooms, setChatrooms] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const fetchChatrooms = useCallback(async (params = {}) => {
		try {
			setLoading(true);
			setError(null);

			const queryParams = { ...initialParams, ...params };
			const response = await adminChatroomsAPI.getAllChatrooms(queryParams);

			setChatrooms(response.data.data.chatrooms || response.data.data || []);
			return response.data;
		} catch (err) {
			const errorMessage = err.response?.data?.data?.message || 'Failed to fetch chatrooms';
			setError(errorMessage);
			console.error('Chatrooms fetch error:', err);
			return null;
		} finally {
			setLoading(false);
		}
	}, [initialParams]);

	const getChatroomDetails = useCallback(async (chatroomId) => {
		try {
			const response = await adminChatroomsAPI.getChatroomDetails(chatroomId);
			console.log(chatroomId);
			return response.data.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch chatroom details';
			setError(errorMessage);
			throw new Error(errorMessage);
		}
	}, []);

	const updateChatroomStatus = useCallback(async (chatroomId, statusData) => {
		try {
			await adminChatroomsAPI.updateChatroomStatus(chatroomId, statusData);
			await fetchChatrooms(); // Refresh the list
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to update chatroom status';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	}, [fetchChatrooms]);

	const deleteChatroom = useCallback(async (chatroomId) => {
		try {
			await adminChatroomsAPI.deleteChatroom(chatroomId);
			await fetchChatrooms(); // Refresh the list
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to delete chatroom';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	}, [fetchChatrooms]);

	const getChatroomMessages = useCallback(async (chatroomId, params = {}) => {
		try {
			const response = await adminChatroomsAPI.getChatroomMessages(chatroomId, params);
			return response.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch chatroom messages';
			setError(errorMessage);
			return null;
		}
	}, []);

	const getChatroomParticipants = useCallback(async (chatroomId, params = {}) => {
		try {
			const response = await adminChatroomsAPI.getChatroomParticipants(chatroomId, params);
			return response.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch chatroom participants';
			setError(errorMessage);
			return null;
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
			return null;
		}
	}, []);

	useEffect(() => {
		fetchChatrooms();
	}, [2]);

	return {
		chatrooms,
		loading,
		error,
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
		refetch: () => fetchChatrooms(),
	};
};
