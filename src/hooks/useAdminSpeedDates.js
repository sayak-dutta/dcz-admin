import { useState, useEffect, useCallback } from 'react';
import { adminSpeedDatesAPI } from '@/lib/adminApi';

export const useAdminSpeedDates = () => {
	const [speedDates, setSpeedDates] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 0,
		totalSpeedDates: 0,
		hasNext: false,
		hasPrev: false,
	});

	const fetchSpeedDates = useCallback(async (params = {}) => {
		try {
			setLoading(true);
			setError(null);

			const response = await adminSpeedDatesAPI.getAllSpeedDates(params);

			setSpeedDates(response.data.data.speedDates || response.data.data || []);
			setPagination(response.data.data.pagination || {
				currentPage: params.page || 1,
				totalPages: Math.ceil((response.data.data.totalSpeedDates || response.data.data.length || 0) / (params.limit || 20)),
				totalSpeedDates: response.data.data.totalSpeedDates || response.data.data.length || 0,
				hasNext: false,
				hasPrev: false,
			});

			return response.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch speed dates';
			setError(errorMessage);
			console.error('Speed dates fetch error:', err);
			return null;
		} finally {
			setLoading(false);
		}
	}, []);

	const getSpeedDateDetails = useCallback(async (speedDateId) => {
		try {
			const response = await adminSpeedDatesAPI.getSpeedDateDetails(speedDateId);
			return response.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch speed date details';
			setError(errorMessage);
			throw new Error(errorMessage);
		}
	}, []);

	return {
		speedDates,
		loading,
		error,
		pagination,
		fetchSpeedDates,
		getSpeedDateDetails,
		refetch: fetchSpeedDates,
	};
};
