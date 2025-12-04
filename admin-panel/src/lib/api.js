import axios from 'axios';

// API base configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://46.202.189.73:88';

// Create axios instance
const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Request interceptor to add auth token
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('jwt_token');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor for error handling
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			// Handle unauthorized access
			localStorage.removeItem('jwt_token');
			window.location.href = '/login';
		}
		return Promise.reject(error);
	}
);

// Authentication API
export const authAPI = {
	login: (credentials) => api.post('/auth/login', credentials),
	signup: (userData) => api.post('/auth/signup', userData),
	getCurrentUser: () => api.get('/auth/me'),
	forgotPassword: (data) => api.post('/auth/forgot-password', data),
	resetPassword: (data) => api.post('/auth/reset-password', data),
};

// User Management API
export const userAPI = {
	getAllUsers: (params) => api.get('/users', { params }),
	getUserById: (userId) => api.get(`/users/${userId}`),
	updateUser: (userId, userData) => api.put(`/users/${userId}`, userData),
	deleteUser: (userId) => api.delete(`/users/${userId}`),
	banUser: (userId, reason) => api.post(`/users/${userId}/ban`, { reason }),
	unbanUser: (userId) => api.post(`/users/${userId}/unban`),
	recordProfileView: (userId, source) => api.post(`/users/${userId}/view`, { source }),
	getProfileViewers: (params) => api.get('/users/profile-views', { params }),
	getProfileViewStats: () => api.get('/users/profile-views/stats'),
};

// User Interactions API
export const interactionsAPI = {
	getMatches: () => api.get('/interactions/matches'),
	getLikes: () => api.get('/interactions/likes'),
	getDislikes: () => api.get('/interactions/dislikes'),
	getBlocks: () => api.get('/interactions/blocks'),
	getReports: () => api.get('/interactions/reports'),
	createInteraction: (data) => api.post('/interactions', data),
	removeInteraction: (targetUserId) => api.delete(`/interactions/${targetUserId}`),
};

// Content Moderation API
export const moderationAPI = {
	getReportedContent: (params) => api.get('/posts/reports', { params }),
	getReportedUsers: (params) => api.get('/users/reports', { params }),
	reportPost: (postId, data) => api.post(`/posts/${postId}/report`, data),
	reportUser: (userId, data) => api.post(`/users/${userId}/report`, data),
	resolveReport: (reportId, action) => api.post(`/reports/${reportId}/resolve`, { action }),
};

// Profile Verification API
export const verificationAPI = {
	getPendingVerifications: (params) => api.get('/verifications/pending', { params }),
	approveVerification: (verificationId) => api.post(`/verifications/${verificationId}/approve`),
	rejectVerification: (verificationId, reason) => api.post(`/verifications/${verificationId}/reject`, { reason }),
	requestNewVerification: (userId, message) => api.post(`/verifications/request-new`, { userId, message }),
};

// Posts & Feed API
export const postsAPI = {
	getFeedPosts: (params) => api.get('/posts/feed', { params }),
	getTrendingPosts: (params) => api.get('/posts/trending', { params }),
	getUserPosts: (userId, params) => api.get(`/posts/user/${userId}`, { params }),
	getPost: (postId) => api.get(`/posts/${postId}`),
	createPost: (postData) => api.post('/posts', postData),
	updatePost: (postId, postData) => api.put(`/posts/${postId}`, postData),
	deletePost: (postId) => api.delete(`/posts/${postId}`),
	likePost: (postId) => api.post(`/posts/${postId}/like`),
	sharePost: (postId, data) => api.post(`/posts/${postId}/share`, data),
};

// Comments API
export const commentsAPI = {
	getPostComments: (postId, params) => api.get(`/posts/${postId}/comments`, { params }),
	createComment: (postId, commentData) => api.post(`/posts/${postId}/comments`, commentData),
	updateComment: (postId, commentId, commentData) => api.put(`/posts/${postId}/comments/${commentId}`, commentData),
	deleteComment: (postId, commentId) => api.delete(`/posts/${postId}/comments/${commentId}`),
	likeComment: (postId, commentId) => api.post(`/posts/${postId}/comments/${commentId}/like`),
};

