import React, { useState } from 'react';
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
	MessageSquare,
	Users,
	Eye,
	Settings,
	Ban,
	Play,
	Square,
	Globe,
	Lock,
	Shield,
	Filter
} from 'lucide-react';
import { useAdminChatrooms } from '@/hooks/useAdminChatrooms';
import { StatusBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function ChatroomsModeration() {
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedChatroom, setSelectedChatroom] = useState(null);
	const [showDetailsModal, setShowDetailsModal] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	const {
		chatrooms,
		loading,
		error,
		fetchChatrooms,
		updateChatroomStatus,
		deleteChatroom,
		getChatroomDetails
	} = useAdminChatrooms();

	const handleViewDetails = async (chatroom) => {
		setSelectedChatroom(chatroom);
		setShowDetailsModal(true);

		// Fetch detailed information
		if (chatroom._id) {
			const details = await getChatroomDetails(chatroom._id);
			if (details) {
				setSelectedChatroom(details);
			}
		}
	};

	const handleDeleteChatroom = (chatroom) => {
		setSelectedChatroom(chatroom);
		setShowDeleteDialog(true);
	};

	const confirmDeleteChatroom = async () => {
		if (!selectedChatroom) return;

		const result = await deleteChatroom(selectedChatroom.id);
		if (result.success) {
			setShowDeleteDialog(false);
			setSelectedChatroom(null);
		}
	};

	const handleStatusChange = async (chatroomId, status) => {
		await updateChatroomStatus(chatroomId, { status });
	};

	const getChatroomTypeIcon = (type) => {
		switch (type) {
			case 'public':
				return <Globe className="w-4 h-4 text-green-500" />;
			case 'private':
				return <Lock className="w-4 h-4 text-yellow-500" />;
			case 'secret':
				return <Shield className="w-4 h-4 text-red-500" />;
			default:
				return <MessageSquare className="w-4 h-4 text-gray-500" />;
		}
	};

	const getChatroomTypeLabel = (type) => {
		switch (type) {
			case 'public':
				return 'Public';
			case 'private':
				return 'Private';
			case 'secret':
				return 'Secret';
			default:
				return type;
		}
	};

	return (
		<Layout title="Chatrooms Moderation">
			<div className="space-y-6">
				{/* Header */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div>
						<h1 className="text-2xl font-bold">Chatrooms Moderation</h1>
						<p className="text-muted-foreground">
							Monitor and moderate all chatrooms and their activities
						</p>
					</div>
					<Button variant="outline">
						<Filter className="w-4 h-4 mr-2" />
						Advanced Filters
					</Button>
				</div>

				{/* Search and Filters */}
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
								<select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
									<option value="all">All Types</option>
									<option value="public">Public</option>
									<option value="private">Private</option>
									<option value="secret">Secret</option>
								</select>

								<select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
									<option value="all">All Status</option>
									<option value="active">Active</option>
									<option value="inactive">Inactive</option>
									<option value="suspended">Suspended</option>
								</select>

								<select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
									<option value="all">Live Status</option>
									<option value="live">Live</option>
									<option value="not_live">Not Live</option>
								</select>
							</div>
						</div>
					</CardHeader>

					<CardContent>
						{loading ? (
							<div className="flex items-center justify-center p-8">
								<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
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
										<TableHead>Participants</TableHead>
										<TableHead>Messages</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Live</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>

									{chatrooms && chatrooms.length > 0 ? (
										chatrooms.map((chatroom) => (
											<TableRow key={chatroom.id}>
												<TableCell>
													<div className="flex items-center space-x-3">
														<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
															<MessageSquare className="w-5 h-5 text-blue-600" />
														</div>
														<div>
															<p className="font-medium text-sm">{chatroom.name}</p>
															<p className="text-xs text-gray-500 line-clamp-1">
																{chatroom.description}
															</p>
														</div>
													</div>
												</TableCell>
												<TableCell>
													<div className="flex items-center space-x-2">
														{getChatroomTypeIcon(chatroom.type)}
														<span className="text-sm">
															{getChatroomTypeLabel(chatroom.type)}
														</span>
													</div>
												</TableCell>
												<TableCell>
													<div className="flex items-center space-x-2">
														<Users className="w-4 h-4 text-gray-400" />
														<span className="text-sm">
															{chatroom.participantsCount || chatroom.participants?.length || 0}
														</span>
														{chatroom.maxParticipants && (
															<span className="text-xs text-gray-500">
																/ {chatroom.maxParticipants}
															</span>
														)}
													</div>
												</TableCell>
												<TableCell>
													<span className="text-sm">
														{chatroom.messageCount || 0}
													</span>
												</TableCell>
												<TableCell>
													<StatusBadge status={chatroom.status || 'active'} />
												</TableCell>
												<TableCell>
													{chatroom.isLive ? (
														<Badge className="bg-red-100 text-red-800">
															<Play className="w-3 h-3 mr-1" />
															Live
														</Badge>
													) : (
														<Badge variant="outline">
															<Square className="w-3 h-3 mr-1" />
															Offline
														</Badge>
													)}
												</TableCell>
												<TableCell className="text-right">
													<div className="flex items-center justify-end space-x-2">
														<Button
															size="sm"
															variant="ghost"
															onClick={() => handleViewDetails(chatroom)}
														>
															<Eye className="w-4 h-4 mr-1" />
															View
														</Button>
														<Button size="sm" variant="ghost">
															<Settings className="w-4 h-4 mr-1" />
															Manage
														</Button>
														<Button
															size="sm"
															variant="ghost"
															onClick={() => handleDeleteChatroom(chatroom)}
														>
															<Ban className="w-4 h-4 mr-1" />
															Delete
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))
									) : (
										<TableRow>
											<TableCell colSpan={7} className="text-center py-8 text-gray-500">
												No chatrooms found
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>

				{/* Chatroom Details Modal */}
				<Modal
					isOpen={showDetailsModal}
					onClose={() => {
						setShowDetailsModal(false);
						setSelectedChatroom(null);
					}}
					title="Chatroom Details"
					size="lg"
				>
					{selectedChatroom && (
						<div className="space-y-6">
							{/* Basic Info */}
							<div className="border-b pb-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-3">
										<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
											<MessageSquare className="w-6 h-6 text-blue-600" />
										</div>
										<div>
											<h3 className="text-lg font-medium">{selectedChatroom.name}</h3>
											<div className="flex items-center space-x-2 mt-1">
												{getChatroomTypeIcon(selectedChatroom.type)}
												<span className="text-sm text-gray-600">
													{getChatroomTypeLabel(selectedChatroom.type)}
												</span>
												<StatusBadge status={selectedChatroom.status || 'active'} />
												{selectedChatroom.isLive && (
													<Badge className="bg-red-100 text-red-800">
														<Play className="w-3 h-3 mr-1" />
														Live
													</Badge>
												)}
											</div>
										</div>
									</div>
								</div>
								<p className="text-gray-600 mt-2">{selectedChatroom.description}</p>
							</div>

							{/* Stats */}
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								<div className="text-center">
									<div className="text-2xl font-bold text-blue-600">
										{selectedChatroom.participantsCount || 0}
									</div>
									<div className="text-sm text-gray-500">Participants</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-green-600">
										{selectedChatroom.messageCount || 0}
									</div>
									<div className="text-sm text-gray-500">Messages</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-purple-600">
										{selectedChatroom.reportsCount || 0}
									</div>
									<div className="text-sm text-gray-500">Reports</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-orange-600">
										{selectedChatroom.bannedCount || 0}
									</div>
									<div className="text-sm text-gray-500">Banned</div>
								</div>
							</div>

							{/* Recent Messages Preview */}
							<div>
								<h4 className="font-medium mb-3">Recent Messages</h4>
								<div className="space-y-2 max-h-48 overflow-y-auto">
									{selectedChatroom.recentMessages && selectedChatroom.recentMessages.length > 0 ? (
										selectedChatroom.recentMessages.map((message, index) => (
											<div key={index} className="flex space-x-3 p-2 bg-gray-50 rounded">
												<div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
													<span className="text-xs font-semibold text-blue-600">
														{message.sender?.name?.[0] || '?'}
													</span>
												</div>
												<div className="flex-1 min-w-0">
													<div className="flex items-center space-x-2">
														<span className="text-sm font-medium truncate">
															{message.sender?.name || 'Unknown'}
														</span>
														<span className="text-xs text-gray-500">
															{message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : ''}
														</span>
													</div>
													<p className="text-sm text-gray-700 truncate">
														{message.content}
													</p>
												</div>
											</div>
										))
									) : (
										<div className="text-center py-4 text-gray-500">
											<MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
											<p>No recent messages</p>
										</div>
									)}
								</div>
							</div>

							{/* Actions */}
							<div className="flex justify-end space-x-2 pt-4 border-t">
								<Button variant="outline">
									View All Messages
								</Button>
								<Button variant="outline">
									Manage Participants
								</Button>
								<Button variant="destructive">
									Suspend Chatroom
								</Button>
							</div>
						</div>
					)}
				</Modal>

				{/* Delete Confirmation Dialog */}
				<ConfirmDialog
					isOpen={showDeleteDialog}
					onClose={() => {
						setShowDeleteDialog(false);
						setSelectedChatroom(null);
					}}
					onConfirm={confirmDeleteChatroom}
					title="Delete Chatroom"
					description={`Are you sure you want to delete "${selectedChatroom?.name}"? This action cannot be undone and will remove all messages and participant data.`}
					confirmLabel="Delete Chatroom"
				/>
			</div>
		</Layout>
	);
}
