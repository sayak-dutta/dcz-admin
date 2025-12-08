import { useState, useEffect, useCallback } from 'react';
import { adminMessagesAPI } from '@/lib/adminApi';

export const useAdminMessages = (initialParams = {}) => {
	const [conversations, setConversations] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [activity, setActivity] = useState(null);

	const fetchConversations = useCallback(async (params = {}) => {
		try {
			setLoading(true);
			setError(null);

			const queryParams = { ...initialParams, ...params };
			const response = await adminMessagesAPI.getAllConversations(queryParams);

			setConversations(response.data.data.conversations || response.data.data || []);
			return response.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch conversations';
			setError(errorMessage);
			console.error('Conversations fetch error:', err);
			return null;
		} finally {
			setLoading(false);
		}
	}, [initialParams]);

	const getConversationMessages = useCallback(async (conversationId, params = {}) => {
		try {
			const response = await adminMessagesAPI.getConversationMessages(conversationId, params);
			return response.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch conversation messages';
			setError(errorMessage);
			throw new Error(errorMessage);
		}
	}, []);

	const getMessageActivity = useCallback(async (params = {}) => {
		try {
			const response = await adminMessagesAPI.getMessageActivity(params);
			setActivity(response.data);
			return response.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch message activity';
			setError(errorMessage);
			return null;
		}
	}, []);

	const moderateConversation = useCallback(async (conversationId, moderationData) => {
		try {
			await adminMessagesAPI.moderateConversation(conversationId, moderationData);
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to moderate conversation';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	}, []);

	const deleteMessage = useCallback(async (conversationId, messageId) => {
		try {
			await adminMessagesAPI.deleteMessage(conversationId, messageId);
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to delete message';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	}, []);

	const hideMessage = useCallback(async (conversationId, messageId, reasonData) => {
		try {
			await adminMessagesAPI.hideMessage(conversationId, messageId, reasonData);
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to hide message';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	}, []);

	useEffect(() => {
		fetchConversations();
	}, [2]);

	return {
		conversations,
		loading,
		error,
		activity,
		fetchConversations,
		getConversationMessages,
		getMessageActivity,
		moderateConversation,
		deleteMessage,
		hideMessage,
		refetch: () => fetchConversations(),
	};
};
