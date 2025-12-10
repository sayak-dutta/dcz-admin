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
	Settings,
	Video,
	Lock,
	Unlock,
	Loader2,
	User,
	Ban,
	UserX
} from 'lucide-react';
import { useAdminChatrooms } from '@/hooks/useAdminChatrooms';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function ChatroomsPage() {
	const [searchTerm, setSearchTerm] = useState('');
	const [typeFilter, setTypeFilter] = useState('all');
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedChatroom, setSelectedChatroom] = useState(null);
	const [showChatroomModal, setShowChatroomModal] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [chatroomMessages, setChatroomMessages] = useState([]);
	const [chatroomParticipants, setChatroomParticipants] = useState([]);
	const [loadingDetails, setLoadingDetails] = useState(false);

	const {
		chatrooms,
		loading,
		error,
		pagination,
		fetchChatrooms,
		getChatroomDetails,
		getChatroomMessages,
		getChatroomParticipants,
		updateChatroomStatus,
		deleteChatroom,
		banParticipant,
		removeParticipant
	} = useAdminChatrooms();

	// Fetch chatrooms on component mount and when filters/page change
	useEffect(() => {
		const delay = searchTerm ? 500 : 0; // Debounce search

		const timeoutId = setTimeout(() => {
			fetchChatrooms({
				page: currentPage,
				limit: 20,
				type: typeFilter !== 'all' ? typeFilter : undefined,
				search: searchTerm || undefined,
			});
		}, delay);

		return () => clearTimeout(timeoutId);
	}, [searchTerm, typeFilter, currentPage, fetchChatrooms]);

	const handleViewChatroomDetails = async (chatroom) => {
		setSelectedChatroom(chatroom);
		setShowChatroomModal(true);
		setLoadingDetails(true);

		try {
			// Fetch chatroom details, messages, and participants
			const [messagesResponse, participantsResponse] = await Promise.all([
				getChatroomMessages(chatroom._id, { page: 1, limit: 50 }),
				getChatroomParticipants(chatroom._id, { page: 1, limit: 20 })
			]);

			// API returns: { success, message, data: { chatroom, messages, pagination } }
			// Hook returns response.data, so messagesResponse = { success, message, data: {...} }
			console.log('Messages Response:', messagesResponse);
			console.log('Participants Response:', participantsResponse);

			const messages = messagesResponse?.data?.messages || messagesResponse?.messages || [];
			const participants = Array.isArray(participantsResponse?.data)
				? participantsResponse.data
				: Array.isArray(participantsResponse)
					? participantsResponse
					: participantsResponse?.data?.participants || participantsResponse?.participants || [];

			console.log('Parsed Messages:', messages);
			console.log('Parsed Participants:', participants);

			setChatroomMessages(messages);
			setChatroomParticipants(participants);
		} catch (error) {
			console.error('Failed to fetch chatroom details:', error);
		} finally {
			setLoadingDetails(false);
		}
	};

	const handleUpdateChatroomStatus = async (chatroomId, newStatus, reason = '') => {
		const result = await updateChatroomStatus(chatroomId, {
			isActive: newStatus === 'active',
			reason,
			notes: `Status updated to ${newStatus} by admin`
		});
		if (result.success) {
			fetchChatrooms({
				page: currentPage,
				limit: 20,
				type: typeFilter !== 'all' ? typeFilter : undefined,
				search: searchTerm || undefined,
			});
		}
	};

	const handleDeleteChatroom = async () => {
		if (!selectedChatroom) return;

		const result = await deleteChatroom(selectedChatroom._id);
		if (result.success) {
			setShowDeleteDialog(false);
			setSelectedChatroom(null);
			fetchChatrooms({
				page: currentPage,
				limit: 20,
				type: typeFilter !== 'all' ? typeFilter : undefined,
				search: searchTerm || undefined,
			});
		}
	};

	const handleBanParticipant = async (chatroomId, userId, reason = 'Violation of chatroom rules') => {
		const result = await banParticipant(chatroomId, userId, { reason });
		if (result.success) {
			// Refresh participants
			const participantsResponse = await getChatroomParticipants(chatroomId, { page: 1, limit: 20 });
			setChatroomParticipants(participantsResponse.data?.data || []);
		}
	};

	const handleRemoveParticipant = async (chatroomId, userId, reason = 'Removed by admin') => {
		const result = await removeParticipant(chatroomId, userId, { reason });
		if (result.success) {
			// Refresh participants
			const participantsResponse = await getChatroomParticipants(chatroomId, { page: 1, limit: 20 });
			setChatroomParticipants(participantsResponse.data?.data || []);
		}
	};

	const getStatusBadge = (isActive, isLive) => {
		if (!isActive) return <Badge variant="secondary">Inactive</Badge>;
		if (isLive) return <Badge className="bg-red-500 hover:bg-red-600">Live</Badge>;
		return <Badge variant="success">Active</Badge>;
	};

	const getChatroomTypeBadge = (type) => {
		switch (type) {
			case 'public': return <Badge variant="success"><Unlock className="w-3 h-3 mr-1" />Public</Badge>;
			case 'private': return <Badge variant="warning"><Lock className="w-3 h-3 mr-1" />Private</Badge>;
			case 'secret': return <Badge variant="destructive"><Lock className="w-3 h-3 mr-1" />Secret</Badge>;
			default: return <Badge variant="outline">{type}</Badge>;
		}
	};

	const getStatsCards = () => {
		const totalChatrooms = chatrooms.length;
		const activeChatrooms = chatrooms.filter(c => c.isActive).length;
		const liveChatrooms = chatrooms.filter(c => c.isLive).length;
		const totalParticipants = chatrooms.reduce((sum, c) => sum + (c.participants?.length || 0), 0);

		return [
			{
				title: "Total Chatrooms",
				value: totalChatrooms.toString(),
				change: "All chatrooms",
				icon: MessageSquare,
				color: "blue"
			},
			{
				title: "Active Chatrooms",
				value: activeChatrooms.toString(),
				change: "Currently active",
				icon: Settings,
				color: "green"
			},
			{
				title: "Live Chatrooms",
				value: liveChatrooms.toString(),
				change: "Streaming now",
				icon: Video,
				color: "red"
			},
			{
				title: "Total Participants",
				value: totalParticipants.toString(),
				change: "Across all rooms",
				icon: Users,
				color: "purple"
			}
		];
	};

	return (
		<Layout title="Chatrooms Management">
			<div className="space-y-6">
				{/* Header */}
				<p className="text-muted-foreground">
					Manage chatrooms and monitor conversations
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
									placeholder="Search chatrooms..."
									className="pl-10"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</div>

							<div className="flex gap-2">
								<select
									className="px-3 py-2 border border-gray-300 rounded-md text-sm"
									value={typeFilter}
									onChange={(e) => setTypeFilter(e.target.value)}
								>
									<option value="all">All Types</option>
									<option value="public">Public</option>
									<option value="private">Private</option>
									<option value="secret">Secret</option>
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
								Loading chatrooms...
							</div>
						) : error ? (
							<div className="text-center p-8 text-red-600">
								Error: {error}
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Chatroom</TableHead>
										<TableHead>Type</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Participants</TableHead>
										<TableHead>Created By</TableHead>
										<TableHead>Created</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{chatrooms.length > 0 ? chatrooms.map((chatroom) => (
										<TableRow key={chatroom._id}>
											<TableCell>
												<div className="flex items-center space-x-3">
													{chatroom.coverImage ? (
														<img src={chatroom.coverImage} alt={chatroom.name} className="w-10 h-10 rounded-lg object-cover" />
													) : (
														<div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
															<MessageSquare className="w-5 h-5 text-gray-500" />
														</div>
													)}
													<div>
														<p className="font-medium text-sm">{chatroom.name}</p>
														<p className="text-xs text-gray-500">
															{chatroom.inviteCode ? `Code: ${chatroom.inviteCode}` : 'No invite code'}
														</p>
													</div>
												</div>
											</TableCell>
											<TableCell>
												{getChatroomTypeBadge(chatroom.type)}
											</TableCell>
											<TableCell>
												<div className="flex flex-col space-y-1">
													{getStatusBadge(chatroom.isActive, chatroom.isLive)}
													{chatroom.blockSingleMales && (
														<Badge variant="outline" className="text-xs">No Single Males</Badge>
													)}
												</div>
											</TableCell>
											<TableCell className="text-sm">
												{chatroom.participants?.length || 0} / {chatroom.maxParticipants}
											</TableCell>
											<TableCell className="text-sm">
												{chatroom.createdBy?.profile?.firstName && chatroom.createdBy?.profile?.lastName
													? `${chatroom.createdBy.profile.firstName} ${chatroom.createdBy.profile.lastName}`
													: chatroom.createdBy?.username || 'Unknown'}
											</TableCell>
											<TableCell className="text-sm">
												{new Date(chatroom.createdAt).toLocaleDateString()}
											</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end space-x-2">
													<Button
														size="sm"
														variant="ghost"
														onClick={() => handleViewChatroomDetails(chatroom)}
														title="View chatroom details and messages"
													>
														<Eye className="w-4 h-4" />
													</Button>
													<Button
														size="sm"
														variant="ghost"
														onClick={() => handleUpdateChatroomStatus(chatroom._id, chatroom.isActive ? 'inactive' : 'active')}
														title={chatroom.isActive ? 'Deactivate chatroom' : 'Activate chatroom'}
													>
														<Settings className="w-4 h-4" />
													</Button>
													<Button
														size="sm"
														variant="ghost"
														onClick={() => {
															setSelectedChatroom(chatroom);
															setShowDeleteDialog(true);
														}}
														title="Delete chatroom"
													>
														<Trash2 className="w-4 h-4" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									)) : (
										<TableRow>
											<TableCell colSpan={7} className="text-center py-8 text-gray-500">
												<MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
												<p>No chatrooms found</p>
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>

				{/* Pagination */}
				{!loading && chatrooms.length > 0 && (
					<div className="flex items-center justify-between">
						<p className="text-sm text-muted-foreground">
							Showing {((pagination.currentPage - 1) * 20) + 1} to {Math.min(pagination.currentPage * 20, chatrooms.length)} of {chatrooms.length} results
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
							{[...Array(Math.min(5, pagination.totalPages || 1))].map((_, i) => {
								const pageNum = i + Math.max(1, pagination.currentPage - 2);
								if (pageNum > (pagination.totalPages || 1)) return null;
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

				{/* Chatroom Details Modal */}
				<Modal
					isOpen={showChatroomModal}
					onClose={() => {
						setShowChatroomModal(false);
						setSelectedChatroom(null);
						setChatroomMessages([]);
						setChatroomParticipants([]);
					}}
					title="Chatroom Details & Messages"
					size="xl"
				>
					{selectedChatroom && (
						<div className="space-y-6">
							{/* Chatroom Info */}
							<div className="border-b pb-4">
								<div className="flex items-start space-x-4">
									{selectedChatroom.coverImage ? (
										<img src={selectedChatroom.coverImage} alt={selectedChatroom.name} className="w-20 h-20 rounded-lg object-cover" />
									) : (
										<div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
											<MessageSquare className="w-8 h-8 text-gray-500" />
										</div>
									)}
									<div className="flex-1">
										<h3 className="text-xl font-semibold">{selectedChatroom.name}</h3>
										<p className="text-gray-600 mb-2">{selectedChatroom.description || 'No description'}</p>
										<div className="flex flex-wrap gap-2">
											{getChatroomTypeBadge(selectedChatroom.type)}
											{getStatusBadge(selectedChatroom.isActive, selectedChatroom.isLive)}
											{selectedChatroom.blockSingleMales && (
												<Badge variant="outline">No Single Males</Badge>
											)}
											{selectedChatroom.inviteOnly && (
												<Badge variant="outline">Invite Only</Badge>
											)}
										</div>
									</div>
								</div>

								<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
									<div className="text-center">
										<p className="text-2xl font-bold text-blue-600">{selectedChatroom.participants?.length || 0}</p>
										<p className="text-sm text-gray-500">Participants</p>
									</div>
									<div className="text-center">
										<p className="text-2xl font-bold text-green-600">{chatroomMessages.length}</p>
										<p className="text-sm text-gray-500">Messages</p>
									</div>
									<div className="text-center">
										<p className="text-2xl font-bold text-purple-600">{selectedChatroom.moderators?.length || 0}</p>
										<p className="text-sm text-gray-500">Moderators</p>
									</div>
									<div className="text-center">
										<p className="text-2xl font-bold text-orange-600">{selectedChatroom.bannedUsers?.length || 0}</p>
										<p className="text-sm text-gray-500">Banned</p>
									</div>
								</div>
							</div>

							{/* Participants Management */}
							<div>
								<h4 className="text-lg font-semibold mb-4 flex items-center">
									<Users className="w-5 h-5 mr-2" />
									{console.log(chatroomParticipants)}
									Participants ({chatroomParticipants.length})
								</h4>

								{loadingDetails ? (
									<div className="flex items-center justify-center p-4">
										<Loader2 className="w-4 h-4 animate-spin mr-2" />
										Loading participants...
									</div>
								) : chatroomParticipants.length > 0 ? (
									<div className="space-y-2 max-h-48 overflow-y-auto">
										{chatroomParticipants.map((participant) => (
											<div key={participant._id} className="flex items-center justify-between p-3 border rounded-lg">
												<div className="flex items-center space-x-3">
													{participant.profile?.photos?.[0] ? (
														<img src={participant.profile.photos[0]} alt={`${participant.username}'s profile`} className="w-8 h-8 rounded-full object-cover" />
													) : (
														<div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
															<User className="w-4 h-4 text-gray-500" />
														</div>
													)}
													<div>
														<p className="font-medium text-sm">

															{participant.profile?.firstName && participant.profile?.lastName
																? `${participant.profile.firstName} ${participant.profile.lastName}`
																: participant.username || 'Unknown'}
														</p>
														<p className="text-xs text-gray-500">{participant.email}</p>
													</div>
												</div>
												<div className="flex space-x-2">
													<Button
														size="sm"
														variant="outline"
														onClick={() => handleRemoveParticipant(selectedChatroom._id, participant._id)}
														title="Remove from chatroom"
													>
														<UserX className="w-4 h-4" />
													</Button>
													<Button
														size="sm"
														variant="outline"
														onClick={() => handleBanParticipant(selectedChatroom._id, participant._id)}
														title="Ban from chatroom"
													>
														<Ban className="w-4 h-4" />
													</Button>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-4 text-gray-500">
										<Users className="w-6 h-6 mx-auto mb-2 opacity-50" />
										<p>No participants found</p>
									</div>
								)}
							</div>

							{/* Chat Messages */}
							<div>
								<h4 className="text-lg font-semibold mb-4 flex items-center">
									<MessageSquare className="w-5 h-5 mr-2" />
									Recent Messages ({chatroomMessages.length})
								</h4>

								{loadingDetails ? (
									<div className="flex items-center justify-center p-4">
										<Loader2 className="w-4 h-4 animate-spin mr-2" />
										Loading messages...
									</div>
								) : chatroomMessages.length > 0 ? (
									<div className="space-y-3 max-h-96 overflow-y-auto bg-gray-50 rounded-lg p-4">
										{chatroomMessages.slice(-20).map((message) => (
											<div key={message._id} className="flex items-start space-x-3">
												{message.userId?.profile?.photos?.[0] ? (
													<img src={message.userId.profile.photos[0]} alt={`${message.userId.username}'s profile`} className="w-8 h-8 rounded-full object-cover" />
												) : (
													<div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
														<User className="w-4 h-4 text-blue-600" />
													</div>
												)}
												<div className="flex-1">
													<div className="flex items-center space-x-2 mb-1">
														<span className="font-medium text-sm">
															{message.userId?.profile?.firstName && message.userId?.profile?.lastName
																? `${message.userId.profile.firstName} ${message.userId.profile.lastName}`
																: message.userId?.username || 'Anonymous'}
														</span>
														<span className="text-xs text-gray-500">
															{message.timestamp ? new Date(message.timestamp).toLocaleString() : ''}
														</span>
														{message.messageType && (
															<Badge variant="outline" className="text-xs capitalize">{message.messageType}</Badge>
														)}
													</div>
													<p className="text-sm text-gray-700">
														{message.content || (message.messageType === 'image' || message.messageType === 'video' ? 'Media message' : 'No content')}
													</p>
													{message.mediaUrl && (
														<div className="mt-2">
															{message.messageType === 'image' ? (
																<img src={message.mediaUrl} alt="Message media" className="max-w-32 max-h-32 rounded object-cover" />
															) : message.messageType === 'video' ? (
																<video src={message.mediaUrl} controls className="max-w-32 max-h-32 rounded object-cover" />
															) : (
																<a href={message.mediaUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm">
																	View media
																</a>
															)}
														</div>
													)}
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
										<MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
										<p>No messages in this chatroom</p>
									</div>
								)}
							</div>
						</div>
					)}
				</Modal>

				{/* Delete Chatroom Confirmation Dialog */}
				<ConfirmDialog
					isOpen={showDeleteDialog}
					onClose={() => {
						setShowDeleteDialog(false);
						setSelectedChatroom(null);
					}}
					onConfirm={handleDeleteChatroom}
					title="Delete Chatroom"
					description={`Are you sure you want to delete "${selectedChatroom?.name}"? This will permanently remove the chatroom and all its messages. This action cannot be undone.`}
					confirmLabel="Delete Chatroom"
				/>
			</div>
		</Layout>
	);
}