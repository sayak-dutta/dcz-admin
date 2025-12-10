import { useState, useEffect, useCallback } from 'react';
import { adminMediaAPI } from '@/lib/adminApi';

export const useAdminMedia = () => {
	const [media, setMedia] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 0,
		totalMedia: 0,
		hasNext: false,
		hasPrev: false,
	});

	const fetchMedia = useCallback(async (params = {}) => {
		try {
			setLoading(true);
			setError(null);

			const response = await adminMediaAPI.getAllMedia(params);

			setMedia(response.data.data.media || response.data.data || []);
			setPagination(response.data.data.pagination || {
				currentPage: params.page || 1,
				totalPages: Math.ceil((response.data.data.totalMedia || response.data.data.length || 0) / (params.limit || 20)),
				totalMedia: response.data.data.totalMedia || response.data.data.length || 0,
				hasNext: false,
				hasPrev: false,
			});

			return response.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch media';
			setError(errorMessage);
			console.error('Media fetch error:', err);
			return null;
		} finally {
			setLoading(false);
		}
	}, []);

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
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to update media moderation status';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	}, []);

	const deleteMedia = useCallback(async (mediaId) => {
		try {
			await adminMediaAPI.deleteMedia(mediaId);
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to delete media';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	}, []);

	return {
		media,
		loading,
		error,
		pagination,
		fetchMedia,
		getMediaDetails,
		updateModerationStatus,
		deleteMedia,
		refetch: fetchMedia,
	};
};