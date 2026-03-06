import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
	Search,
	Filter,
	CheckCircle,
	XCircle,
	Eye,
	AlertTriangle,
	MapPin,
	Clock,
	Mail,
	Loader2,
	RefreshCw,
	CheckSquare,
} from 'lucide-react';
import { adminSignupsAPI } from '@/lib/adminApi';

const statusColors = {
	pending: 'warning',
	approved: 'success',
	rejected: 'destructive',
	flagged: 'destructive',
};

export default function NewSignups() {
	const [signups, setSignups] = useState([]);
	const [stats, setStats] = useState({});
	const [loading, setLoading] = useState(false);
	const [actionLoading, setActionLoading] = useState({});
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('pending');
	const [currentPage, setCurrentPage] = useState(1);
	const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
	const [selectedIds, setSelectedIds] = useState(new Set());
	const [bulkLoading, setBulkLoading] = useState(false);
	const [rejectModal, setRejectModal] = useState(null); // { userId, name }
	const [rejectReason, setRejectReason] = useState('');

	const fetchSignups = useCallback(async () => {
		try {
			setLoading(true);
			const params = {
				page: currentPage,
				limit: 20,
				status: statusFilter !== 'all' ? statusFilter : undefined,
				search: searchTerm || undefined,
			};
			const response = await adminSignupsAPI.getAll(params);
			const data = response.data?.data || response.data;
			setSignups(data?.users || data || []);
			setPagination(data?.pagination || { total: 0, totalPages: 1 });
			setStats(data?.stats || {});
		} catch (err) {
			console.error('Failed to fetch signups:', err);
		} finally {
			setLoading(false);
		}
	}, [currentPage, statusFilter, searchTerm]);

	useEffect(() => {
		const delay = searchTerm ? 400 : 0;
		const id = setTimeout(fetchSignups, delay);
		return () => clearTimeout(id);
	}, [fetchSignups]);

	const handleApprove = async (userId) => {
		setActionLoading((prev) => ({ ...prev, [userId]: 'approve' }));
		try {
			await adminSignupsAPI.approve(userId);
			fetchSignups();
		} catch (err) {
			console.error('Approve failed:', err);
		} finally {
			setActionLoading((prev) => { const n = { ...prev }; delete n[userId]; return n; });
		}
	};

	const handleReject = async () => {
		if (!rejectModal) return;
		setActionLoading((prev) => ({ ...prev, [rejectModal.userId]: 'reject' }));
		try {
			await adminSignupsAPI.reject(rejectModal.userId, { reason: rejectReason || 'Rejected by admin', sendEmail: true });
			setRejectModal(null);
			setRejectReason('');
			fetchSignups();
		} catch (err) {
			console.error('Reject failed:', err);
		} finally {
			setActionLoading((prev) => { const n = { ...prev }; delete n[rejectModal?.userId]; return n; });
		}
	};

	const toggleSelect = (id) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			next.has(id) ? next.delete(id) : next.add(id);
			return next;
		});
	};

	const toggleSelectAll = () => {
		if (selectedIds.size === signups.length) {
			setSelectedIds(new Set());
		} else {
			setSelectedIds(new Set(signups.map((s) => s.id || s._id)));
		}
	};

	const handleBulkApprove = async () => {
		setBulkLoading(true);
		try {
			await adminSignupsAPI.bulkApprove({ userIds: [...selectedIds] });
			setSelectedIds(new Set());
			fetchSignups();
		} catch (err) {
			console.error('Bulk approve failed:', err);
		} finally {
			setBulkLoading(false);
		}
	};

	const handleBulkReject = async () => {
		setBulkLoading(true);
		try {
			await adminSignupsAPI.bulkReject({ userIds: [...selectedIds], reason: 'Bulk rejected by admin' });
			setSelectedIds(new Set());
			fetchSignups();
		} catch (err) {
			console.error('Bulk reject failed:', err);
		} finally {
			setBulkLoading(false);
		}
	};

	const getStatusBadge = (status) => {
		const variant = statusColors[status?.toLowerCase()] || 'secondary';
		const icons = {
			verified: <CheckCircle className="w-3 h-3 mr-1" />,
			approved: <CheckCircle className="w-3 h-3 mr-1" />,
			pending: <Clock className="w-3 h-3 mr-1" />,
			flagged: <AlertTriangle className="w-3 h-3 mr-1" />,
			rejected: <XCircle className="w-3 h-3 mr-1" />,
		};
		return (
			<Badge variant={variant} className="flex items-center">
				{icons[status?.toLowerCase()]}
				{status}
			</Badge>
		);
	};

	const statsCards = [
		{ title: 'Total Today', value: stats.totalToday ?? '—', color: 'blue' },
		{ title: 'Pending Approval', value: stats.totalPending ?? '—', color: 'yellow' },
		{ title: 'Approved Today', value: stats.approvedToday ?? '—', color: 'green' },
		{ title: 'Rejected Today', value: stats.rejectedToday ?? '—', color: 'red' },
	];

	return (
		<Layout title="New Signups">
			<div className="space-y-6">
				<p className="text-muted-foreground">Recently registered members awaiting admin approval</p>

				{/* Stats */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{statsCards.map((stat, i) => (
						<Card key={i}>
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
										<p className="text-2xl font-bold">{stat.value}</p>
									</div>
									<div className={`w-3 h-3 rounded-full bg-${stat.color}-500`} />
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Filters + Bulk Actions */}
				<Card>
					<CardHeader>
						<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
							<div className="flex flex-col sm:flex-row gap-3 flex-1">
								<div className="relative max-w-sm flex-1">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
									<Input
										placeholder="Search name or email…"
										className="pl-10"
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
									/>
								</div>
								<select
									className="px-3 py-2 border border-gray-300 rounded-md text-sm"
									value={statusFilter}
									onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
								>
									<option value="pending">Pending</option>
									<option value="approved">Approved</option>
									<option value="rejected">Rejected</option>
									<option value="all">All</option>
								</select>
								<Button variant="ghost" size="sm" onClick={fetchSignups} title="Refresh">
									<RefreshCw className="w-4 h-4" />
								</Button>
							</div>

							{selectedIds.size > 0 && (
								<div className="flex gap-2">
									<Button
										size="sm"
										className="bg-green-600 hover:bg-green-700 text-white"
										onClick={handleBulkApprove}
										disabled={bulkLoading}
									>
										{bulkLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <CheckCircle className="w-3 h-3 mr-1" />}
										Approve {selectedIds.size}
									</Button>
									<Button
										size="sm"
										variant="destructive"
										onClick={handleBulkReject}
										disabled={bulkLoading}
									>
										{bulkLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
										Reject {selectedIds.size}
									</Button>
								</div>
							)}
						</div>
					</CardHeader>
				</Card>

				{/* Signups Grid */}
				{loading ? (
					<div className="flex items-center justify-center p-12">
						<Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading signups…
					</div>
				) : signups.length === 0 ? (
					<div className="text-center py-12 text-muted-foreground">
						<CheckSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
						<p>No signups found for this filter.</p>
					</div>
				) : (
					<>
						{/* Select All bar */}
						<div className="flex items-center gap-3 text-sm text-muted-foreground px-1">
							<input
								type="checkbox"
								checked={selectedIds.size === signups.length && signups.length > 0}
								onChange={toggleSelectAll}
								className="accent-blue-600 w-4 h-4 cursor-pointer"
							/>
							<span>Select all on this page ({signups.length})</span>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{signups.map((user) => {
								const uid = user.id || user._id;
								const isSelected = selectedIds.has(uid);
								const busy = actionLoading[uid];
								return (
									<Card
										key={uid}
										className={`relative transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
									>
										{/* select toggle */}
										<div className="absolute top-3 left-3">
											<input
												type="checkbox"
												checked={isSelected}
												onChange={() => toggleSelect(uid)}
												className="accent-blue-600 w-4 h-4 cursor-pointer"
											/>
										</div>

										{user.flagged && (
											<div className="absolute top-3 right-3">
												<AlertTriangle className="w-5 h-5 text-red-500" />
											</div>
										)}

										<CardContent className="p-6 pt-8">
											<div className="flex items-center space-x-4 mb-4">
												<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
													{user.profilePhoto ? (
														<img src={user.profilePhoto} alt="" className="w-full h-full rounded-full object-cover" />
													) : (
														<span className="text-blue-600 font-semibold">
															{(user.name || user.email || '?').slice(0, 1).toUpperCase()}
														</span>
													)}
												</div>
												<div className="flex-1 min-w-0">
													<h3 className="font-semibold text-base truncate">{user.name || 'Unknown'}</h3>
													<div className="flex items-center text-sm text-gray-500 mt-0.5">
														<Mail className="w-3 h-3 mr-1 flex-shrink-0" />
														<span className="truncate">{user.email}</span>
													</div>
												</div>
											</div>

											<div className="space-y-2 text-sm">
												<div className="flex items-center justify-between">
													<span className="text-gray-500">Status</span>
													{getStatusBadge(user.signupStatus || user.status || 'pending')}
												</div>
												{user.signupAt && (
													<div className="flex items-center text-gray-500">
														<Clock className="w-3 h-3 mr-1.5" />
														{new Date(user.signupAt).toLocaleString()}
													</div>
												)}
												{user.location && (
													<div className="flex items-center text-gray-500">
														<MapPin className="w-3 h-3 mr-1.5" />
														{user.location}
													</div>
												)}
												{user.emailVerified && (
													<div className="flex items-center text-green-600">
														<CheckCircle className="w-3 h-3 mr-1.5" />
														Email verified
													</div>
												)}
											</div>

											<div className="flex gap-2 mt-5">
												<Button size="sm" variant="outline" className="flex-1" disabled={!!busy}>
													<Eye className="w-3 h-3 mr-1" /> View
												</Button>
												<Button
													size="sm"
													className="flex-1 bg-green-600 hover:bg-green-700 text-white"
													onClick={() => handleApprove(uid)}
													disabled={!!busy}
												>
													{busy === 'approve' ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3 mr-1" />}
													Approve
												</Button>
												<Button
													size="sm"
													variant="destructive"
													className="flex-1"
													onClick={() => { setRejectModal({ userId: uid, name: user.name }); setRejectReason(''); }}
													disabled={!!busy}
												>
													{busy === 'reject' ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3 mr-1" />}
													Reject
												</Button>
											</div>
										</CardContent>
									</Card>
								);
							})}
						</div>

						{/* Pagination */}
						<div className="flex items-center justify-between">
							<p className="text-sm text-muted-foreground">
								Page {currentPage} of {pagination.totalPages || 1} ({pagination.total || 0} total)
							</p>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									disabled={currentPage === 1}
									onClick={() => setCurrentPage((p) => p - 1)}
								>
									Previous
								</Button>
								<Button
									variant="outline"
									size="sm"
									disabled={currentPage >= (pagination.totalPages || 1)}
									onClick={() => setCurrentPage((p) => p + 1)}
								>
									Next
								</Button>
							</div>
						</div>
					</>
				)}
			</div>

			{/* Reject Reason Modal */}
			{rejectModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
					<div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-4">
						<h3 className="text-lg font-semibold">Reject Signup — {rejectModal.name}</h3>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Reason (sent to user)</label>
							<textarea
								className="w-full border border-gray-300 rounded-md p-2 text-sm resize-none"
								rows={3}
								placeholder="Incomplete profile / Suspicious activity…"
								value={rejectReason}
								onChange={(e) => setRejectReason(e.target.value)}
							/>
						</div>
						<div className="flex gap-3 justify-end">
							<Button variant="outline" onClick={() => setRejectModal(null)}>Cancel</Button>
							<Button
								variant="destructive"
								onClick={handleReject}
								disabled={!!actionLoading[rejectModal.userId]}
							>
								{actionLoading[rejectModal.userId] ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
								Confirm Reject
							</Button>
						</div>
					</div>
				</div>
			)}
		</Layout>
	);
}
