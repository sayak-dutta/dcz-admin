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
	Download,
	UserPlus,
	Eye,
	MessageSquare,
	Ban,
	MoreVertical,
	Star,
	Loader2
} from 'lucide-react';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { StatusBadge } from '@/components/ui/status-badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Modal } from '@/components/ui/modal';

const filterOptions = [
	{ label: "All Status", value: "all" },
	{ label: "Active", value: "active" },
	{ label: "Pending", value: "pending" },
	{ label: "Suspended", value: "suspended" }
];

const membershipOptions = [
	{ label: "All Memberships", value: "all" },
	{ label: "Free", value: "free" },
	{ label: "Premium", value: "premium" },
	{ label: "VIP", value: "vip" }
];

export default function AllMembers() {
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [membershipFilter, setMembershipFilter] = useState('all');
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedUser, setSelectedUser] = useState(null);
	const [showBanDialog, setShowBanDialog] = useState(false);
	const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
	const [userDetails, setUserDetails] = useState(null);

	const {
		users: members,
		loading,
		error,
		pagination,
		fetchUsers,
		banUser: banUserAPI,
		unbanUser: unbanUserAPI
	} = useAdminUsers();

	// Refetch when filters change (debounced for search, immediate for page/filters)
	useEffect(() => {
		const isInitialMount = currentPage === 1 && !searchTerm && statusFilter === 'all' && membershipFilter === 'all';
		const delay = isInitialMount ? 0 : (searchTerm ? 500 : 0); // Only debounce search, not page/filter changes

		const timeoutId = setTimeout(() => {
			fetchUsers({
				page: currentPage,
				limit: 20,
				search: searchTerm || undefined,
				status: statusFilter !== 'all' ? statusFilter : undefined,
				membership: membershipFilter !== 'all' ? membershipFilter : undefined
			});
		}, delay);

		return () => clearTimeout(timeoutId);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchTerm, statusFilter, membershipFilter, currentPage]); // fetchUsers is stable (no dependencies), safe to omit

	const handleViewUserDetails = async (user) => {
		setUserDetails(user);
		setShowUserDetailsModal(true);
	};

	const handleBanUser = (user) => {
		console.log(user);
		setSelectedUser(user);
		setShowBanDialog(true);
	};

	const confirmBanUser = async () => {
		if (!selectedUser) return;

		const result = await banUserAPI({
			id: selectedUser._id,
			reason: 'Banned by admin'
		});

			if (result.success) {
			setShowBanDialog(false);
			setSelectedUser(null);
			// Success message could be added here with a toast notification
			} else {
			// Error message could be added here with a toast notification
			console.error('Failed to ban user:', result.error);
			}
	};

	const handleUnbanUser = async (userId) => {
		const result = await unbanUserAPI({
			id: userId
		});

		if (result.success) {
			// Success message could be added here with a toast notification
		} else {
			// Error message could be added here with a toast notification
			console.error('Failed to unban user:', result.error);
		}
	};

	const getStatusBadge = (status) => {
		switch (status.toLowerCase()) {
			case 'active': return <Badge variant="success">Active</Badge>;
			case 'pending': return <Badge variant="warning">Pending</Badge>;
			case 'suspended': return <Badge variant="destructive">Suspended</Badge>;
			default: return <Badge variant="secondary">{status}</Badge>;
		}
	};

	const getMembershipBadge = (membership) => {
		switch (membership.toLowerCase()) {
			case 'premium': return <Badge variant="default"><Star className="w-3 h-3 mr-1" />Premium</Badge>;
			case 'vip': return <Badge variant="secondary"><Star className="w-3 h-3 mr-1" />VIP</Badge>;
			case 'free': return <Badge variant="outline">Free</Badge>;
			default: return <Badge variant="outline">{membership}</Badge>;
		}
	};

	return (
		<Layout title="All Members">
			<div className="space-y-6">
				{/* Header Actions */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<p className="text-muted-foreground">
						Manage all registered members
					</p>
					<Button className="bg-blue-600 hover:bg-blue-700">
						<UserPlus className="w-4 h-4 mr-2" />
						Add Member
					</Button>
				</div>

				{/* Filters */}
				<Card>
					<CardHeader>
						<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
							<div className="relative flex-1 max-w-sm">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
								<Input
									placeholder="Search members..."
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
									{filterOptions.map(option => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>

								<select
									className="px-3 py-2 border border-gray-300 rounded-md text-sm"
									value={membershipFilter}
									onChange={(e) => setMembershipFilter(e.target.value)}
								>
									{membershipOptions.map(option => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>

								<Button variant="outline" size="sm">
									<Filter className="w-4 h-4 mr-2" />
									Filters
								</Button>

								<Button variant="outline" size="sm">
									<Download className="w-4 h-4 mr-2" />
									Export
								</Button>
							</div>
						</div>
					</CardHeader>

					<CardContent>
						{loading ? (
							<div className="flex items-center justify-center p-8">
								<Loader2 className="w-6 h-6 animate-spin mr-2" />
								Loading members...
							</div>
						) : error ? (
							<div className="text-center p-8 text-red-600">
								Error: {error}
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Member</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Membership</TableHead>
										<TableHead>Joined</TableHead>
										<TableHead>Last Active</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{members?.map((member) => (
										<TableRow key={member._id}>
											<TableCell>
												<div className="flex items-center space-x-3">

													<img src={member.profile.photos[0]} alt="" className="w-8 h-8 rounded-full" />
													<div>
														<p className="font-medium text-sm">{member.username}</p>
														<p className="text-xs text-gray-500">{member.email}</p>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<StatusBadge status={member.status} />
											</TableCell>
											<TableCell>
												{getMembershipBadge(member?.membership || 'free')}
											</TableCell>
											<TableCell className="text-sm">{member.createdAt ? new Date(member.createdAt).toLocaleDateString() : member.joined}</TableCell>
											<TableCell className="text-sm">{member.lastSeen ? new Date(member.lastSeen).toLocaleDateString() : member.lastActive}</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end space-x-2">
													<Button
														size="sm"
														variant="ghost"
														onClick={() => handleViewUserDetails(member)}
														title="View user details"
													>
														<Eye className="w-4 h-4" />
													</Button>
													<Button size="sm" variant="ghost">
														<MessageSquare className="w-4 h-4" />
													</Button>
													<Button
														size="sm"
														variant="ghost"
														onClick={() => handleBanUser(member)}
													>
														<Ban className="w-4 h-4" />
													</Button>
													<Button size="sm" variant="ghost">
														<MoreVertical className="w-4 h-4" />
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
				{!loading && (
					<div className="flex items-center justify-between">
						<p className="text-sm text-muted-foreground">
							Showing 20 of {pagination.totalUsers} results
						</p>
						<div className="flex space-x-2">
							<Button
								variant="outline"
								size="sm"
								disabled={!pagination.hasPrev}
								onClick={() => setCurrentPage(pagination.currentPage - 1)}
							>
								Previous
							</Button>

							{[...Array(Math.min(1, pagination.totalPages))].map((_, i) => {
								console.log(i);
								const pageNum = i + Math.max(1, pagination.currentPage - 2);
								console.log(pageNum);
								return (
									<Button
										key={i + 1}
										variant="outline"
										size="sm"
										className={pageNum === pagination.page ? "bg-blue-600 text-white" : ""}
										onClick={() => setCurrentPage(i + 1)}
									>
										{currentPage}
									</Button>
								);
							})}
							{console.log(pagination.hasNext ? pagination.page + 1 : pagination.page)}
							<Button
								variant="outline"
								size="sm"
								disabled={!pagination.hasNext}
								onClick={() => setCurrentPage(pagination.currentPage + 1)}
							>
								Next
							</Button>
						</div>
					</div>
				)}
			</div>

			{/* Ban User Confirmation Dialog */}
			<ConfirmDialog
				isOpen={showBanDialog}
				onClose={() => {
					setShowBanDialog(false);
					setSelectedUser(null);
				}}
				onConfirm={confirmBanUser}
				title="Ban User"
				description={`Are you sure you want to ban ${selectedUser?.username}? This action cannot be undone.`}
				confirmLabel="Ban User"
			/>

			{/* User Details Modal */}
			<Modal
				isOpen={showUserDetailsModal}
				onClose={() => {
					setShowUserDetailsModal(false);
					setUserDetails(null);
				}}
				title={`User Details - ${userDetails?.username || userDetails?.name || 'Unknown'}`}
				size="lg"
			>
				{userDetails && (
					<div className="space-y-6">
						{/* Profile Section */}
						<div className="flex items-start space-x-4">
							<div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
								{userDetails.profile?.photos?.[0] ? (
									<img
										src={userDetails.profile.photos[0]}
										alt="Profile"
										className="w-full h-full rounded-full object-cover"
									/>
								) : (
									<span className="text-2xl font-bold text-blue-600">
										{(userDetails.username || userDetails.name || 'U')[0].toUpperCase()}
									</span>
								)}
							</div>
							<div className="flex-1">
								<h3 className="text-xl font-semibold text-gray-900">
									{userDetails.name || userDetails.username || 'Unknown User'}
								</h3>
								<p className="text-gray-600">{userDetails.email}</p>
								<div className="flex items-center space-x-2 mt-2">
									<StatusBadge status={userDetails.status} />
									{getMembershipBadge(userDetails.membership || 'free')}
								</div>
							</div>
						</div>

						{/* Basic Information */}
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="text-sm font-medium text-gray-500">User ID</label>
								<p className="text-sm text-gray-900">{userDetails._id}</p>
							</div>
							<div>
								<label className="text-sm font-medium text-gray-500">Username</label>
								<p className="text-sm text-gray-900">{userDetails.username || 'N/A'}</p>
							</div>
							<div>
								<label className="text-sm font-medium text-gray-500">Email</label>
								<p className="text-sm text-gray-900">{userDetails.email || 'N/A'}</p>
							</div>
							<div>
								<label className="text-sm font-medium text-gray-500">Phone</label>
								<p className="text-sm text-gray-900">{userDetails.phone || 'N/A'}</p>
							</div>
							<div>
								<label className="text-sm font-medium text-gray-500">Joined Date</label>
								<p className="text-sm text-gray-900">
									{userDetails.createdAt ? new Date(userDetails.createdAt).toLocaleDateString() : 'N/A'}
								</p>
							</div>
							<div>
								<label className="text-sm font-medium text-gray-500">Last Active</label>
								<p className="text-sm text-gray-900">
									{userDetails.lastSeen ? new Date(userDetails.lastSeen).toLocaleDateString() : 'N/A'}
								</p>
							</div>
						</div>

						{/* Profile Information */}
						{userDetails.profile && (
							<div className="space-y-4">
								<h4 className="text-lg font-medium text-gray-900">Profile Information</h4>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="text-sm font-medium text-gray-500">Gender</label>
										<p className="text-sm text-gray-900">{userDetails.profile.gender || 'N/A'}</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-500">Sexuality</label>
										<p className="text-sm text-gray-900">{userDetails.profile.sexuality || 'N/A'}</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-500">Date of Birth</label>
										<p className="text-sm text-gray-900">
											{userDetails.profile.dateOfBirth ? new Date(userDetails.profile.dateOfBirth).toLocaleDateString() : 'N/A'}
										</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-500">Bio</label>
										<p className="text-sm text-gray-900">{userDetails.profile.bio || 'N/A'}</p>
									</div>
								</div>

								{/* Photos */}
								{userDetails.profile.photos && userDetails.profile.photos.length > 0 && (
									<div>
										<label className="text-sm font-medium text-gray-500">Photos ({userDetails.profile.photos.length})</label>
										<div className="flex space-x-2 mt-2 overflow-x-auto">
											{userDetails.profile.photos.map((photo, index) => (
												<img
													key={index}
													src={photo}
													alt={`Photo ${index + 1}`}
													className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
												/>
											))}
										</div>
									</div>
								)}
							</div>
						)}

						{/* Account Status */}
						<div className="border-t pt-4">
							<h4 className="text-lg font-medium text-gray-900 mb-3">Account Status</h4>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium text-gray-500">Status</label>
									<p className="text-sm text-gray-900">{userDetails.status || 'active'}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-500">Membership</label>
									<p className="text-sm text-gray-900">{userDetails.membership || 'free'}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-500">Email Verified</label>
									<p className="text-sm text-gray-900">{userDetails.emailVerified ? 'Yes' : 'No'}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-500">Phone Verified</label>
									<p className="text-sm text-gray-900">{userDetails.phoneVerified ? 'Yes' : 'No'}</p>
								</div>
							</div>
						</div>
					</div>
				)}
			</Modal>
		</Layout>
	);
}
