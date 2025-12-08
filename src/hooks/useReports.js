import { useState, useEffect, useCallback } from 'react';
import { moderationAPI } from '@/lib/api';

export const useReports = (params = {}) => {
	const [reports, setReports] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [stats, setStats] = useState({
		totalReports: 0,
		pendingReview: 0,
		resolvedToday: 0,
		avgResponseTime: '0h'
	});

	const fetchReports = useCallback(async (searchParams = {}) => {
		setLoading(true);
		setError(null);

		try {
			const response = await moderationAPI.getReportedContent({
				...params,
				...searchParams
			});

			setReports(response.data.reports || response.data);

			// Update stats if provided
			if (response.data.stats) {
				setStats(response.data.stats);
			}
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to fetch reports');
			console.error('Error fetching reports:', err);
		} finally {
			setLoading(false);
		}
	}, [params]);

	const resolveReport = async (reportId, action, reason = '') => {
		try {
			await moderationAPI.resolveReport(reportId, { action, reason });
			// Refresh reports list
			await fetchReports();
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to resolve report';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	};

	const reportUser = async (userId, reportData) => {
		try {
			await moderationAPI.reportUser(userId, reportData);
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to report user';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	};

	const reportPost = async (postId, reportData) => {
		try {
			await moderationAPI.reportPost(postId, reportData);
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to report post';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	};

	useEffect(() => {
		fetchReports();
	}, [fetchReports]);

	return {
		reports,
		loading,
		error,
		stats,
		fetchReports,
		resolveReport,
		reportUser,
		reportPost,
		refetch: () => fetchReports()
	};
};