// Messaging API
export const messagingAPI = {
	sendMessage: (messageData) => api.post('/messages', messageData),
	getConversation: (matchId) => api.get(`/messages/${matchId}`),
	markAsRead: (messageId) => api.put(`/messages/${messageId}/read`),
	editMessage: (messageId, content) => api.put(`/messages/${messageId}`, { content }),
	deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
};

// Personal Messages API
export const personalMessagesAPI = {
	sendPersonalMessage: (messageData) => api.post('/personal-messages', messageData),
	getConversations: (params) => api.get('/personal-messages/conversations', { params }),
	getConversationWithUser: (userId, params) => api.get(`/personal-messages/conversations/${userId}`, { params }),
	markMessageAsRead: (messageId) => api.put(`/personal-messages/${messageId}/read`),
	markConversationAsRead: (userId) => api.post(`/personal-messages/conversations/${userId}/read`),
	editPersonalMessage: (messageId, content) => api.put(`/personal-messages/${messageId}`, { content }),
	deletePersonalMessage: (messageId) => api.delete(`/personal-messages/${messageId}`),
	getUnreadCount: () => api.get('/personal-messages/unread-count'),
};

// Chat Rooms API
export const chatRoomsAPI = {
	createChatRoom: (roomData) => api.post('/chatrooms', roomData),
	getAllPublicRooms: () => api.get('/chatrooms'),
	getMyRooms: () => api.get('/chatrooms/my'),
	getLiveRooms: () => api.get('/chatrooms/live'),
	getRoomDetails: (roomId) => api.get(`/chatrooms/${roomId}`),
	joinRoom: (roomId) => api.post(`/chatrooms/${roomId}/join`),
	leaveRoom: (roomId) => api.post(`/chatrooms/${roomId}/leave`),
	joinSecretRoom: (inviteCode) => api.post('/chatrooms/join-secret', { inviteCode }),
	sendRoomMessage: (roomId, messageData) => api.post(`/chatrooms/${roomId}/messages`, messageData),
	getRoomMessages: (roomId, params) => api.get(`/chatrooms/${roomId}/messages`, { params }),
	controlLiveStatus: (roomId, action) => api.post(`/chatrooms/${roomId}/live`, { action }),
	reportChatroom: (roomId, reportData) => api.post(`/chatrooms/${roomId}/report`, reportData),
	getChatroomReports: (roomId, params) => api.get(`/chatrooms/${roomId}/reports`, { params }),
};

// Friends API
export const friendsAPI = {
	getMyFriends: (params) => api.get('/friends', { params }),
	getUserFriends: (userId, params) => api.get(`/friends/${userId}`, { params }),
	sendFriendRequest: (requestData) => api.post('/friend-requests', requestData),
	getFriendRequests: (params) => api.get('/friend-requests', { params }),
	respondToFriendRequest: (requestId, action) => api.put(`/friend-requests/${requestId}/respond`, { action }),
	cancelFriendRequest: (requestId) => api.delete(`/friend-requests/${requestId}`),
	getFriendRequestStats: () => api.get('/friend-requests/stats'),
};

// Groups API
export const groupsAPI = {
	getAllGroups: (params) => api.get('/groups', { params }),
	getMyGroups: (params) => api.get('/groups/my-groups', { params }),
	getGroup: (groupId) => api.get(`/groups/${groupId}`),
	createGroup: (groupData) => api.post('/groups', groupData),
	updateGroup: (groupId, groupData) => api.put(`/groups/${groupId}`, groupData),
	deleteGroup: (groupId) => api.delete(`/groups/${groupId}`),
	joinGroup: (groupId, message) => api.post(`/groups/${groupId}/join`, { message }),
	leaveGroup: (groupId) => api.post(`/groups/${groupId}/leave`),
	getGroupMembers: (groupId, params) => api.get(`/groups/${groupId}/members`, { params }),
	inviteMembers: (groupId, inviteData) => api.post(`/groups/${groupId}/invite`, inviteData),
	getJoinRequests: (groupId, params) => api.get(`/groups/${groupId}/requests`, { params }),
	respondToJoinRequest: (groupId, userId, action) => api.post(`/groups/${groupId}/requests/${userId}`, { action }),
	updateMemberRole: (groupId, userId, role) => api.put(`/groups/${groupId}/members/${userId}/role`, { role }),
	removeMember: (groupId, userId, reason, action) => api.delete(`/groups/${groupId}/members/${userId}`, { data: { reason }, params: { action } }),
	updateNotificationSettings: (groupId, settings) => api.put(`/groups/${groupId}/notifications`, settings),
	reportGroup: (groupId, reportData) => api.post(`/groups/${groupId}/report`, reportData),
	searchGroups: (query, params) => api.get(`/groups/search/${query}`, { params }),
};

