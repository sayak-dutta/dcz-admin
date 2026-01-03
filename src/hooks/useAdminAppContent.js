import { useState, useCallback } from 'react';
import { adminAppContentAPI } from '@/lib/adminApi';

export const useAdminAppContent = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const getPrivacyPolicy = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await adminAppContentAPI.getPrivacyPolicy();
			return { success: true, data: response.data };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch privacy policy';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		} finally {
			setLoading(false);
		}
	}, []);

	const updatePrivacyPolicy = useCallback(async (content) => {
		try {
			setLoading(true);
			setError(null);
			const response = await adminAppContentAPI.updatePrivacyPolicy({ content });
			return { success: true, data: response.data };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to update privacy policy';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		} finally {
			setLoading(false);
		}
	}, []);

	const getTermsOfService = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await adminAppContentAPI.getTermsOfService();
			return { success: true, data: response.data };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch terms of service';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		} finally {
			setLoading(false);
		}
	}, []);

	const updateTermsOfService = useCallback(async (content) => {
		try {
			setLoading(true);
			setError(null);
			const response = await adminAppContentAPI.updateTermsOfService({ content });
			return { success: true, data: response.data };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to update terms of service';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		} finally {
			setLoading(false);
		}
	}, []);

	return {
		loading,
		error,
		getPrivacyPolicy,
		updatePrivacyPolicy,
		getTermsOfService,
		updateTermsOfService,
	};
};

