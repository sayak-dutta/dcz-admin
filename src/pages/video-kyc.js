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
	CheckCircle,
	XCircle,
	Loader2,
	ExternalLink,
	X,
	Clock,
} from 'lucide-react';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function VideoKycApprovals() {
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedUser, setSelectedUser] = useState(null);
	const [showRejectModal, setShowRejectModal] = useState(false);
	const [rejectionReason, setRejectionReason] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const {
		users = [],
		loading,
		error,
		fetchUsers,
		approveVideoKyc,
		rejectVideoKyc,
	} = useAdminUsers();

	useEffect(() => {
		// Fetch all users on mount, we'll filter locally for now
		fetchUsers({ limit: 1000 }); // Try to get a large number to ensure we capture pending ones
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Local filtering for Video KYC pending
	const pendingUsers = users.filter((u) => {
		const isPending = u.verification?.isVideoKycRaised === true && (!u.verification?.videoKycVerified);
		if (!isPending) return false;
		
		if (searchTerm) {
			const term = searchTerm.toLowerCase();
			return (
				(u.username && u.username.toLowerCase().includes(term)) ||
				(u.name && u.name.toLowerCase().includes(term)) ||
				(u.email && u.email.toLowerCase().includes(term))
			);
		}
		return true;
	});

	const handleApprove = async (userId) => {
		if (window.confirm("Are you sure you want to approve this user's Video KYC?")) {
			setIsSubmitting(true);
			await approveVideoKyc(userId);
			setIsSubmitting(false);
			fetchUsers({ limit: 1000 });
		}
	};

	const openRejectModal = (user) => {
		setSelectedUser(user);
		setRejectionReason('');
		setShowRejectModal(true);
	};

	const handleRejectSubmit = async (e) => {
		e.preventDefault();
		if (!rejectionReason.trim() || !selectedUser) return;
		
		setIsSubmitting(true);
		await rejectVideoKyc(selectedUser._id, { reason: rejectionReason.trim() });
		setIsSubmitting(false);
		setShowRejectModal(false);
		setSelectedUser(null);
		fetchUsers({ limit: 1000 });
	};

	return (
		<Layout title="Video KYC Approvals">
			<div className="space-y-6">
				{/* Header Actions */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<p className="text-muted-foreground">Manage pending Video KYC requests</p>
					<Button
						variant="outline"
						onClick={() => fetchUsers({ limit: 1000 })}
						disabled={loading}
					>
						{loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Clock className="w-4 h-4 mr-2" />}
						Refresh List
					</Button>
				</div>

				<Card>
					<CardHeader>
						<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
							<CardTitle>Needs Approval ({pendingUsers.length})</CardTitle>
							<div className="relative w-full max-w-sm">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
								<Input
									placeholder="Search users..."
									className="pl-10"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						{loading && pendingUsers.length === 0 ? (
							<div className="flex items-center justify-center p-8">
								<Loader2 className="w-6 h-6 animate-spin mr-2" />
								Loading pending requests...
							</div>
						) : error ? (
							<div className="text-center p-8 text-red-600">Error: {error}</div>
						) : pendingUsers.length === 0 ? (
							<div className="text-center p-12 border-2 border-dashed border-gray-200 rounded-lg">
								<CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
								<h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
								<p className="text-gray-500 mt-1">There are no pending Video KYC requests at the moment.</p>
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>User</TableHead>
										<TableHead>Meeting Url</TableHead>
										<TableHead>Joined</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{pendingUsers.map((user) => {
										const uid = user._id || user.id;
										return (
											<TableRow key={uid}>
												<TableCell>
													<div className="flex items-center space-x-3">
														{user.profile?.photos?.[0] ? (
															<img src={user.profile.photos[0]} alt="" className="w-8 h-8 rounded-full object-cover" />
														) : (
															<div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold">
																{(user.username || user.name || '?')[0].toUpperCase()}
															</div>
														)}
														<div>
															<p className="font-medium text-sm">{user.username || user.name}</p>
															<p className="text-xs text-gray-500">{user.email}</p>
														</div>
													</div>
												</TableCell>
												<TableCell>
													{user.verification?.videoKycUrl ? (
														<a 
															href={user.verification.videoKycUrl} 
															target="_blank" 
															rel="noopener noreferrer"
															className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
														>
															Join Booking
															<ExternalLink className="w-3 h-3 ml-1" />
														</a>
													) : (
														<span className="text-sm text-gray-400 italic">No URL provided</span>
													)}
												</TableCell>
												<TableCell className="text-sm">
													{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
												</TableCell>
												<TableCell className="text-right">
													<div className="flex items-center justify-end space-x-2">
														<Button
															size="sm"
															className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
															onClick={() => handleApprove(uid)}
															disabled={isSubmitting}
														>
															<CheckCircle className="w-4 h-4 mr-1.5" /> Approve
														</Button>
														<Button
															size="sm"
															variant="destructive"
															onClick={() => openRejectModal(user)}
															disabled={isSubmitting}
														>
															<XCircle className="w-4 h-4 mr-1.5" /> Reject
														</Button>
													</div>
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Reject Modal */}
			{showRejectModal && selectedUser && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
					<div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-5">
						<div className="flex items-center justify-between border-b pb-3">
							<h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
								<XCircle className="w-5 h-5 text-red-500" />
								Reject Video KYC
							</h3>
							<button onClick={() => setShowRejectModal(false)} className="text-gray-400 hover:text-gray-600">
								<X className="w-5 h-5" />
							</button>
						</div>

						<form onSubmit={handleRejectSubmit} className="space-y-4">
							<p className="text-sm text-gray-600">
								Please provide a reason for rejecting the Video KYC for <span className="font-semibold">{selectedUser.name || selectedUser.username}</span>. 
								The user will see this reason so they can correct the issue.
							</p>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason *</label>
								<textarea
									className="w-full flex min-h-[100px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="E.g., Document is illegible, Face does not match ID, Call was missed, etc."
									value={rejectionReason}
									onChange={(e) => setRejectionReason(e.target.value)}
									required
									autoFocus
								/>
							</div>

							<div className="flex gap-3 justify-end pt-3 border-t">
								<Button type="button" variant="outline" onClick={() => setShowRejectModal(false)}>
									Cancel
								</Button>
								<Button type="submit" variant="destructive" disabled={isSubmitting || !rejectionReason.trim()}>
									{isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
									Confirm Rejection
								</Button>
							</div>
						</form>
					</div>
				</div>
			)}
		</Layout>
	);
}