// Media Upload API
export const mediaAPI = {
	uploadSingle: (formData) => api.post('/media/upload/single', formData, {
		headers: { 'Content-Type': 'multipart/form-data' }
	}),
	uploadMultiple: (formData) => api.post('/media/upload/multiple', formData, {
		headers: { 'Content-Type': 'multipart/form-data' }
	}),
	uploadProfilePhoto: (formData) => api.post('/media/upload/profile-photo', formData, {
		headers: { 'Content-Type': 'multipart/form-data' }
	}),
	uploadProfilePhotos: (formData) => api.post('/media/upload/profile-photos', formData, {
		headers: { 'Content-Type': 'multipart/form-data' }
	}),
	uploadMessageMedia: (formData) => api.post('/media/upload/message-media', formData, {
		headers: { 'Content-Type': 'multipart/form-data' }
	}),
	generatePresignedUrl: (fileData) => api.post('/media/presigned-url', fileData),
	deleteFile: (key) => api.delete('/media/delete', { data: { key } }),
	deleteMultipleFiles: (keys) => api.delete('/media/delete/multiple', { data: { keys } }),
	updateProfilePhotos: (action, photoUrls) => api.put('/media/profile/photos', { action, photoUrls }),
	getFileInfo: (filePath) => api.get(`/media/info/${filePath}`),
};

// Feed & Notifications API
export const feedAPI = {
	getFeed: (params) => api.get('/feed', { params }),
	getUnreadFeedCount: () => api.get('/feed/unread-count'),
	markFeedItemAsRead: (feedId) => api.put(`/feed/${feedId}/read`),
	markMultipleFeedItemsAsRead: (feedIds) => api.put('/feed/read-multiple', { feedIds }),
	markAllFeedItemsAsRead: () => api.put('/feed/read-all'),
	deleteFeedItem: (feedId) => api.delete(`/feed/${feedId}`),
	getFeedStatistics: () => api.get('/feed/stats'),
};

// Remember Me (Poke System) API
export const rememberMeAPI = {
	sendRememberMe: (rememberMeData) => api.post('/remember-me', rememberMeData),
	getReceivedRememberMe: (params) => api.get('/remember-me/received', { params }),
	getSentRememberMe: (params) => api.get('/remember-me/sent', { params }),
	markRememberMeAsSeen: (rememberMeId) => api.put(`/remember-me/${rememberMeId}/seen`),
	deleteRememberMe: (rememberMeId) => api.delete(`/remember-me/${rememberMeId}`),
	getRememberMeStats: () => api.get('/remember-me/stats'),
};

// Business Profile Requests API
export const businessAPI = {
	submitBusinessRequest: (businessData) => api.post('/business-request', businessData),
	getMyBusinessRequest: () => api.get('/business-request/my-request'),
	getAllBusinessRequests: (params) => api.get('/business-request/all', { params }),
	getBusinessRequestDetails: (requestId) => api.get(`/business-request/${requestId}`),
	approveBusinessRequest: (requestId) => api.put(`/business-request/${requestId}/approve`),
	rejectBusinessRequest: (requestId) => api.put(`/business-request/${requestId}/reject`),
};

// OTP Management API
export const otpAPI = {
	requestOTP: (otpData) => api.post('/otp/request', otpData),
	verifyOTP: (verificationData) => api.post('/otp/verify', verificationData),
};

// Profile & Preferences API
export const profileAPI = {
	getProfile: () => api.get('/profile'),
	updateProfile: (profileData) => api.put('/profile', profileData),
	getPreferences: () => api.get('/preferences'),
	updatePreferences: (preferencesData) => api.put('/preferences', preferencesData),
};

// Onboarding API
export const onboardingAPI = {
	completeOnboarding: (onboardingData) => api.post('/onboarding/complete', onboardingData),
	getOnboardingStatus: () => api.get('/onboarding/status'),
	updateOnboardingData: (onboardingData) => api.put('/onboarding/update', onboardingData),
};

export default api;
