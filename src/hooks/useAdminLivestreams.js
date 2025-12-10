import { useState, useEffect, useCallback } from 'react';
import { adminLivestreamsAPI } from '@/lib/adminApi';

export const useAdminLivestreams = () => {
	const [livestreams, setLivestreams] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 0,
		totalLivestreams: 0,
		hasNext: false,
		hasPrev: false,
	});

	const fetchLivestreams = useCallback(async (params = {}) => {
		try {
			setLoading(true);
			setError(null);

			const response = await adminLivestreamsAPI.getAllLivestreams(params);

			setLivestreams(response.data.data.livestreams || response.data.data || []);
			setPagination(response.data.data.pagination || {
				currentPage: params.page || 1,
				totalPages: Math.ceil((response.data.data.totalLivestreams || response.data.data.length || 0) / (params.limit || 20)),
				totalLivestreams: response.data.data.totalLivestreams || response.data.data.length || 0,
				hasNext: false,
				hasPrev: false,
			});

			return response.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch livestreams';
			setError(errorMessage);
			console.error('Livestreams fetch error:', err);
			return null;
		} finally {
			setLoading(false);
		}
	}, []);

	const getLivestreamDetails = useCallback(async (livestreamId) => {
		try {
			const response = await adminLivestreamsAPI.getLivestreamDetails(livestreamId);
			return response.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch livestream details';
			setError(errorMessage);
			throw new Error(errorMessage);
		}
	}, []);

	return {
		livestreams,
		loading,
		error,
		pagination,
		fetchLivestreams,
		getLivestreamDetails,
		refetch: fetchLivestreams,
	};
};
