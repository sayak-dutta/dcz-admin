import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
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
	AlertTriangle,
	Ban,
	Clock,
	Filter,
	Check,
	CheckCheck,
	Edit,
	Image as ImageIcon,
	Video,
	File,
	Trash2,
	EyeOff,
	ShieldAlert
} from 'lucide-react';
import { useAdminMessages } from '@/hooks/useAdminMessages';
import { StatusBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';
import { useAdminAuthContext } from '@/contexts/AdminAuthContext';

export default function MessengerMonitoring() {
	const router = useRouter();
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedConversation, setSelectedConversation] = useState(null);
	const [showConversationModal, setShowConversationModal] = useState(false);
	const { adminUser, isSuperAdmin, loading: authLoading } = useAdminAuthContext();
	const messagesEndRef = useRef(null);

	if (!authLoading && !isSuperAdmin()) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<Card className="max-w-md w-full mx-4">
					<CardContent className="pt-6 text-center space-y-4">
						<ShieldAlert className="w-16 h-16 text-amber-500 mx-auto" />
						<CardTitle className="text-xl">Access Denied</CardTitle>
						<p className="text-gray-600">
							You do not have permission to view this page. Messenger monitoring is restricted to super-admins only.
						</p>
						<Button onClick={() => router.push('/')} className="w-full">
							Return to Dashboard
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	const {
		conversations,
		loading,
		error,
		fetchConversations,
		getConversationMessages
	} = useAdminMessages();

	const handleViewConversation = async (conversation) => {
		setSelectedConversation(conversation);
		setShowConversationModal(true);

		// Fetch full conversation messages
		if (conversation.conversationId || conversation.id) {
			const conversationId = conversation.conversationId || conversation.id;
			const messages = await getConversationMessages(conversationId);

			setSelectedConversation(prev => ({
				...prev,
				messages: messages?.messages || messages?.data?.messages || []
			}));
		}
	};

	// Auto-scroll to bottom when messages are loaded
	useEffect(() => {
		if (messagesEndRef.current && selectedConversation?.messages?.length > 0) {
			messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, [selectedConversation?.messages]);

	// Helper function to format timestamp
	const formatMessageTime = (timestamp) => {
		if (!timestamp) return '';
		const date = new Date(timestamp);
		const now = new Date();
		const diffMs = now - date;
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;
		return date.toLocaleDateString();
	};

	// Helper function to get message type icon
	const getMessageTypeIcon = (messageType) => {
		switch (messageType) {
			case 'image':
				return <ImageIcon className="w-3 h-3" />;
			case 'video':
				return <Video className="w-3 h-3" />;
			case 'file':
				return <File className="w-3 h-3" />;
			default:
				return null;
		}
	};

	// Helper function to determine if message is from first participant (for alignment)
	// Messages from first participant go left, others go right
	const isMessageFromUser1 = (message, conversation, messageIndex) => {
		// Try to use conversation participants if available
		if (conversation?.participants && conversation.participants.length >= 2) {
			const firstParticipantId = conversation.participants[0]?.id || conversation.participants[0]?._id;
			const messageSenderId = message.senderId || message.sender?._id || message.sender?.id;
			return messageSenderId === firstParticipantId;
		}

		// Fallback: alternate messages for visual distinction
		// This ensures messages appear on different sides
		return messageIndex % 2 === 0;
	};

	const getConversationTypeIcon = (type) => {
		switch (type) {
			case 'direct':
				return <MessageSquare className="w-4 h-4 text-blue-500" />;
			case 'group':
				return <Users className="w-4 h-4 text-green-500" />;
			case 'public':
				return <MessageSquare className="w-4 h-4 text-purple-500" />;
			default:
				return <MessageSquare className="w-4 h-4 text-gray-500" />;
		}
	};

	const getConversationTypeLabel = (type) => {
		switch (type) {
			case 'direct':
				return 'Direct Message';
			case 'group':
				return 'Group Chat';
			case 'public':
				return 'Public Chat';
			default:
				return type;
		}
	};

	return (
		<Layout title="Messenger Monitoring">
			<div className="space-y-6">
				{/* Header */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div>
						<h1 className="text-2xl font-bold">Messenger Monitoring</h1>
						<p className="text-muted-foreground">
							Monitor and moderate all messaging conversations
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
									placeholder="Search conversations..."
									className="pl-10"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</div>

							<div className="flex gap-2">
								<select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
									<option value="all">All Types</option>
									<option value="direct">Direct Messages</option>
									<option value="group">Group Chats</option>
									<option value="public">Public Chats</option>
								</select>

								<select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
									<option value="all">All Status</option>
									<option value="active">Active</option>
									<option value="moderated">Moderated</option>
									<option value="reported">Reported</option>
								</select>
							</div>
						</div>
					</CardHeader>

					<CardContent>
						{loading ? (
							<div className="flex items-center justify-center p-8">
								<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
								Loading conversations...
							</div>
						) : error ? (
							<div className="text-center p-8 text-red-600">
								Error: {error}
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Type</TableHead>
										<TableHead>Participants</TableHead>
										<TableHead>Last Message</TableHead>
										<TableHead>Last Activity</TableHead>
										<TableHead>Status</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{conversations && conversations.length > 0 ? (
										conversations.map((conversation) => (
											<TableRow key={conversation.id}>
												<TableCell>
													<div className="flex items-center space-x-2">
														{getConversationTypeIcon(conversation.type)}
														<span className="text-sm font-medium">
															{getConversationTypeLabel(conversation.type)}
														</span>
													</div>
												</TableCell>
												<TableCell>
													<div className="flex items-center space-x-2">
														<span className="text-sm">
															{conversation.sender.username} <br /> {conversation.receiver.username}
														</span>
														{conversation.unreadCount > 0 && (
															<Badge variant="destructive" className="text-xs">
																{conversation.unreadCount} new
															</Badge>
														)}
													</div>
												</TableCell>
												<TableCell>
													<div className="max-w-xs">
														<p className="text-sm truncate">
															{conversation.lastMessage?.content || 'No messages yet'}
														</p>
														<p className="text-xs text-gray-500">
															by {conversation.lastMessage?.senderId?.username || 'Unknown'}
														</p>
													</div>
												</TableCell>
												<TableCell>
													<div className="flex items-center space-x-1">
														<Clock className="w-3 h-3 text-gray-400" />
														<span className="text-sm text-gray-600">
															{conversation.lastActivity
																? new Date(conversation.lastActivity).toLocaleString()
																: 'Never'
															}
														</span>
													</div>
												</TableCell>
												<TableCell>
													<StatusBadge
														status={conversation.status || 'active'}
														customLabel={
															conversation.moderated ? 'Moderated' :
																conversation.reported ? 'Reported' :
																	'Active'
														}
													/>
												</TableCell>
												<TableCell className="text-right">
													<div className="flex items-center justify-end space-x-2">
														<Button
															size="sm"
															variant="ghost"
															onClick={() => handleViewConversation(conversation)}
														>
															<Eye className="w-4 h-4 mr-1" />
															View
														</Button>
														{conversation.reported && (
															<Button size="sm" variant="ghost">
																<AlertTriangle className="w-4 h-4 mr-1" />
																Moderate
															</Button>
														)}
														<Button size="sm" variant="ghost">
															<Ban className="w-4 h-4 mr-1" />
															Block
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))
									) : (
										<TableRow>
											<TableCell colSpan={6} className="text-center py-8 text-gray-500">
												No conversations found
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>

				{/* Conversation Details Modal */}
				<Modal
					isOpen={showConversationModal}
					onClose={() => {
						setShowConversationModal(false);
						setSelectedConversation(null);
					}}
					title="Conversation Details"
					size="lg"
				>
					{selectedConversation && (
						<div className="space-y-4">
							{/* Conversation Info */}
							<div className="border-b pb-4 space-y-3">
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-2">
										{getConversationTypeIcon(selectedConversation.type)}
										<h3 className="text-lg font-medium">
											{getConversationTypeLabel(selectedConversation.type)}
										</h3>
									</div>
									<StatusBadge status={selectedConversation.status || 'active'} />
								</div>

								{/* Participants Info
								{selectedConversation.participants && selectedConversation.participants.length > 0 && (
									<div className="flex items-center space-x-2 text-sm text-gray-600">
										<Users className="w-4 h-4" />
										<span>
											{selectedConversation.participants.length} participant{selectedConversation.participants.length !== 1 ? 's' : ''}
											{selectedConversation.participants.length <= 3 && (
												<span className="ml-2">
													({selectedConversation.participants.map(p => p.name || p.username || 'Unknown').join(', ')})
												</span>
											)}
										</span>
									</div>
								)} */}

								{/* Conversation Metadata */}
								<div className="flex items-center space-x-4 text-xs text-gray-500">
									{selectedConversation.createdAt && (
										<span>
											Created: {new Date(selectedConversation.createdAt).toLocaleDateString()}
										</span>
									)}
									{selectedConversation.lastActivity && (
										<span>
											Last activity: {formatMessageTime(selectedConversation.lastActivity)}
										</span>
									)}
									{selectedConversation.messageCount !== undefined && (
										<span>
											{selectedConversation.messageCount} message{selectedConversation.messageCount !== 1 ? 's' : ''}
										</span>
									)}
								</div>
							</div>

							{/* Messages - Chat-like UI */}
							<div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto space-y-3 scroll-smooth">
								{selectedConversation.messages && selectedConversation.messages.length > 0 ? (
									selectedConversation.messages.map((message, index) => {
										const isFromLeft = isMessageFromUser1(message, selectedConversation, index);
										const isDeleted = message.isDeleted;
										const isHidden = message.isHidden;
										const isModerated = message.isModerated;
										const isEdited = message.isEdited;

										return (
											<div
												key={message._id || message.id || index}
												className={`flex ${isFromLeft ? 'justify-start' : 'justify-end'} ${isHidden ? 'opacity-50' : ''}`}
											>
												<div className={`flex items-end space-x-2 max-w-[75%] ${isFromLeft ? 'flex-row' : 'flex-row-reverse space-x-reverse'}`}>
													{/* Avatar - only show on left side */}
													{isFromLeft && (
														<div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
															<span className="text-xs font-semibold text-white">
																{message.senderId?.username?.[0]?.toUpperCase() || 'U'}
															</span>
														</div>
													)}

													{/* Message Bubble */}
													<div
														className={`rounded-2xl px-4 py-2 ${isFromLeft
															? 'bg-white border border-gray-200 rounded-tl-none'
															: 'bg-blue-600 text-white rounded-tr-none'
															} ${isDeleted ? 'bg-gray-200' : ''} ${isModerated ? 'border-2 border-yellow-400' : ''}`}
													>
														{/* Message Header */}
														{isFromLeft && (
															<div className="flex items-center space-x-2 mb-1">
																<span className={`text-xs font-medium ${isFromLeft ? 'text-gray-700' : 'text-white'}`}>
																	{message.senderId?.username || 'Unknown'}
																</span>
																{getMessageTypeIcon(message.messageType)}
															</div>
														)}

														{/* Message Content */}
														<div className="flex items-start space-x-2">
															{isDeleted ? (
																<div className="flex items-center space-x-2 text-gray-400 italic">
																	<Trash2 className="w-4 h-4" />
																	<span className="text-sm">This message was deleted</span>
																</div>
															) : (
																<>
																	{message.mediaUrl && message.mediaUrl.trim() !== '' ? (
																		<div className="space-y-2">
																			{message.messageType === 'image' && (
																				<img
																					src={message.mediaUrl}
																					alt="Message media"
																					className="max-w-xs rounded-lg cursor-pointer hover:opacity-90"
																					onClick={() => window.open(message.mediaUrl, '_blank')}
																				/>
																			)}
																			{message.messageType === 'video' && (
																				<video
																					src={message.mediaUrl}
																					controls
																					className="max-w-xs rounded-lg"
																				/>
																			)}
																			{message.messageType === 'file' && (
																				<a
																					href={message.mediaUrl}
																					target="_blank"
																					rel="noopener noreferrer"
																					className="flex items-center space-x-2 text-blue-500 hover:text-blue-600"
																				>
																					<File className="w-4 h-4" />
																					<span className="text-sm">Download file</span>
																				</a>
																			)}
																			{message.content && message.content.trim() !== '' && (
																				<p className={`text-sm mt-2 ${isFromLeft ? 'text-gray-800' : 'text-white'}`}>
																					{message.content}
																				</p>
																			)}
																		</div>
																	) : (
																		<p className={`text-sm ${isFromLeft ? 'text-gray-800' : 'text-white'}`}>
																			{message.content && message.content.trim() !== '' ? message.content : '(Empty message)'}
																		</p>
																	)}
																</>
															)}
														</div>

														{/* Message Footer with Status Indicators */}
														<div className={`flex items-center justify-end space-x-1 mt-1 ${isFromLeft ? 'justify-start' : 'justify-end'}`}>
															{/* Timestamp */}
															<span className={`text-xs ${isFromLeft ? 'text-gray-500' : 'text-blue-100'}`}>
																{formatMessageTime(message.createdAt || message.timestamp)}
															</span>

															{/* Status Indicators */}
															{!isFromLeft && !isDeleted && (
																<div className="flex items-center space-x-1 ml-1">
																	{message.isDelivered && (
																		<Check className={`w-3 h-3 ${message.isRead ? 'text-blue-300' : 'text-blue-200'}`} />
																	)}
																	{message.isRead && (
																		<CheckCheck className="w-3 h-3 text-blue-300" />
																	)}
																</div>
															)}

															{/* Edited Indicator */}
															{isEdited && (
																<span className={`text-xs ml-1 ${isFromLeft ? 'text-gray-500' : 'text-blue-100'}`}>
																	<Edit className="w-3 h-3 inline" />
																</span>
															)}

															{/* Hidden Indicator */}
															{isHidden && (
																<EyeOff className={`w-3 h-3 ml-1 ${isFromLeft ? 'text-gray-400' : 'text-blue-200'}`} />
															)}

															{/* Moderated Indicator */}
															{isModerated && (
																<AlertTriangle className={`w-3 h-3 ml-1 ${isFromLeft ? 'text-yellow-500' : 'text-yellow-300'}`} />
															)}
														</div>
													</div>

													{/* Avatar - only show on right side */}
													{!isFromLeft && (
														<div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
															<span className="text-xs font-semibold text-white">
																{message.senderId?.username?.[0]?.toUpperCase() || 'U'}
															</span>
														</div>
													)}
												</div>
											</div>
										);
									})
								) : (
									<div className="text-center py-8 text-gray-500">
										<MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
										<p>No messages in this conversation</p>
									</div>
								)}
								{/* Scroll anchor */}
								<div ref={messagesEndRef} />
							</div>

							{/* Actions */}
							<div className="flex justify-end space-x-2 pt-4 border-t">
								<Button variant="outline">
									Mark as Moderated
								</Button>
								<Button variant="destructive">
									Block Conversation
								</Button>
							</div>
						</div>
					)}
				</Modal>
			</div>
		</Layout>
	);
}
