import { useState, useEffect, useCallback } from 'react';
import { adminMediaAPI } from '@/lib/adminApi';

export const useAdminMedia = (initialParams = {}) => {
	const [media, setMedia] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const fetchMedia = useCallback(async (params = {}) => {
		try {
			setLoading(true);
			setError(null);

			const queryParams = { ...initialParams, ...params };
			const response = await adminMediaAPI.getAllMedia(queryParams);

			setMedia(response.data.media || response.data || []);
			return response.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch media';
			setError(errorMessage);
			console.error('Media fetch error:', err);
			return null;
		} finally {
			setLoading(false);
		}
	}, [initialParams]);

	const getMediaDetails = useCallback(async (mediaId) => {
		try {
			const response = await adminMediaAPI.getMediaDetails(mediaId);
			return response.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch media details';
			setError(errorMessage);
			throw new Error(errorMessage);
		}
	}, []);

	const updateModerationStatus = useCallback(async (mediaId, statusData) => {
		try {
			await adminMediaAPI.updateModerationStatus(mediaId, statusData);
			await fetchMedia(); // Refresh the list
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to update media moderation status';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	}, [fetchMedia]);

	const deleteMedia = useCallback(async (mediaId) => {
		try {
			await adminMediaAPI.deleteMedia(mediaId);
			await fetchMedia(); // Refresh the list
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to delete media';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	}, [fetchMedia]);

	useEffect(() => {
		fetchMedia();
	}, [fetchMedia]);

	return {
		media,
		loading,
		error,
		fetchMedia,
		getMediaDetails,
		updateModerationStatus,
		deleteMedia,
		refetch: () => fetchMedia(),
	};
};
