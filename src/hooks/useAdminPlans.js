import { useState, useCallback, useEffect } from 'react';
import { adminPlansAPI } from '@/lib/adminApi';

export const useAdminPlans = (initialParams = {}) => {
	const [plans, setPlans] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 20,
		total: 0,
		totalPages: 0,
	});

	const fetchPlans = useCallback(async (params = {}) => {
		try {
			setLoading(true);
			setError(null);
			const queryParams = { ...initialParams, ...params };
			const response = await adminPlansAPI.getAllPlans(queryParams);
			const plansData = response.data?.data?.plans || response.data?.data || response.data || [];
			setPlans(Array.isArray(plansData) ? plansData : []);
			if (response.data?.pagination) {
				setPagination(response.data.pagination);
			}
			return response.data;
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch plans';
			setError(errorMessage);
			console.error('Plans fetch error:', err);
			return null;
		} finally {
			setLoading(false);
		}
	}, []);

	const createPlan = useCallback(async (planData) => {
		try {
			setLoading(true);
			setError(null);
			const response = await adminPlansAPI.createPlan(planData);
			return { success: true, data: response.data };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to create plan';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		} finally {
			setLoading(false);
		}
	}, []);

	const updatePlan = useCallback(async (planId, planData) => {
		try {
			setLoading(true);
			setError(null);
			const response = await adminPlansAPI.updatePlan(planId, planData);
			return { success: true, data: response.data };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to update plan';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		} finally {
			setLoading(false);
		}
	}, []);

	const deletePlan = useCallback(async (planId) => {
		try {
			setLoading(true);
			setError(null);
			const response = await adminPlansAPI.deletePlan(planId);
			return { success: true, data: response.data };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to delete plan';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		} finally {
			setLoading(false);
		}
	}, []);

	const getPlanStats = useCallback(async (planId) => {
		try {
			setLoading(true);
			setError(null);
			const response = await adminPlansAPI.getPlanStats(planId);
			return { success: true, data: response.data };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to fetch plan stats';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		} finally {
			setLoading(false);
		}
	}, []);

	const bulkUpdatePlans = useCallback(async (bulkData) => {
		try {
			setLoading(true);
			setError(null);
			const response = await adminPlansAPI.bulkUpdatePlans(bulkData);
			return { success: true, data: response.data };
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to bulk update plans';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		} finally {
			setLoading(false);
		}
	}, []);

	return {
		plans,
		loading,
		error,
		pagination,
		fetchPlans,
		createPlan,
		updatePlan,
		deletePlan,
		getPlanStats,
		bulkUpdatePlans,
	};
};

