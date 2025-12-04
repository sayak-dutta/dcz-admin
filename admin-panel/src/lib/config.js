export const API_CONFIG = {
	BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://46.202.189.73:88',
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
};
