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
	Video,
	Play,
	Square,
	Loader2,
	Clock,
	User
} from 'lucide-react';
import { useAdminLivestreams } from '@/hooks/useAdminLivestreams';
import { Modal } from '@/components/ui/modal';

export default function LivestreamsPage() {
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedChatroom, setSelectedChatroom] = useState(null);
	const [showChatroomModal, setShowChatroomModal] = useState(false);
	const [chatroomMessages, setChatroomMessages] = useState([]);
	const [loadingDetails, setLoadingDetails] = useState(false);

	const {
		livestreams,
		loading,
		error,
		pagination,
		fetchLivestreams,
		getLivestreamDetails
	} = useAdminLivestreams();

	// Fetch live chatrooms on component mount and when filters/page change
	useEffect(() => {
		const delay = searchTerm ? 500 : 0; // Debounce search

		const timeoutId = setTimeout(() => {
			fetchLivestreams({
				page: currentPage,
				limit: 20,
				// isLive: true,
				// isApproved: true,
				search: searchTerm || undefined,
			});
		}, delay);

		return () => clearTimeout(timeoutId);
	}, [searchTerm, currentPage, fetchLivestreams]);

	const handleViewLivestreamDetails = async (livestream) => {
		setSelectedChatroom(livestream);
		setShowChatroomModal(true);
		setLoadingDetails(true);

		try {
			// Fetch livestream details
			const detailsResponse = await getLivestreamDetails(livestream._id);
			setChatroomMessages(detailsResponse.data?.data?.messages || []);
		} catch (error) {
			console.error('Failed to fetch livestream details:', error);
		} finally {
			setLoadingDetails(false);
		}
	};

	const handleToggleLiveStatus = async (livestreamId, isLive) => {
		// Note: Livestream status control might be handled differently
		// This is a placeholder for future implementation
		console.log('Toggle live status for:', livestreamId, isLive);
	};

	const getLiveStatusBadge = (isLive, goingLive) => {
		if (isLive) {
			return <Badge className="bg-red-500 hover:bg-red-600"><Play className="w-3 h-3 mr-1" />Live Now</Badge>;
		}
		if (goingLive === 'now') {
			return <Badge variant="warning"><Clock className="w-3 h-3 mr-1" />Going Live</Badge>;
		}
		if (goingLive === 'later') {
			return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Scheduled</Badge>;
		}
		return <Badge variant="outline">Offline</Badge>;
	};

	const getChatroomTypeBadge = (type) => {
		switch (type) {
			case 'public': return <Badge variant="success">Public</Badge>;
			case 'private': return <Badge variant="warning">Private</Badge>;
			case 'secret': return <Badge variant="destructive">Secret</Badge>;
			default: return <Badge variant="outline">{type}</Badge>;
		}
	};

	const getStatsCards = () => {
		const liveNow = livestreams.filter(l => l.isLive).length;
		const approvedStreams = livestreams.filter(l => l.isApproved).length;
		const totalViewers = livestreams.reduce((sum, l) => sum + (l.viewers?.length || 0), 0);
		const totalStreams = pagination.totalLivestreams || 0;

		return [
			{
				title: "Live Now",
				value: liveNow.toString(),
				change: "Currently streaming",
				icon: Video,
				color: "red"
			},
			{
				title: "Approved Streams",
				value: approvedStreams.toString(),
				change: "Admin approved",
				icon: Clock,
				color: "green"
			},
			{
				title: "Total Viewers",
				value: totalViewers.toString(),
				change: "Across all streams",
				icon: Users,
				color: "blue"
			},
			{
				title: "Total Streams",
				value: totalStreams.toString(),
				change: "All livestreams",
				icon: MessageSquare,
				color: "purple"
			}
		];
	};

	const formatDuration = (startTime) => {
		if (!startTime) return 'N/A';
		const start = new Date(startTime);
		const now = new Date();
		const diffMs = now - start;
		const diffHours = Math.floor(diffMs / 3600000);
		const diffMinutes = Math.floor((diffMs % 3600000) / 60000);

		if (diffHours > 0) {
			return `${diffHours}h ${diffMinutes}m`;
		}
		return `${diffMinutes}m`;
	};

	return (
		<Layout title="Live Streams">
			<div className="space-y-6">
				{/* Header */}
				<p className="text-muted-foreground">
					Monitor and manage live streaming chatrooms
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
									placeholder="Search livestreams..."
									className="pl-10"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</div>

							<div className="flex gap-2">
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
								Loading livestreams...
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
										<TableHead>Duration</TableHead>
										<TableHead>Created By</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{livestreams.length > 0 ? livestreams.map((livestream) => (
										<TableRow key={livestream._id}>
											<TableCell>
												<div className="flex items-center space-x-3">
													{livestream.thumbnail ? (
														<img src={livestream.thumbnail} alt={livestream.title} className="w-10 h-10 rounded-lg object-cover" />
													) : (
														<div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
															<Video className="w-5 h-5 text-gray-500" />
														</div>
													)}
													<div>
														<p className="font-medium text-sm">{livestream.title || 'Livestream'}</p>
														<p className="text-xs text-gray-500">
															{livestream.category || 'General'}
														</p>
													</div>
												</div>
											</TableCell>
											<TableCell>
												{livestream.category ? (
													<Badge variant="outline">{livestream.category}</Badge>
												) : (
													<Badge variant="outline">General</Badge>
												)}
											</TableCell>
											<TableCell>
												<div className="flex flex-col space-y-1">
													{livestream.isLive ? (
														<Badge className="bg-red-500 hover:bg-red-600"><Play className="w-3 h-3 mr-1" />Live</Badge>
													) : (
														<Badge variant="secondary">Offline</Badge>
													)}
													{livestream.isApproved && (
														<Badge variant="success" className="text-xs">Approved</Badge>
													)}
												</div>
											</TableCell>
											<TableCell className="text-sm">
												{livestream.viewers?.length || 0}
											</TableCell>
											<TableCell className="text-sm">
												{livestream.isLive ? formatDuration(livestream.startedAt) : 'N/A'}
											</TableCell>
											<TableCell className="text-sm">
												{livestream.streamer?.profile?.firstName && livestream.streamer?.profile?.lastName
													? `${livestream.streamer.profile.firstName} ${livestream.streamer.profile.lastName}`
													: livestream.streamer?.username || 'Unknown'}
											</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end space-x-2">
													<Button
														size="sm"
														variant="ghost"
														onClick={() => handleViewLivestreamDetails(livestream)}
														title="View livestream details"
													>
														<Eye className="w-4 h-4" />
													</Button>
													<Button
														size="sm"
														variant={livestream.isLive ? "destructive" : "default"}
														onClick={() => handleToggleLiveStatus(livestream._id, livestream.isLive)}
														title={livestream.isLive ? 'End livestream' : 'Start livestream'}
													>
														{livestream.isLive ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
													</Button>
												</div>
											</TableCell>
										</TableRow>
									)) : (
										<TableRow>
											<TableCell colSpan={7} className="text-center py-8 text-gray-500">
												<Video className="w-8 h-8 mx-auto mb-2 opacity-50" />
												<p>No active livestreams</p>
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>

				{/* Pagination */}
				{!loading && livestreams.length > 0 && (
					<div className="flex items-center justify-between">
						<p className="text-sm text-muted-foreground">
							Showing {((pagination.currentPage - 1) * 20) + 1} to {Math.min(pagination.currentPage * 20, pagination.totalLivestreams || 0)} of {pagination.totalLivestreams || 0} results
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
					}}
					title="Livestream Details"
					size="xl"
				>
					{selectedChatroom && (
						<div className="space-y-6">
							{/* Livestream Info */}
							<div className="border-b pb-4">
								<div className="flex items-start space-x-4">
									{selectedChatroom.thumbnail ? (
										<img src={selectedChatroom.thumbnail} alt={selectedChatroom.title} className="w-20 h-20 rounded-lg object-cover" />
									) : (
										<div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
											<Video className="w-8 h-8 text-gray-500" />
										</div>
									)}
									<div className="flex-1">
										<h3 className="text-xl font-semibold">{selectedChatroom.title || 'Livestream'}</h3>
										<p className="text-gray-600 mb-2">{selectedChatroom.description || 'Live streaming session'}</p>
										<div className="flex flex-wrap gap-2">
											<Badge variant="outline">{selectedChatroom.category || 'General'}</Badge>
											{selectedChatroom.isLive ? (
												<Badge className="bg-red-500 hover:bg-red-600"><Play className="w-3 h-3 mr-1" />Live</Badge>
											) : (
												<Badge variant="secondary">Offline</Badge>
											)}
											{selectedChatroom.isApproved && (
												<Badge variant="success">Approved</Badge>
											)}
										</div>
									</div>
								</div>

								<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
									<div className="text-center">
										<p className="text-2xl font-bold text-blue-600">{selectedChatroom.viewers?.length || 0}</p>
										<p className="text-sm text-gray-500">Viewers</p>
									</div>
									<div className="text-center">
										<p className="text-2xl font-bold text-green-600">{selectedChatroom.likes || 0}</p>
										<p className="text-sm text-gray-500">Likes</p>
									</div>
									<div className="text-center">
										<p className="text-2xl font-bold text-purple-600">
											{selectedChatroom.isLive ? formatDuration(selectedChatroom.startedAt) : 'N/A'}
										</p>
										<p className="text-sm text-gray-500">Duration</p>
									</div>
									<div className="text-center">
										<p className="text-2xl font-bold text-orange-600">
											{selectedChatroom.comments || 0}
										</p>
										<p className="text-sm text-gray-500">Comments</p>
									</div>
								</div>
							</div>

							{/* Livestream Details */}
							{loadingDetails ? (
								<div className="flex items-center justify-center p-8">
									<Loader2 className="w-6 h-6 animate-spin mr-2" />
									Loading details...
								</div>
							) : (
								<div className="space-y-4">
									<h4 className="text-lg font-semibold">Stream Information</h4>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<p className="text-sm text-gray-600">Streamer</p>
											<p className="font-medium">
												{selectedChatroom.streamer?.profile?.firstName && selectedChatroom.streamer?.profile?.lastName
													? `${selectedChatroom.streamer.profile.firstName} ${selectedChatroom.streamer.profile.lastName}`
													: selectedChatroom.streamer?.username || 'Unknown'}
											</p>
										</div>
										<div>
											<p className="text-sm text-gray-600">Started At</p>
											<p className="font-medium">
												{selectedChatroom.startedAt ? new Date(selectedChatroom.startedAt).toLocaleString() : 'Not started'}
											</p>
										</div>
										<div>
											<p className="text-sm text-gray-600">Category</p>
											<p className="font-medium">{selectedChatroom.category || 'General'}</p>
										</div>
										<div>
											<p className="text-sm text-gray-600">Status</p>
											<p className="font-medium">
												{selectedChatroom.isLive ? 'Live' : 'Offline'} • {selectedChatroom.isApproved ? 'Approved' : 'Pending'}
											</p>
										</div>
									</div>
								</div>
							)}
						</div>
					)}
				</Modal>
			</div>
		</Layout>
	);
}
