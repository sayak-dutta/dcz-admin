import axios from 'axios';
import { API_CONFIG } from './config';

// Create admin API instance
const adminApi = axios.create({
	baseURL: `${API_CONFIG.BASE_URL}`,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Request interceptor to add admin auth token
adminApi.interceptors.request.use(
	(config) => {
		const adminToken = localStorage.getItem('admin_jwt_token');
		if (adminToken) {
			config.headers.Authorization = `Bearer ${adminToken}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor for error handling
adminApi.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			// Handle unauthorized access - clear admin token and redirect
			localStorage.removeItem('admin_jwt_token');
			localStorage.removeItem('admin_user_data');
			if (typeof window !== 'undefined') {
				window.location.href = '/login';
			}
		}
		return Promise.reject(error);
	}
);

// Admin Authentication API
export const adminAuthAPI = {
	login: (credentials) => adminApi.post('/api/admin/auth/login', credentials),
	getProfile: () => adminApi.get('/api/admin/auth/me'),
	logout: () => {
		localStorage.removeItem('admin_jwt_token');
		localStorage.removeItem('admin_user_data');
		return Promise.resolve();
	}
};

// Dashboard API
export const adminDashboardAPI = {
	getStats: () => adminApi.get('/api/admin/dashboard/stats'),
};

// User Management API
export const adminUsersAPI = {
	getAllUsers: (params) => adminApi.get('/api/admin/users', { params }),
	getUserDetails: (userId) => adminApi.get(`/api/admin/users/${userId}`),
	updateUserStatus: (userId, statusData) => adminApi.patch(`/api/admin/users/${userId}/status`, statusData),
	banUser: (userData) => adminApi.post('/api/admin/users/ban', userData),
	unbanUser: (userData) => adminApi.post('/api/admin/users/unban', userData),
	bulkBanUsers: (userData) => adminApi.post('/api/admin/users/bulk-ban', userData),
	bulkUnbanUsers: (userData) => adminApi.post('/api/admin/users/bulk-unban', userData),
};

// Profile Verifications API
export const adminVerificationsAPI = {
	getAllVerifications: (params) => adminApi.get('/api/admin/verifications', { params }),
	getVerificationDetails: (verificationId) => adminApi.get(`/api/admin/verifications/${verificationId}`),
	approveVerification: (verificationId) => adminApi.post(`/api/admin/verifications/${verificationId}/approve`),
	rejectVerification: (verificationId, rejectionData) => adminApi.post(`/api/admin/verifications/${verificationId}/reject`, rejectionData),
};

// Reports API
export const adminReportsAPI = {
	getAllReports: (params) => adminApi.get('/api/admin/reports', { params }),
	getReportDetails: (reportId) => adminApi.get(`/api/admin/reports/${reportId}`),
	processReport: (reportId, processData) => adminApi.post(`/api/admin/reports/${reportId}/process`, processData),
	getReportsSummary: (params) => adminApi.get('/api/admin/reports/summary', { params }),
	bulkProcessReports: (bulkData) => adminApi.post('/api/admin/reports/bulk-process', bulkData),
};

// Bans API
export const adminBansAPI = {
	getAllBans: (params) => adminApi.get('/api/admin/bans', { params }),
	getBanDetails: (banId) => adminApi.get(`/api/admin/bans/${banId}`),
};

// Business Requests API
export const adminBusinessRequestsAPI = {
	getAllBusinessRequests: (params) => adminApi.get('/api/admin/business-requests', { params }),
	getBusinessRequestDetails: (requestId) => adminApi.get(`/api/admin/business-requests/${requestId}`),
	approveBusinessRequest: (requestId) => adminApi.put(`/api/admin/business-requests/${requestId}/approve`),
	rejectBusinessRequest: (requestId, rejectionData) => adminApi.put(`/api/admin/business-requests/${requestId}/reject`, rejectionData),
};

// Payments API
export const adminPaymentsAPI = {
	getAllTransactions: (params) => adminApi.get('/api/admin/payments/transactions', { params }),
	processRefund: (refundData) => adminApi.post('/api/admin/payments/refund', refundData),
};

// Subscription Plans API
export const adminSubscriptionPlansAPI = {
	getAllPlans: (params) => adminApi.get('/api/admin/subscription-plans', { params }),
	createPlan: (planData) => adminApi.post('/api/admin/subscription-plans', planData),
	updatePlan: (planId, planData) => adminApi.put(`/api/admin/subscription-plans/${planId}`, planData),
	deletePlan: (planId) => adminApi.delete(`/api/admin/subscription-plans/${planId}`),
	getPlanStats: (planId) => adminApi.get(`/api/admin/subscription-plans/${planId}/stats`),
};

// Media Moderation API
export const adminMediaAPI = {
	getAllMedia: (params) => adminApi.get('/api/admin/media', { params }),
	getMediaDetails: (mediaId) => adminApi.get(`/api/admin/media/${mediaId}`),
	updateModerationStatus: (mediaId, statusData) => adminApi.patch(`/api/admin/media/${mediaId}/moderation`, statusData),
	deleteMedia: (mediaId) => adminApi.delete(`/api/admin/media/${mediaId}`),
};

// Album Moderation API
export const adminAlbumsAPI = {
	getAllAlbums: (params) => adminApi.get('/api/admin/albums', { params }),
	getAlbumDetails: (albumId) => adminApi.get(`/api/admin/albums/${albumId}`),
	moderateAlbum: (albumId, moderationData) => adminApi.patch(`/api/admin/albums/${albumId}/moderation`, moderationData),
	deleteAlbum: (albumId) => adminApi.delete(`/api/admin/albums/${albumId}`),
};

// Group Moderation API
export const adminGroupsAPI = {
	getAllGroups: (params) => adminApi.get('/api/admin/groups', { params }),
	getGroupDetails: (groupId) => adminApi.get(`/api/admin/groups/${groupId}`),
	updateGroupStatus: (groupId, statusData) => adminApi.patch(`/api/admin/groups/${groupId}/status`, statusData),
	deleteGroup: (groupId) => adminApi.delete(`/api/admin/groups/${groupId}`),
	getGroupMembers: (groupId, params) => adminApi.get(`/api/admin/groups/${groupId}/members`, { params }),
	getGroupPosts: (groupId, params) => adminApi.get(`/api/admin/groups/${groupId}/posts`, { params }),
};

// Chatroom Moderation API
export const adminChatroomsAPI = {
	getAllChatrooms: (params) => adminApi.get('/api/admin/chatrooms', { params }),
	getChatroomDetails: (chatroomId) => adminApi.get(`/api/admin/chatrooms/${chatroomId}`),
	updateChatroomStatus: (chatroomId, statusData) => adminApi.patch(`/api/admin/chatrooms/${chatroomId}/status`, statusData),
	deleteChatroom: (chatroomId) => adminApi.delete(`/api/admin/chatrooms/${chatroomId}`),
	getChatroomMessages: (chatroomId, params) => adminApi.get(`/api/admin/chatrooms/${chatroomId}/messages`, { params }),
	getChatroomParticipants: (chatroomId, params) => adminApi.get(`/api/admin/chatrooms/${chatroomId}/participants`, { params }),
	removeParticipant: (chatroomId, userId, reasonData) => adminApi.post(`/api/admin/chatrooms/${chatroomId}/participants/${userId}/remove`, reasonData),
	banParticipant: (chatroomId, userId, banData) => adminApi.post(`/api/admin/chatrooms/${chatroomId}/participants/${userId}/ban`, banData),
	unbanParticipant: (chatroomId, userId) => adminApi.post(`/api/admin/chatrooms/${chatroomId}/banned-users/${userId}/unban`),
	getBannedUsers: (chatroomId, params) => adminApi.get(`/api/admin/chatrooms/${chatroomId}/banned-users`, { params }),
};

// Message Monitoring API
export const adminMessagesAPI = {
	getAllConversations: (params) => adminApi.get('/api/admin/messages/conversations', { params }),
	getConversationMessages: (conversationId, params) => adminApi.get(`/api/admin/messages/conversations/${conversationId}`, { params }),
	getMessageActivity: (params) => adminApi.get('/api/admin/messages/activity', { params }),
	moderateConversation: (conversationId, moderationData) => adminApi.post(`/api/admin/messages/conversations/${conversationId}/moderate`, moderationData),
	deleteMessage: (conversationId, messageId) => adminApi.delete(`/api/admin/messages/conversations/${conversationId}/messages/${messageId}`),
	hideMessage: (conversationId, messageId, reasonData) => adminApi.post(`/api/admin/messages/conversations/${conversationId}/messages/${messageId}/hide`, reasonData),
};

export default adminApi;
