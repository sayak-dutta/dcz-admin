import { useState, useEffect, useCallback } from 'react';
import { adminReportsAPI } from '@/lib/adminApi';

export const useAdminReports = (initialParams = {}) => {
	const [reports, setReports] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [summary, setSummary] = useState(null);

	const fetchReports = useCallback(async (params = {}) => {
		try {
			setLoading(true);
			setError(null);

			const queryParams = { ...initialParams, ...params };
			const response = await adminReportsAPI.getAllReports(queryParams);

			setReports(response.data.data.reports || response.data.data || []);
			return response.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch reports';
			setError(errorMessage);
			console.error('Reports fetch error:', err);
			return null;
		} finally {
			setLoading(false);
		}
	}, [initialParams]);

	const getReportDetails = useCallback(async (reportId) => {
		try {
			const response = await adminReportsAPI.getReportDetails(reportId);
			return response.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch report details';
			setError(errorMessage);
			throw new Error(errorMessage);
		}
	}, []);

	const processReport = useCallback(async (reportId, processData) => {
		try {
			await adminReportsAPI.processReport(reportId, processData);
			await fetchReports(); // Refresh the list
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to process report';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	}, [fetchReports]);

	const getReportsSummary = useCallback(async (params = {}) => {
		try {
			const response = await adminReportsAPI.getReportsSummary(params);
			setSummary(response.data);
			return response.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch reports summary';
			setError(errorMessage);
			return null;
		}
	}, []);

	const bulkProcessReports = useCallback(async (bulkData) => {
		try {
			await adminReportsAPI.bulkProcessReports(bulkData);
			await fetchReports(); // Refresh the list
			return { success: true };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to process reports';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	}, [fetchReports]);

	useEffect(() => {
		fetchReports();
	}, [2]);

	return {
		reports,
		loading,
		error,
		summary,
		fetchReports,
		getReportDetails,
		processReport,
		getReportsSummary,
		bulkProcessReports,
		refetch: () => fetchReports(),
	};
};
