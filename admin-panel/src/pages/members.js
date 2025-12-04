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
import { useUsers } from '@/hooks/useUsers';

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

	const {
		users: members,
		loading,
		error,
		pagination,
		fetchUsers,
		banUser,
		unbanUser
	} = useUsers({
		page: currentPage,
		limit: 20,
		search: searchTerm,
		status: statusFilter !== 'all' ? statusFilter : undefined,
		membership: membershipFilter !== 'all' ? membershipFilter : undefined
	});

	// Refetch when filters change
	useEffect(() => {
		const delayedSearch = setTimeout(() => {
			fetchUsers({
				page: currentPage,
				limit: 20,
				search: searchTerm,
				status: statusFilter !== 'all' ? statusFilter : undefined,
				membership: membershipFilter !== 'all' ? membershipFilter : undefined
			});
		}, 500); // Debounce search

		return () => clearTimeout(delayedSearch);
	}, [searchTerm, statusFilter, membershipFilter, currentPage]);

	const handleBanUser = async (userId) => {
		if (confirm('Are you sure you want to ban this user?')) {
			const result = await banUser(userId, 'Banned by admin');
			if (result.success) {
				alert('User banned successfully');
			} else {
				alert(`Failed to ban user: ${result.error}`);
			}
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
									{members.map((member) => (
										<TableRow key={member.id}>
											<TableCell>
												<div className="flex items-center space-x-3">
													<div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
														<span className="text-blue-600 font-semibold text-xs">
															{member.name.split(' ').map(n => n[0]).join('')}
														</span>
													</div>
													<div>
														<p className="font-medium text-sm">{member.name}</p>
														<p className="text-xs text-gray-500">{member.email}</p>
													</div>
												</div>
											</TableCell>
											<TableCell>
												{getStatusBadge(member.status)}
											</TableCell>
											<TableCell>
												{getMembershipBadge(member.membership)}
											</TableCell>
											<TableCell className="text-sm">{member.createdAt ? new Date(member.createdAt).toLocaleDateString() : member.joined}</TableCell>
											<TableCell className="text-sm">{member.lastSeen ? new Date(member.lastSeen).toLocaleDateString() : member.lastActive}</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end space-x-2">
													<Button size="sm" variant="ghost">
														<Eye className="w-4 h-4" />
													</Button>
													<Button size="sm" variant="ghost">
														<MessageSquare className="w-4 h-4" />
													</Button>
													<Button
														size="sm"
														variant="ghost"
														onClick={() => handleBanUser(member._id || member.id)}
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
							Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
						</p>
						<div className="flex space-x-2">
							<Button
								variant="outline"
								size="sm"
								disabled={pagination.page <= 1}
								onClick={() => setCurrentPage(pagination.page - 1)}
							>
								Previous
							</Button>
							{[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
								const pageNum = i + Math.max(1, pagination.page - 2);
								return (
									<Button
										key={pageNum}
										variant="outline"
										size="sm"
										className={pageNum === pagination.page ? "bg-blue-600 text-white" : ""}
										onClick={() => setCurrentPage(pageNum)}
									>
										{pageNum}
									</Button>
								);
							})}
							<Button
								variant="outline"
								size="sm"
								disabled={pagination.page >= pagination.totalPages}
								onClick={() => setCurrentPage(pagination.page + 1)}
							>
								Next
							</Button>
						</div>
					</div>
				)}
			</div>
		</Layout>
	);
}
