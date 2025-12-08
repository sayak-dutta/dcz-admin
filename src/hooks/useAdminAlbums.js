import { useState, useEffect, useCallback } from 'react';
import { adminAlbumsAPI } from '@/lib/adminApi';

export const useAdminAlbums = (initialParams = {}) => {
	const [albums, setAlbums] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const fetchAlbums = useCallback(async (params = {}) => {
		try {
			setLoading(true);
			setError(null);

			const queryParams = { ...initialParams, ...params };
			const response = await adminAlbumsAPI.getAllAlbums(queryParams);

			setAlbums(response.data.albums || response.data || []);
			return response.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch albums';
			setError(errorMessage);
			console.error('Albums fetch error:', err);
			return null;
		} finally {
			setLoading(false);
		}
	}, [initialParams]);

	const getAlbumDetails = useCallback(async (albumId) => {
		try {
			const response = await adminAlbumsAPI.getAlbumDetails(albumId);
			return response.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch album details';
			setError(errorMessage);
			throw new Error(errorMessage);
		}
	}, []);

	const moderateAlbum = useCallback(async (albumId, moderationData) => {
		try {
			await adminAlbumsAPI.moderateAlbum(albumId, moderationData);
			await fetchAlbums(); // Refresh the list
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to moderate album';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	}, [fetchAlbums]);

	const deleteAlbum = useCallback(async (albumId) => {
		try {
			await adminAlbumsAPI.deleteAlbum(albumId);
			await fetchAlbums(); // Refresh the list
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to delete album';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	}, [fetchAlbums]);

	useEffect(() => {
		fetchAlbums();
	}, [fetchAlbums]);

	return {
		albums,
		loading,
		error,
		fetchAlbums,
		getAlbumDetails,
		moderateAlbum,
		deleteAlbum,
		refetch: () => fetchAlbums(),
	};
};
