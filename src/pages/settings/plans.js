import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	Search,
	Filter,
	Plus,
	Edit,
	Trash2,
	Eye,
	Loader2,
	DollarSign,
	CheckCircle,
	XCircle
} from 'lucide-react';
import { useAdminPlans } from '@/hooks/useAdminPlans';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function PlansManagement() {
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [currentPage, setCurrentPage] = useState(1);
	const [showPlanModal, setShowPlanModal] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [showStatsModal, setShowStatsModal] = useState(false);
	const [selectedPlan, setSelectedPlan] = useState(null);
	const [planStats, setPlanStats] = useState(null);
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		price: { amount: '', currency: 'INR' },
		duration: { value: '', unit: 'months' },
		features: [],
		permissions: [],
		isActive: true,
	});
	const [featureInput, setFeatureInput] = useState('');
	const [permissionInput, setPermissionInput] = useState('');

	const {
		plans,
		loading,
		error,
		pagination,
		fetchPlans,
		createPlan,
		updatePlan,
		deletePlan,
		getPlanStats,
	} = useAdminPlans();

	useEffect(() => {
		const delay = searchTerm ? 500 : 0;
		const timeoutId = setTimeout(() => {
			fetchPlans({
				page: currentPage,
				limit: 20,
				search: searchTerm || undefined,
				isActive: statusFilter !== 'all' ? statusFilter === 'active' : undefined,
			});
		}, delay);
		return () => clearTimeout(timeoutId);
	}, [searchTerm, statusFilter, currentPage, fetchPlans]);

	const handleCreatePlan = () => {
		setSelectedPlan(null);
		setIsEditing(false);
		setFormData({
			name: '',
			description: '',
			price: { amount: '', currency: 'INR' },
			duration: { value: '', unit: 'months' },
			features: [],
			permissions: [],
			isActive: true,
		});
		setShowPlanModal(true);
	};

	const handleEditPlan = (plan) => {
		setSelectedPlan(plan);
		setIsEditing(true);

		// Handle features - extract string values if they're objects
		const features = (plan.features || []).map(f =>
			typeof f === 'string' ? f : (f.name || f.description || JSON.stringify(f))
		);

		// Handle permissions - extract string values if they're objects
		const permissions = (plan.permissions || []).map(p =>
			typeof p === 'string' ? p : (p.name || p.description || JSON.stringify(p))
		);

		setFormData({
			name: plan.name || '',
			description: plan.description || '',
			price: plan.price || { amount: '', currency: 'INR' },
			duration: plan.duration || { value: '', unit: 'months' },
			features: features,
			permissions: permissions,
			isActive: plan.isActive !== undefined ? plan.isActive : true,
		});
		setShowPlanModal(true);
	};

	const handleDeletePlan = (plan) => {
		setSelectedPlan(plan);
		setShowDeleteDialog(true);
	};

	const confirmDeletePlan = async () => {
		if (!selectedPlan) return;
		const result = await deletePlan(selectedPlan._id);
		if (result.success) {
			setShowDeleteDialog(false);
			setSelectedPlan(null);
			fetchPlans({
				page: currentPage,
				limit: 20,
				search: searchTerm || undefined,
				isActive: statusFilter !== 'all' ? statusFilter === 'active' : undefined,
			});
		}
	};

	const handleViewStats = async (plan) => {
		setSelectedPlan(plan);
		setShowStatsModal(true);
		const result = await getPlanStats(plan._id);
		if (result.success) {
			setPlanStats(result.data?.data || result.data);
		}
	};

	const handleSavePlan = async () => {
		// Validate form
		if (!formData.name || !formData.description) {
			alert('Please fill in all required fields');
			return;
		}

		const planPayload = {
			name: formData.name,
			description: formData.description,
			price: {
				amount: Number(formData.price.amount),
				currency: formData.price.currency,
			},
			duration: {
				value: Number(formData.duration.value),
				unit: formData.duration.unit,
			},
			features: formData.features,
			permissions: formData.permissions,
			isActive: formData.isActive,
		};

		let result;
		if (isEditing && selectedPlan) {
			result = await updatePlan(selectedPlan._id, planPayload);
		} else {
			result = await createPlan(planPayload);
		}

		if (result.success) {
			setShowPlanModal(false);
			setSelectedPlan(null);
			fetchPlans({
				page: currentPage,
				limit: 20,
				search: searchTerm || undefined,
				isActive: statusFilter !== 'all' ? statusFilter === 'active' : undefined,
			});
		} else {
			alert(result.error || 'Failed to save plan');
		}
	};

	const addFeature = () => {
		if (featureInput.trim()) {
			setFormData({
				...formData,
				features: [...formData.features, featureInput.trim()],
			});
			setFeatureInput('');
		}
	};

	const removeFeature = (index) => {
		setFormData({
			...formData,
			features: formData.features.filter((_, i) => i !== index),
		});
	};

	const addPermission = () => {
		if (permissionInput.trim()) {
			setFormData({
				...formData,
				permissions: [...formData.permissions, permissionInput.trim()],
			});
			setPermissionInput('');
		}
	};

	const removePermission = (index) => {
		setFormData({
			...formData,
			permissions: formData.permissions.filter((_, i) => i !== index),
		});
	};

	const formatPrice = (price) => {
		if (!price) return 'N/A';
		return `${price.currency} ${price.amount}`;
	};

	const formatDuration = (duration) => {
		if (!duration) return 'N/A';
		return `${duration.value} ${duration.unit}`;
	};

	return (
		<Layout title="Subscription Plans">
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<p className="text-muted-foreground">
						Manage subscription plans and pricing
					</p>
					<Button onClick={handleCreatePlan} className="bg-blue-600 hover:bg-blue-700">
						<Plus className="w-4 h-4 mr-2" />
						Create Plan
					</Button>
				</div>

				{/* Filters */}
				<Card>
					<CardHeader>
						<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
							<div className="relative flex-1 max-w-sm">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
								<Input
									placeholder="Search plans..."
									className="pl-10"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</div>
							<div className="flex gap-2">
								<select
									className="px-3 py-2 border border-gray-300 rounded-md text-sm"
									value={statusFilter}
									onChange={(e) => setStatusFilter(e.target.value)}
								>
									<option value="all">All Status</option>
									<option value="active">Active</option>
									<option value="inactive">Inactive</option>
								</select>
								<Button variant="outline" size="sm">
									<Filter className="w-4 h-4 mr-2" />
									Filters
								</Button>
							</div>
						</div>
					</CardHeader>

					<CardContent>
						{loading ? (
							<div className="flex items-center justify-center p-8">
								<Loader2 className="w-6 h-6 animate-spin mr-2" />
								Loading plans...
							</div>
						) : error ? (
							<div className="text-center p-8 text-red-600">
								Error: {error}
							</div>
						) : plans.length === 0 ? (
							<div className="text-center p-8 text-muted-foreground">
								No plans found. Create your first plan to get started.
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Description</TableHead>
										<TableHead>Price</TableHead>
										<TableHead>Duration</TableHead>
										<TableHead>Status</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{plans.map((plan) => (
										<TableRow key={plan._id}>
											<TableCell className="font-medium">{plan.name}</TableCell>
											<TableCell className="max-w-xs truncate">{plan.description}</TableCell>
											<TableCell>{formatPrice(plan.price)}</TableCell>
											<TableCell>{formatDuration(plan.duration)}</TableCell>
											<TableCell>
												{plan.isActive ? (
													<Badge variant="success" className="bg-green-100 text-green-800">
														<CheckCircle className="w-3 h-3 mr-1" />
														Active
													</Badge>
												) : (
													<Badge variant="secondary" className="bg-gray-100 text-gray-800">
														<XCircle className="w-3 h-3 mr-1" />
														Inactive
													</Badge>
												)}
											</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end space-x-2">
													<Button
														size="sm"
														variant="ghost"
														onClick={() => handleViewStats(plan)}
														title="View stats"
													>
														<Eye className="w-4 h-4" />
													</Button>
													<Button
														size="sm"
														variant="ghost"
														onClick={() => handleEditPlan(plan)}
														title="Edit plan"
													>
														<Edit className="w-4 h-4" />
													</Button>
													<Button
														size="sm"
														variant="ghost"
														onClick={() => handleDeletePlan(plan)}
														title="Delete plan"
													>
														<Trash2 className="w-4 h-4 text-red-600" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>

				{/* Pagination */}
				{!loading && plans.length > 0 && pagination.totalPages > 1 && (
					<div className="flex items-center justify-between">
						<p className="text-sm text-muted-foreground">
							Showing {((pagination.page || currentPage) - 1) * (pagination.limit || 20) + 1} to{' '}
							{Math.min((pagination.page || currentPage) * (pagination.limit || 20), pagination.total || plans.length)} of{' '}
							{pagination.total || plans.length} results
						</p>
						<div className="flex space-x-2">
							<Button
								variant="outline"
								size="sm"
								disabled={currentPage <= 1}
								onClick={() => setCurrentPage(prev => prev - 1)}
							>
								Previous
							</Button>
							<Button
								variant="outline"
								size="sm"
								disabled={currentPage >= (pagination.totalPages || 1)}
								onClick={() => setCurrentPage(prev => prev + 1)}
							>
								Next
							</Button>
						</div>
					</div>
				)}
			</div>

			{/* Create/Edit Plan Modal */}
			<Modal
				isOpen={showPlanModal}
				onClose={() => {
					setShowPlanModal(false);
					setSelectedPlan(null);
					setIsEditing(false);
				}}
				title={isEditing ? 'Edit Plan' : 'Create New Plan'}
				size="xl"
			>
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Plan Name <span className="text-red-500">*</span>
						</label>
						<Input
							value={formData.name}
							onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							placeholder="e.g., Premium Monthly"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Description <span className="text-red-500">*</span>
						</label>
						<textarea
							className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
							rows={3}
							value={formData.description}
							onChange={(e) => setFormData({ ...formData, description: e.target.value })}
							placeholder="Describe the plan features and benefits"
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Price Amount <span className="text-red-500">*</span>
							</label>
							<Input
								type="number"
								value={formData.price.amount}
								onChange={(e) => setFormData({
									...formData,
									price: { ...formData.price, amount: e.target.value }
								})}
								placeholder="999"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Currency
							</label>
							<select
								className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
								value={formData.price.currency}
								onChange={(e) => setFormData({
									...formData,
									price: { ...formData.price, currency: e.target.value }
								})}
							>
								<option value="INR">INR</option>
								<option value="USD">USD</option>
								<option value="EUR">EUR</option>
							</select>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Duration Value <span className="text-red-500">*</span>
							</label>
							<Input
								type="number"
								value={formData.duration.value}
								onChange={(e) => setFormData({
									...formData,
									duration: { ...formData.duration, value: e.target.value }
								})}
								placeholder="1"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Duration Unit
							</label>
							<select
								className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
								value={formData.duration.unit}
								onChange={(e) => setFormData({
									...formData,
									duration: { ...formData.duration, unit: e.target.value }
								})}
							>
								<option value="days">Days</option>
								<option value="weeks">Weeks</option>
								<option value="months">Months</option>
								<option value="years">Years</option>
							</select>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Features
						</label>
						<div className="flex gap-2 mb-2">
							<Input
								value={featureInput}
								onChange={(e) => setFeatureInput(e.target.value)}
								onKeyPress={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										addFeature();
									}
								}}
								placeholder="Add a feature and press Enter"
							/>
							<Button type="button" onClick={addFeature} variant="outline">
								Add
							</Button>
						</div>
						<div className="flex flex-wrap gap-2">
							{formData.features.map((feature, index) => {
								const featureText = typeof feature === 'string' ? feature : (feature?.name || feature?.description || JSON.stringify(feature));
								return (
									<Badge key={index} variant="outline" className="flex items-center gap-1">
										{featureText}
										<button
											type="button"
											onClick={() => removeFeature(index)}
											className="ml-1 text-red-600 hover:text-red-800"
										>
											×
										</button>
									</Badge>
								);
							})}
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Permissions
						</label>
						<div className="flex gap-2 mb-2">
							<Input
								value={permissionInput}
								onChange={(e) => setPermissionInput(e.target.value)}
								onKeyPress={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										addPermission();
									}
								}}
								placeholder="Add a permission and press Enter"
							/>
							<Button type="button" onClick={addPermission} variant="outline">
								Add
							</Button>
						</div>
						<div className="flex flex-wrap gap-2">
							{formData.permissions.map((permission, index) => {
								const permissionText = typeof permission === 'string' ? permission : (permission?.name || permission?.description || JSON.stringify(permission));
								return (
									<Badge key={index} variant="outline" className="flex items-center gap-1">
										{permissionText}
										<button
											type="button"
											onClick={() => removePermission(index)}
											className="ml-1 text-red-600 hover:text-red-800"
										>
											×
										</button>
									</Badge>
								);
							})}
						</div>
					</div>

					<div className="flex items-center">
						<input
							type="checkbox"
							id="isActive"
							checked={formData.isActive}
							onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
							className="h-4 w-4 text-blue-600 border-gray-300 rounded"
						/>
						<label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
							Plan is active
						</label>
					</div>

					<div className="flex justify-end space-x-3 pt-4 border-t">
						<Button
							variant="outline"
							onClick={() => {
								setShowPlanModal(false);
								setSelectedPlan(null);
								setIsEditing(false);
							}}
						>
							Cancel
						</Button>
						<Button onClick={handleSavePlan} className="bg-blue-600 hover:bg-blue-700">
							{isEditing ? 'Update Plan' : 'Create Plan'}
						</Button>
					</div>
				</div>
			</Modal>

			{/* Stats Modal */}
			<Modal
				isOpen={showStatsModal}
				onClose={() => {
					setShowStatsModal(false);
					setSelectedPlan(null);
					setPlanStats(null);
				}}
				title={`Plan Statistics: ${selectedPlan?.name || ''}`}
				size="lg"
			>
				{planStats ? (
					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="p-4 bg-gray-50 rounded-lg">
								<p className="text-sm text-gray-600">Total Subscribers</p>
								<p className="text-2xl font-bold">{planStats.totalSubscribers || 0}</p>
							</div>
							<div className="p-4 bg-gray-50 rounded-lg">
								<p className="text-sm text-gray-600">Active Subscriptions</p>
								<p className="text-2xl font-bold">{planStats.activeSubscriptions || 0}</p>
							</div>
							<div className="p-4 bg-gray-50 rounded-lg">
								<p className="text-sm text-gray-600">Revenue</p>
								<p className="text-2xl font-bold">
									{planStats.revenue ? `${planStats.revenue.currency} ${planStats.revenue.amount}` : 'N/A'}
								</p>
							</div>
							<div className="p-4 bg-gray-50 rounded-lg">
								<p className="text-sm text-gray-600">Cancellations</p>
								<p className="text-2xl font-bold">{planStats.cancellations || 0}</p>
							</div>
						</div>
					</div>
				) : (
					<div className="flex items-center justify-center p-8">
						<Loader2 className="w-6 h-6 animate-spin mr-2" />
						Loading statistics...
					</div>
				)}
			</Modal>

			{/* Delete Confirmation Dialog */}
			<ConfirmDialog
				isOpen={showDeleteDialog}
				onClose={() => {
					setShowDeleteDialog(false);
					setSelectedPlan(null);
				}}
				onConfirm={confirmDeletePlan}
				title="Delete Plan"
				description={`Are you sure you want to delete "${selectedPlan?.name}"? This action cannot be undone.`}
				confirmLabel="Delete"
			/>
		</Layout>
	);
}

