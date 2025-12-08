export const API_CONFIG = {
	BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.desicouplesz.com',
	TIMEOUT: 10000,
};

export const ADMIN_API_CONFIG = {
	BASE_URL: process.env.NEXT_PUBLIC_ADMIN_API_URL || API_CONFIG.BASE_URL,
	TIMEOUT: 10000,
};

export const APP_CONFIG = {
	NAME: '2+1 Admin Panel',
	VERSION: '1.0.0',
	ENVIRONMENT: process.env.NODE_ENV || 'development',
};

export const STORAGE_KEYS = {
	JWT_TOKEN: 'jwt_token',
	REFRESH_TOKEN: 'refresh_token',
	USER_DATA: 'user_data',
	// Admin specific keys
	ADMIN_JWT_TOKEN: 'admin_jwt_token',
	ADMIN_USER_DATA: 'admin_user_data',
};
