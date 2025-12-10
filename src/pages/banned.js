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
	UserX,
	RotateCcw,
	Eye,
	Calendar,
	AlertTriangle,
	CheckCircle,
	Loader2
} from 'lucide-react';
import { useAdminBans } from '@/hooks/useAdminBans';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function BannedUsers() {
	const [searchTerm, setSearchTerm] = useState('');
	const [banTypeFilter, setBanTypeFilter] = useState('all');
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedUser, setSelectedUser] = useState(null);
	const [showUnbanDialog, setShowUnbanDialog] = useState(false);

	const {
		bans,
		loading,
		error,
		pagination,
		fetchBans,
		unbanUser
	} = useAdminBans();

	// Fetch bans on component mount and when filters/page change
	useEffect(() => {
		const delay = searchTerm ? 500 : 0; // Debounce search

		const timeoutId = setTimeout(() => {
			fetchBans({
				page: currentPage,
				limit: 20,
				search: searchTerm || undefined,
			});
		}, delay);

		return () => clearTimeout(timeoutId);
	}, [searchTerm, currentPage, fetchBans]);

	const handleUnbanUser = (user) => {
		setSelectedUser(user);
		setShowUnbanDialog(true);
	};

	const confirmUnbanUser = async () => {
		if (!selectedUser) return;

		const result = await unbanUser({
			id: selectedUser.userId._id, // Use userId from the ban object
			removalReason: 'Unbanned by admin',
		});

		if (result.success) {
			setShowUnbanDialog(false);
			setSelectedUser(null);
			// The hook already refreshes the list, so no need to call fetchBans again
		} else {
			console.error('Failed to unban user:', result.error);
		}
	};

	const getStatsCards = () => {
		return [
			{
				title: "Total Banned Users",
				value: pagination.totalBans?.toString() || "0",
				change: "Current active bans",
				color: "red"
			},
			{
				title: "Current Page",
				value: currentPage.toString(),
				change: `of ${pagination.totalPages || 1} pages`,
				color: "blue"
			},
			{
				title: "Users per Page",
				value: "20",
				change: "Items displayed",
				color: "green"
			},
			{
				title: "Search Results",
				value: bans.length.toString(),
				change: searchTerm ? `for "${searchTerm}"` : "All results",
				color: "purple"
			}
		];
	};

	return (
		<Layout title="Banned Users">
			<div className="space-y-6">
				{/* Header */}
				<p className="text-muted-foreground">
					Manage suspended and banned member accounts
				</p>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{getStatsCards().map((stat, index) => (
						<Card key={index}>
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium text-muted-foreground">
											{stat.title}
										</p>
										<p className="text-2xl font-bold">{stat.value}</p>
										<p className="text-xs text-muted-foreground mt-1">
											{stat.change}
										</p>
									</div>
									<div className={`w-3 h-3 rounded-full bg-${stat.color}-500`}></div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Filters */}
				<Card>
					<CardHeader>
						<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
							<div className="relative flex-1 max-w-sm">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
								<Input
									placeholder="Search banned users..."
									className="pl-10"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</div>

							<div className="flex gap-2">
								<select
									className="px-3 py-2 border border-gray-300 rounded-md text-sm"
									value={banTypeFilter}
									onChange={(e) => setBanTypeFilter(e.target.value)}
								>
									<option value="all">All Ban Types</option>
									<option value="permanent">Permanent</option>
									<option value="temporary">Temporary</option>
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
								Loading banned users...
							</div>
						) : error ? (
							<div className="text-center p-8 text-red-600">
								Error: {error}
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>User</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Username</TableHead>
										<TableHead>Email</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{bans.length > 0 ? bans.map((user) => (
										<TableRow key={user._id}>
											<TableCell>
												<div className="flex items-center space-x-3">
													<div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
														<span className="text-red-600 font-semibold text-xs">
															{user.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
														</span>
													</div>
													<div>
														<p className="font-medium text-sm">
															{user.userId?.profile?.firstName && user.userId?.profile?.lastName
																? `${user.userId.profile.firstName} ${user.userId.profile.lastName}`
																: user.username || 'Unknown User'}
														</p>
														<p className="text-xs text-gray-500">{user.email}</p>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<Badge variant="destructive">Banned</Badge>
											</TableCell>
											{console.log(user)
											}
											<TableCell className="text-sm">{user.userId?.username || 'N/A'}</TableCell>
											<TableCell className="text-sm">{user.userId?.email}</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end space-x-2">
													<Button size="sm" variant="ghost" title="View user details">
														<Eye className="w-4 h-4" />
													</Button>
													<Button
														size="sm"
														variant="ghost"
														onClick={() => handleUnbanUser(user)}
														title="Unban user"
													>
														<RotateCcw className="w-4 h-4" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									)) : (
										<TableRow>
											<TableCell colSpan={5} className="text-center py-8 text-gray-500">
												<UserX className="w-8 h-8 mx-auto mb-2 opacity-50" />
												<p>No banned users found</p>
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>

				{/* Pagination */}
				{!loading && bans.length > 0 && (
					<div className="flex items-center justify-between">
						<p className="text-sm text-muted-foreground">
							Showing {((pagination.currentPage - 1) * 20) + 1} to {Math.min(pagination.currentPage * 20, pagination.totalBans)} of {pagination.totalBans} results
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
							{[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
								const pageNum = i + Math.max(1, pagination.currentPage - 2);
								if (pageNum > pagination.totalPages) return null;
								return (
									<Button
										key={pageNum}
										variant="outline"
										size="sm"
										className={pageNum === pagination.currentPage ? "bg-blue-600 text-white" : ""}
										onClick={() => setCurrentPage(pageNum)}
									>
										{pageNum}
									</Button>
								);
							})}
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

				{/* Unban User Confirmation Dialog */}
				<ConfirmDialog
					isOpen={showUnbanDialog}
					onClose={() => {
						setShowUnbanDialog(false);
						setSelectedUser(null);
					}}
					onConfirm={confirmUnbanUser}
					title="Unban User"
					description={`Are you sure you want to unban ${selectedUser?.username || selectedUser?.email}? The user will regain access to the platform.`}
					confirmLabel="Unban User"
				/>
			</div>
		</Layout>
	);
}
