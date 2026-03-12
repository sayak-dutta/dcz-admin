import axios from 'axios';
import { API_CONFIG } from './config';

// Create admin API instance
const adminApi = axios.create({
	baseURL: `${API_CONFIG.BASE_URL}`,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Request interceptor to add admin auth token and role-based access control
adminApi.interceptors.request.use(
	(config) => {
		const adminToken = localStorage.getItem('admin_jwt_token');
		if (adminToken) {
			config.headers.Authorization = `Bearer ${adminToken}`;
		}

		// Role-based access control for message endpoints
		const url = config.url || '';
		if (url.includes('/messages/')) {
			const userData = localStorage.getItem('admin_user_data');
			if (userData) {
				try {
					const user = JSON.parse(userData);
					if (user.role !== 'super_admin') {
						return Promise.reject(
							new Error('Access denied. Super-admin role required to access message endpoints.')
						);
					}
				} catch (e) {
					console.error('Error parsing admin user data:', e);
				}
			}
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
		if (error.message && error.message.includes('Access denied')) {
			return Promise.reject(error);
		}
		if (error.response?.status === 401) {
			// Handle unauthorized access - clear admin token and redirect
			localStorage.removeItem('admin_jwt_token');
			localStorage.removeItem('admin_user_data');
			if (typeof window !== 'undefined') {
				window.location.href = '/login';
			}
		}
		if (error.response?.status === 403) {
			return Promise.reject(new Error('Access denied. You do not have permission to perform this action.'));
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
	},
	// MFA endpoints — tempToken is only passed during post-login flow;
	// when called from Settings (already logged in), tempToken is null/undefined
	// and the axios interceptor attaches the full JWT automatically.
	setupMfa: (tempToken) => adminApi.post(
		'/api/admin/auth/mfa/setup', {},
		tempToken ? { headers: { Authorization: `Bearer ${tempToken}` } } : {}
	),
	confirmMfa: (data, tempToken) => adminApi.post(
		'/api/admin/auth/mfa/confirm', data,
		tempToken ? { headers: { Authorization: `Bearer ${tempToken}` } } : {}
	),
	verifyMfa: (data, tempToken) => adminApi.post(
		'/api/admin/auth/mfa/verify', data,
		tempToken ? { headers: { Authorization: `Bearer ${tempToken}` } } : {}
	),
	disableMfa: (data) => adminApi.delete('/api/admin/auth/mfa', { data }),
	// Profile & password management
	updateProfile: (data) => adminApi.put('/api/admin/auth/profile', data),
	changePassword: (data) => adminApi.put('/api/admin/auth/password', data),
};

// Bans API
export const adminBansAPI = {
	getAllBans: (params) => adminApi.get('/api/admin/bans', { params }),
	getBanDetails: (userId) => adminApi.get(`/api/admin/bans/${userId}`),
};

// Media Moderation API
export const adminMediaAPI = {
	getAllMedia: (params) => adminApi.get('/api/admin/media', { params }),
	getMediaDetails: (mediaId) => adminApi.get(`/api/admin/media/${mediaId}`),
	updateModerationStatus: (mediaId, statusData) => adminApi.patch(`/api/admin/media/${mediaId}/moderation`, statusData),
	deleteMedia: (mediaId) => adminApi.delete(`/api/admin/media/${mediaId}`),
};

// Reports API
export const adminReportsAPI = {
	getAllReports: (params) => adminApi.get('/api/admin/reports', { params }),
	getReportDetails: (reportId) => adminApi.get(`/api/admin/reports/${reportId}`),
	processReport: (reportId, processData) => adminApi.post(`/api/admin/reports/${reportId}/process`, processData),
	getReportsSummary: (params) => adminApi.get('/api/admin/reports/summary', { params }),
	bulkProcessReports: (bulkData) => adminApi.post('/api/admin/reports/bulk-process', bulkData),
};

// Dashboard API
export const adminDashboardAPI = {
	getStats: () => adminApi.get('/api/admin/dashboard/stats'),
};

// User Management API (read + ban/unban — existing endpoints)
export const adminUsersAPI = {
	getAllUsers: (params) => adminApi.get('/api/admin/users', { params }),
	getUserDetails: (userId) => adminApi.get(`/api/admin/users/${userId}`),
	updateUserStatus: (userId, statusData) => adminApi.patch(`/api/admin/users/${userId}/status`, statusData),
	banUser: (userData) => adminApi.post('/api/admin/users/ban', userData),
	unbanUser: (userData) => adminApi.post('/api/admin/users/unban', userData),
	bulkBanUsers: (userData) => adminApi.post('/api/admin/users/bulk-ban', userData),
	bulkUnbanUsers: (userData) => adminApi.post('/api/admin/users/bulk-unban', userData),
	approveVideoKyc: (userId) => adminApi.post(`/api/admin/users/${userId}/video-kyc/approve`),
	rejectVideoKyc: (userId, data) => adminApi.post(`/api/admin/users/${userId}/video-kyc/reject`, data),
};

// User CRUD API — /api/admin/users-mgmt (super_admin only for write ops)
export const adminUsersMgmtAPI = {
	createUser: (data) => adminApi.post('/api/admin/users-mgmt', data),
	updateUser: (userId, data) => adminApi.put(`/api/admin/users-mgmt/${userId}`, data),
	deleteUser: (userId, permanent = false) => adminApi.delete(`/api/admin/users-mgmt/${userId}${permanent ? '?permanent=true' : ''}`),
	bulkDeleteUsers: (data) => adminApi.post('/api/admin/users-mgmt/bulk-delete', data),
	resetUserPassword: (userId, data) => adminApi.post(`/api/admin/users-mgmt/${userId}/reset-password`, data),
};

// Signup Approval API
export const adminSignupsAPI = {
	getAll: (params) => adminApi.get('/api/admin/signups', { params }),
	approve: (userId) => adminApi.post(`/api/admin/signups/${userId}/approve`),
	reject: (userId, data) => adminApi.post(`/api/admin/signups/${userId}/reject`, data),
	bulkApprove: (data) => adminApi.post('/api/admin/signups/bulk-approve', data),
	bulkReject: (data) => adminApi.post('/api/admin/signups/bulk-reject', data),
};

// Fire Date Approval API
export const adminFireDatesAPI = {
	getPending: (params) => adminApi.get('/api/admin/fire-dates/pending', { params }),
	approve: (fireDateId) => adminApi.post(`/api/admin/fire-dates/${fireDateId}/approve`),
	reject: (fireDateId, data) => adminApi.post(`/api/admin/fire-dates/${fireDateId}/reject`, data),
};

// Profile Verifications API
export const adminVerificationsAPI = {
	getAllVerifications: (params) => adminApi.get('/api/admin/verifications', { params }),
	getVerificationDetails: (verificationId) => adminApi.get(`/api/admin/verifications/${verificationId}`),
	approveVerification: (verificationId) => adminApi.post(`/api/admin/verifications/${verificationId}/approve`),
	rejectVerification: (verificationId, rejectionData) => adminApi.post(`/api/admin/verifications/${verificationId}/reject`, rejectionData),
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

// Speed Dates API
export const adminSpeedDatesAPI = {
	getAllSpeedDates: (params) => adminApi.get('/api/admin/speed-dates', { params }),
	getSpeedDateDetails: (speedDateId) => adminApi.get(`/api/admin/speed-dates/${speedDateId}`),
};

// Livestreams API
export const adminLivestreamsAPI = {
	getAllLivestreams: (params) => adminApi.get('/api/admin/livestreams', { params }),
	getLivestreamDetails: (livestreamId) => adminApi.get(`/api/admin/livestreams/${livestreamId}`),
};

// Updated Group Messages API
export const adminGroupMessagesAPI = {
	getGroupMessages: (groupId, params) => adminApi.get(`/api/admin/groups/${groupId}/messages`, { params }),
};

// Plans Management API (using /api/admin/plans endpoint)
export const adminPlansAPI = {
	getAllPlans: (params) => adminApi.get('/api/admin/subscription-plans', { params }), // Use subscription-plans for listing
	createPlan: (planData) => adminApi.post('/api/admin/plans', planData),
	updatePlan: (planId, planData) => adminApi.put(`/api/admin/plans/${planId}`, planData),
	deletePlan: (planId) => adminApi.delete(`/api/admin/plans/${planId}`),
	getPlanStats: (planId) => adminApi.get(`/api/admin/plans/${planId}/stats`),
	bulkUpdatePlans: (bulkData) => adminApi.patch('/api/admin/plans/bulk-update', bulkData),
};

// App Content Management API
export const adminAppContentAPI = {
	getPrivacyPolicy: () => adminApi.get('/api/admin/app-content/privacy'),
	updatePrivacyPolicy: (contentData) => adminApi.put('/api/admin/app-content/privacy', contentData),
	getTermsOfService: () => adminApi.get('/api/admin/app-content/terms'),
	updateTermsOfService: (contentData) => adminApi.put('/api/admin/app-content/terms', contentData),
};

// App Config API (feature flag toggles — super_admin only for writes)
export const adminAppConfigAPI = {
	getConfig: () => adminApi.get('/api/admin/app-config'),
	updateConfig: (data) => adminApi.put('/api/admin/app-config', data),
};

// Admin Accounts API (manage operator accounts, not end-users)
export const adminAdminsAPI = {
	getAll: () => adminApi.get('/api/admin/admins'),
	create: (data) => adminApi.post('/api/admin/admins', data),
	update: (adminId, data) => adminApi.put(`/api/admin/admins/${adminId}`, data),
	resetPassword: (adminId, data) => adminApi.post(`/api/admin/admins/${adminId}/reset-password`, data),
	remove: (adminId) => adminApi.delete(`/api/admin/admins/${adminId}`),
};

export default adminApi;
