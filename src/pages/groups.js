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
	Eye,
	Users,
	MessageSquare,
	Trash2,
	Ban,
	Settings,
	Loader2,
	Calendar,
	MapPin,
	User,
	CheckCircle,
	Star
} from 'lucide-react';
import { useAdminGroups } from '@/hooks/useAdminGroups';
import { Modal } from '@/components/ui/modal';

export default function GroupsPage() {
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedGroup, setSelectedGroup] = useState(null);
	const [showGroupModal, setShowGroupModal] = useState(false);
	const [groupDetails, setGroupDetails] = useState(null);
	const [groupMessages, setGroupMessages] = useState([]);
	const [loadingDetails, setLoadingDetails] = useState(false);

	const {
		groups,
		loading,
		error,
		pagination,
		fetchGroups,
		getGroupDetails,
		getGroupMessages,
		updateGroupStatus,
		deleteGroup
	} = useAdminGroups();

	// Fetch groups on component mount and when filters/page change
	useEffect(() => {
		const delay = searchTerm ? 500 : 0; // Debounce search

		const timeoutId = setTimeout(() => {
			fetchGroups({
				page: currentPage,
				limit: 20,
				search: searchTerm || undefined,
				status: statusFilter !== 'all' ? statusFilter : undefined,
			});
		}, delay);

		return () => clearTimeout(timeoutId);
	}, [searchTerm, statusFilter, currentPage, fetchGroups]);

	const handleViewGroupDetails = async (group) => {
		setSelectedGroup(group);
		setShowGroupModal(true);
		setLoadingDetails(true);

		try {
			// Fetch group details and messages
			const [detailsResponse, messagesResponse] = await Promise.all([
				getGroupDetails(group._id),
				getGroupMessages(group._id, { page: 1, limit: 20 })
			]);

			setGroupDetails(detailsResponse.data || detailsResponse);
			// API returns: { success, message, data: { messages, pagination } }
			// Hook returns response.data, so messagesResponse = { success, message, data: {...} }
			console.log('Group Messages Response:', messagesResponse);

			const messages = messagesResponse?.data?.messages || messagesResponse?.messages || [];
			console.log('Parsed Group Messages:', messages);

			setGroupMessages(messages);
		} catch (error) {
			console.error('Failed to fetch group details:', error);
		} finally {
			setLoadingDetails(false);
		}
	};

	const handleUpdateGroupStatus = async (groupId, newStatus, reason = '') => {
		const result = await updateGroupStatus(groupId, {
			status: newStatus,
			reason,
			notes: `Status updated by admin: ${newStatus}`
		});
		if (result.success) {
			fetchGroups({
				page: currentPage,
				limit: 20,
				search: searchTerm || undefined,
				status: statusFilter !== 'all' ? statusFilter : undefined,
			});
		}
	};

	const handleDeleteGroup = async (groupId) => {
		if (window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
			const result = await deleteGroup(groupId);
			if (result.success) {
				fetchGroups({
					page: currentPage,
					limit: 20,
					search: searchTerm || undefined,
					status: statusFilter !== 'all' ? statusFilter : undefined,
				});
			}
		}
	};

	const getStatusBadge = (isActive, isVerified, isFeatured, status) => {
		if (status === 'pending_approval') return <Badge variant="warning">Pending Approval</Badge>;
		if (status === 'rejected') return <Badge variant="destructive">Rejected</Badge>;
		if (status === 'suspended') return <Badge variant="secondary">Suspended</Badge>;
		if (!isActive) return <Badge variant="secondary">Inactive</Badge>;
		if (isFeatured) return <Badge variant="default">Featured</Badge>;
		if (isVerified) return <Badge variant="success">Verified</Badge>;
		return <Badge variant="outline">Active</Badge>;
	};

	const getGroupTypeBadge = (groupType) => {
		switch (groupType) {
			case 'open': return <Badge variant="success">Open</Badge>;
			case 'closed': return <Badge variant="warning">Closed</Badge>;
			case 'private': return <Badge variant="destructive">Private</Badge>;
			default: return <Badge variant="outline">{groupType}</Badge>;
		}
	};

	const getStatsCards = () => {
		const totalGroups = pagination.totalGroups || 0;
		const activeGroups = groups.filter(g => g.isActive).length;
		const verifiedGroups = groups.filter(g => g.isVerified).length;
		const featuredGroups = groups.filter(g => g.isFeatured).length;

		return [
			{
				title: "Total Groups",
				value: totalGroups.toString(),
				change: "All groups",
				icon: Users,
				color: "blue"
			},
			{
				title: "Active Groups",
				value: activeGroups.toString(),
				change: "Currently active",
				icon: Settings,
				color: "green"
			},
			{
				title: "Verified Groups",
				value: verifiedGroups.toString(),
				change: "Verified by admin",
				icon: CheckCircle,
				color: "purple"
			},
			{
				title: "Featured Groups",
				value: featuredGroups.toString(),
				change: "Promoted groups",
				icon: Star,
				color: "orange"
			}
		];
	};

	return (
		<Layout title="Groups Management">
			<div className="space-y-6">
				{/* Header */}
				<p className="text-muted-foreground">
					Manage community groups and their content
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
									placeholder="Search groups..."
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
									<option value="pending_approval">⏳ Pending Approval</option>
									<option value="active">Active</option>
									<option value="inactive">Inactive</option>
									<option value="rejected">Rejected</option>
									<option value="suspended">Suspended</option>
									<option value="verified">Verified</option>
									<option value="featured">Featured</option>
								</select>

								<Button variant="outline" size="sm">
									<Filter className="w-4 h-4 mr-2" />
									More Filters
								</Button>
							</div>
						</div>
					</CardHeader>

					<CardContent>
						{loading ? (
							<div className="flex items-center justify-center p-8">
								<Loader2 className="w-6 h-6 animate-spin mr-2" />
								Loading groups...
							</div>
						) : error ? (
							<div className="text-center p-8 text-red-600">
								Error: {error}
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Group</TableHead>
										<TableHead>Type</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Members</TableHead>
										<TableHead>Posts</TableHead>
										<TableHead>Location</TableHead>
										<TableHead>Created</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{groups.length > 0 ? groups.map((group) => (
										<TableRow key={group._id}>
											<TableCell>
												<div className="flex items-center space-x-3">
													{group.coverImage ? (
														<img src={group.coverImage} alt={group.name} className="w-10 h-10 rounded-lg object-cover" />
													) : (
														<div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
															<Users className="w-5 h-5 text-gray-500" />
														</div>
													)}
													<div>
														<p className="font-medium text-sm">{group.name}</p>
														<p className="text-xs text-gray-500 line-clamp-1">{group.description}</p>
													</div>
												</div>
											</TableCell>
											<TableCell>
												{getGroupTypeBadge(group.groupType)}
											</TableCell>
											<TableCell>
												{getStatusBadge(group.isActive, group.isVerified, group.isFeatured, group.status)}
											</TableCell>
											<TableCell className="text-sm">{group.memberCount || 0}</TableCell>
											<TableCell className="text-sm">{group.postCount || 0}</TableCell>
											<TableCell className="text-sm">{group.location || 'N/A'}</TableCell>
											<TableCell className="text-sm">
												{new Date(group.createdAt).toLocaleDateString()}
											</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end space-x-2">
													<Button
														size="sm"
														variant="ghost"
														onClick={() => handleViewGroupDetails(group)}
														title="View group details and messages"
													>
														<Eye className="w-4 h-4" />
													</Button>
													{group.status === 'pending_approval' ? (
														<>
															<Button
																size="sm"
																className="bg-green-600 hover:bg-green-700 text-white h-7 px-2 text-xs"
																onClick={() => handleUpdateGroupStatus(group._id, 'active')}
																title="Approve group"
															>
																Approve
															</Button>
															<Button
																size="sm"
																variant="destructive"
																className="h-7 px-2 text-xs"
																onClick={() => handleUpdateGroupStatus(group._id, 'rejected', 'Violates community guidelines')}
																title="Reject group"
															>
																Reject
															</Button>
														</>
													) : (
														<Button
															size="sm"
															variant="ghost"
															onClick={() => handleUpdateGroupStatus(group._id, group.isActive ? 'inactive' : 'active')}
															title={group.isActive ? 'Deactivate group' : 'Activate group'}
														>
															<Settings className="w-4 h-4" />
														</Button>
													)}
													<Button
														size="sm"
														variant="ghost"
														onClick={() => handleDeleteGroup(group._id)}
														title="Delete group"
													>
														<Trash2 className="w-4 h-4" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									)) : (
										<TableRow>
											<TableCell colSpan={8} className="text-center py-8 text-gray-500">
												<Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
												<p>No groups found</p>
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>

				{/* Pagination */}
				{!loading && groups.length > 0 && (
					<div className="flex items-center justify-between">
						<p className="text-sm text-muted-foreground">
							Showing {((pagination.currentPage - 1) * 20) + 1} to {Math.min(pagination.currentPage * 20, pagination.totalGroups)} of {pagination.totalGroups} results
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

				{/* Group Details Modal */}
				<Modal
					isOpen={showGroupModal}
					onClose={() => {
						setShowGroupModal(false);
						setSelectedGroup(null);
						setGroupDetails(null);
						setGroupMessages([]);
					}}
					title="Group Details & Messages"
					size="xl"
				>
					{selectedGroup && (
						<div className="space-y-6">
							{/* Group Info */}
							<div className="border-b pb-4">
								<div className="flex items-start space-x-4">
									{selectedGroup.coverImage ? (
										<img src={selectedGroup.coverImage} alt={selectedGroup.name} className="w-20 h-20 rounded-lg object-cover" />
									) : (
										<div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
											<Users className="w-8 h-8 text-gray-500" />
										</div>
									)}
									<div className="flex-1">
										<h3 className="text-xl font-semibold">{selectedGroup.name}</h3>
										<p className="text-gray-600 mb-2">{selectedGroup.description}</p>
										<div className="flex flex-wrap gap-2">
											{getGroupTypeBadge(selectedGroup.groupType)}
											{getStatusBadge(selectedGroup.isActive, selectedGroup.isVerified, selectedGroup.isFeatured)}
											<Badge variant="outline">{selectedGroup.category}</Badge>
											<Badge variant="outline">{selectedGroup.targetAudience}</Badge>
										</div>
									</div>
								</div>

								<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
									<div className="text-center">
										<p className="text-2xl font-bold text-blue-600">{selectedGroup.memberCount || 0}</p>
										<p className="text-sm text-gray-500">Members</p>
									</div>
									<div className="text-center">
										<p className="text-2xl font-bold text-green-600">{selectedGroup.postCount || 0}</p>
										<p className="text-sm text-gray-500">Posts</p>
									</div>
									<div className="text-center">
										<p className="text-2xl font-bold text-purple-600">{selectedGroup.eventCount || 0}</p>
										<p className="text-sm text-gray-500">Events</p>
									</div>
									<div className="text-center">
										<p className="text-2xl font-bold text-orange-600">
											{selectedGroup.lastActivity ? new Date(selectedGroup.lastActivity).toLocaleDateString() : 'Never'}
										</p>
										<p className="text-sm text-gray-500">Last Activity</p>
									</div>
								</div>
							</div>

							{/* Group Messages/Posts */}
							<div>
								<h4 className="text-lg font-semibold mb-4 flex items-center">
									<MessageSquare className="w-5 h-5 mr-2" />
									Group Messages ({groupMessages.length})
								</h4>

								{loadingDetails ? (
									<div className="flex items-center justify-center p-8">
										<Loader2 className="w-6 h-6 animate-spin mr-2" />
										Loading messages...
									</div>
								) : groupMessages.length > 0 ? (
									<div className="space-y-4 max-h-96 overflow-y-auto">
										{groupMessages.map((message) => (
											<div key={message._id} className="border rounded-lg p-4">
												<div className="flex items-start space-x-3">
													{(message.senderId?.profile?.photos?.[0] || message.userId?.profile?.photos?.[0]) ? (
														<img src={message.senderId?.profile?.photos?.[0] || message.userId?.profile?.photos?.[0]} alt={`${message.senderId?.username || message.userId?.username}'s profile`} className="w-8 h-8 rounded-full object-cover" />
													) : (
														<div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
															<User className="w-4 h-4 text-gray-500" />
														</div>
													)}
													<div className="flex-1">
														<div className="flex items-center space-x-2 mb-1">
															<span className="font-medium text-sm">
																{console.log(message)}
																{message.sender?.username ? `${message.sender?.username}`
																	: message.senderId?.username || message.userId?.profile?.firstName && message.userId?.profile?.lastName
																		? `${message.userId.profile.firstName} ${message.userId.profile.lastName}`
																		: message.userId?.username || message.senderId?.username || 'Unknown User'}
															</span>
															<span className="text-xs text-gray-500">
																{message.timestamp ? new Date(message.timestamp).toLocaleString() :
																	message.createdAt ? new Date(message.createdAt).toLocaleString() : ''}
															</span>
															{message.messageType && (
																<Badge variant="outline" className="text-xs">{message.messageType}</Badge>
															)}
														</div>
														<p className="text-sm text-gray-700">{message.content || (message.messageType === 'image' ? 'Image message' : 'No content')}</p>
														{message.mediaUrl && (
															<div className="mt-2">
																{message.messageType === 'image' ? (
																	<img src={message.mediaUrl} alt="Message media" className="max-w-xs rounded object-cover" />
																) : message.messageType === 'video' ? (
																	<video src={message.mediaUrl} controls className="max-w-xs rounded object-cover" />
																) : (
																	<a href={message.mediaUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm">
																		View media
																	</a>
																)}
															</div>
														)}
														{message.media && message.media.length > 0 && (
															<div className="mt-2">
																<p className="text-xs text-gray-500">{message.media.length} media file(s)</p>
															</div>
														)}
													</div>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-8 text-gray-500">
										<MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
										<p>No messages in this group</p>
									</div>
								)}
							</div>
						</div>
					)}
				</Modal>
			</div>
		</Layout>
	);
}
