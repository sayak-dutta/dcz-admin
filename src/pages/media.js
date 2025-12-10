import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
	Search,
	Filter,
	Download,
	Eye,
	Trash2,
	CheckCircle,
	XCircle,
	AlertTriangle,
	Loader2,
	Image as ImageIcon,
	Video,
	File
} from 'lucide-react';
import { useAdminMedia } from '@/hooks/useAdminMedia';
import { Modal } from '@/components/ui/modal';

export default function MediaModeration() {
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedMedia, setSelectedMedia] = useState(null);
	const [showMediaModal, setShowMediaModal] = useState(false);

	const {
		media,
		loading,
		error,
		pagination,
		fetchMedia,
		updateModerationStatus,
		deleteMedia
	} = useAdminMedia();

	// Fetch media on component mount and when filters/page change
	useEffect(() => {
		const delay = searchTerm ? 500 : 0; // Debounce search

		const timeoutId = setTimeout(() => {
			fetchMedia({
				page: currentPage,
				limit: 20,
				moderationStatus: statusFilter !== 'all' ? statusFilter : undefined,
				search: searchTerm || undefined,
			});
		}, delay);

		return () => clearTimeout(timeoutId);
	}, [searchTerm, statusFilter, currentPage, fetchMedia]);

	const handleViewMedia = (mediaItem) => {
		setSelectedMedia(mediaItem);
		setShowMediaModal(true);
	};

	const handleApproveMedia = async (mediaId) => {
		const result = await updateModerationStatus(mediaId, { status: 'approved' });
		if (result.success) {
			// Refresh the media list
			fetchMedia({
				page: currentPage,
				limit: 20,
				moderationStatus: statusFilter !== 'all' ? statusFilter : undefined,
				search: searchTerm || undefined,
			});
		}
	};

	const handleRejectMedia = async (mediaId) => {
		const result = await updateModerationStatus(mediaId, { status: 'rejected' });
		if (result.success) {
			// Refresh the media list
			fetchMedia({
				page: currentPage,
				limit: 20,
				moderationStatus: statusFilter !== 'all' ? statusFilter : undefined,
				search: searchTerm || undefined,
			});
		}
	};

	const handleDeleteMedia = async (mediaId) => {
		const result = await deleteMedia(mediaId);
		if (result.success) {
			// Refresh the media list
			fetchMedia({
				page: currentPage,
				limit: 20,
				moderationStatus: statusFilter !== 'all' ? statusFilter : undefined,
				search: searchTerm || undefined,
			});
		}
	};

	const getStatusBadge = (status) => {
		switch (status.toLowerCase()) {
			case 'pending':
				return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />Pending</Badge>;
			case 'approved':
				return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
			case 'rejected':
				return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	const getMediaTypeIcon = (type) => {
		switch (type) {
			case 'image':
				return <ImageIcon className="w-4 h-4" />;
			case 'video':
				return <Video className="w-4 h-4" />;
			default:
				return <File className="w-4 h-4" />;
		}
	};

	const formatFileSize = (bytes) => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	const getStatsCards = () => {
		const approved = media.filter(item => item.moderationStatus === 'approved').length;
		const pending = media.filter(item => item.moderationStatus === 'pending').length;
		const rejected = media.filter(item => item.moderationStatus === 'rejected').length;

		return [
			{
				title: "Total Media",
				value: pagination.totalMedia?.toString() || "0",
				change: "All uploaded files",
				icon: Eye,
				color: "blue"
			},
			{
				title: "Pending Review",
				value: pending.toString(),
				change: "Requires attention",
				icon: AlertTriangle,
				color: "yellow"
			},
			{
				title: "Approved",
				value: approved.toString(),
				change: "Safe content",
				icon: CheckCircle,
				color: "green"
			},
			{
				title: "Rejected",
				value: rejected.toString(),
				change: "Removed content",
				icon: XCircle,
				color: "red"
			}
		];
	};

	return (
		<Layout title="Media Moderation">
			<div className="space-y-6">
				<p className="text-muted-foreground">
					Review and moderate reported media content
				</p>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					{getStatsCards().map((stat, index) => (
						<Card key={index}>
						<CardContent className="p-4">
							<div className="flex items-center space-x-2">
									<stat.icon className={`w-4 h-4 text-${stat.color}-500`} />
								<div>
										<p className="text-sm font-medium">{stat.title}</p>
										<p className="text-2xl font-bold">{stat.value}</p>
										<p className="text-xs text-muted-foreground">{stat.change}</p>
								</div>
							</div>
						</CardContent>
					</Card>
					))}
				</div>

				<Card>
					<CardHeader>
						<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
							<div className="relative flex-1 max-w-sm">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
								<Input
									placeholder="Search media reports..."
									className="pl-10"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</div>

							<div className="flex gap-2">
								<select
									className="px-3 py-2 border border-gray-200 rounded-md text-sm"
									value={statusFilter}
									onChange={(e) => setStatusFilter(e.target.value)}
								>
									<option value="all">All Status</option>
									<option value="pending">Pending</option>
									<option value="approved">Approved</option>
									<option value="rejected">Rejected</option>
								</select>

								<Button variant="outline" size="sm">
									<Filter className="w-4 h-4 mr-2" />
									More Filters
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
								Loading media...
							</div>
						) : error ? (
							<div className="text-center p-8 text-red-600">
								Error: {error}
							</div>
						) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{media.length > 0 ? media.map((item) => (
									<div key={item._id} className="border rounded-lg p-4 space-y-4">
									{/* Media Preview */}
									<div className="relative">
											<div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
												{item.type === 'image' ? (
													<img
														src={item.thumbnailUrl || item.url}
														alt="Media preview"
														className="w-full h-full object-cover cursor-pointer"
														onClick={() => window.open(item.url, '_blank')}
													/>
												) : item.type === 'video' ? (
													<div className="text-gray-500 text-sm flex flex-col items-center">
														<Video className="w-8 h-8 mb-2" />
														<span>Video Content</span>
													</div>
											) : (
													<div className="text-gray-500 text-sm flex flex-col items-center">
														<File className="w-8 h-8 mb-2" />
														<span>File Content</span>
													</div>
											)}
										</div>
										<div className="absolute top-2 right-2">
												{getStatusBadge(item.moderationStatus)}
											</div>
											<div className="absolute top-2 left-2">
												<div className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
													{getMediaTypeIcon(item.type)}
													<span>{item.type}</span>
												</div>
										</div>
									</div>

									{/* Media Info */}
									<div className="space-y-2">
										<div>
											<p className="text-sm font-medium">Uploaded by</p>
												<p className="text-sm text-gray-600">
													{item.userId?.profile?.firstName && item.userId?.profile?.lastName
														? `${item.userId.profile.firstName} ${item.userId.profile.lastName}`
														: item.userId?.username || 'Unknown'}
												</p>
										</div>

										<div>
												<p className="text-sm font-medium">Source</p>
												<p className="text-sm text-gray-600 capitalize">{item.source || 'Unknown'}</p>
										</div>

										<div>
												<p className="text-sm font-medium">File Info</p>
												<p className="text-sm text-gray-600">
													{formatFileSize(item.size)} • {item.metadata?.width}x{item.metadata?.height || 'N/A'}
												</p>
										</div>

										<div className="flex justify-between text-xs text-gray-500">
												<span>Uploaded: {new Date(item.uploadedAt).toLocaleDateString()}</span>
												<span>{item.usage?.viewCount || 0} views</span>
										</div>
									</div>

									{/* Actions */}
										<div className="space-y-2">
											{item.moderationStatus === 'pending' && (
										<div className="flex space-x-2">
													<Button
														size="sm"
														className="flex-1 bg-green-600 hover:bg-green-700"
														onClick={() => handleApproveMedia(item._id)}
													>
												<CheckCircle className="w-3 h-3 mr-1" />
												Approve
											</Button>
													<Button
														size="sm"
														variant="destructive"
														className="flex-1"
														onClick={() => handleRejectMedia(item._id)}
													>
												<XCircle className="w-3 h-3 mr-1" />
														Reject
											</Button>
										</div>
									)}

									<div className="flex space-x-2">
												<Button
													size="sm"
													variant="outline"
													className="flex-1"
													onClick={() => handleViewMedia(item)}
												>
											<Eye className="w-3 h-3 mr-1" />
											View Details
										</Button>
												<Button
													size="sm"
													variant="outline"
													onClick={() => handleDeleteMedia(item._id)}
												>
													<Trash2 className="w-3 h-3 mr-1" />
												</Button>
											</div>
										</div>
									</div>
								)) : (
									<div className="col-span-full text-center py-8 text-gray-500">
										<Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
										<p>No media found</p>
								</div>
								)}
						</div>
						)}
					</CardContent>
				</Card>

				{/* Pagination */}
				{!loading && media.length > 0 && (
					<div className="flex items-center justify-between">
						<p className="text-sm text-muted-foreground">
							Showing {((pagination.currentPage - 1) * 20) + 1} to {Math.min(pagination.currentPage * 20, pagination.totalMedia)} of {pagination.totalMedia} results
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

				{/* Media Details Modal */}
				<Modal
					isOpen={showMediaModal}
					onClose={() => {
						setShowMediaModal(false);
						setSelectedMedia(null);
					}}
					title="Media Details"
					size="lg"
				>
					{selectedMedia && (
						<div className="space-y-6">
							{/* Media Preview */}
							<div className="flex justify-center">
								{selectedMedia.type === 'image' ? (
									<img
										src={selectedMedia.url}
										alt="Media content"
										className="max-w-full max-h-96 object-contain rounded-lg"
									/>
								) : selectedMedia.type === 'video' ? (
									<video
										src={selectedMedia.url}
										controls
										className="max-w-full max-h-96 rounded-lg"
									/>
								) : (
									<div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
										<File className="w-16 h-16 mx-auto mb-4 text-gray-400" />
										<p className="text-gray-500">File content cannot be previewed</p>
										<a
											href={selectedMedia.url}
											target="_blank"
											rel="noopener noreferrer"
											className="text-blue-500 hover:text-blue-600 mt-2 inline-block"
										>
											Download File
										</a>
									</div>
								)}
							</div>

							{/* Media Information */}
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium text-gray-500">Media ID</label>
									<p className="text-sm text-gray-900">{selectedMedia._id}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-500">Type</label>
									<p className="text-sm text-gray-900 capitalize">{selectedMedia.type}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-500">File Size</label>
									<p className="text-sm text-gray-900">{formatFileSize(selectedMedia.size)}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-500">Dimensions</label>
									<p className="text-sm text-gray-900">
										{selectedMedia.metadata?.width}x{selectedMedia.metadata?.height || 'N/A'}
									</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-500">Uploaded By</label>
									<p className="text-sm text-gray-900">
										{selectedMedia.userId?.profile?.firstName && selectedMedia.userId?.profile?.lastName
											? `${selectedMedia.userId.profile.firstName} ${selectedMedia.userId.profile.lastName}`
											: selectedMedia.userId?.username || 'Unknown'}
									</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-500">Source</label>
									<p className="text-sm text-gray-900 capitalize">{selectedMedia.source || 'Unknown'}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-500">Upload Date</label>
									<p className="text-sm text-gray-900">
										{new Date(selectedMedia.uploadedAt).toLocaleString()}
									</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-500">Status</label>
									<p className="text-sm text-gray-900">{getStatusBadge(selectedMedia.moderationStatus)}</p>
								</div>
							</div>

							{/* Usage Statistics */}
							<div>
								<h4 className="text-lg font-medium text-gray-900 mb-3">Usage Statistics</h4>
								<div className="grid grid-cols-4 gap-4">
									<div className="text-center">
										<p className="text-2xl font-bold text-blue-600">{selectedMedia.usage?.viewCount || 0}</p>
										<p className="text-sm text-gray-500">Views</p>
									</div>
									<div className="text-center">
										<p className="text-2xl font-bold text-green-600">{selectedMedia.usage?.downloadCount || 0}</p>
										<p className="text-sm text-gray-500">Downloads</p>
									</div>
									<div className="text-center">
										<p className="text-2xl font-bold text-purple-600">{selectedMedia.usage?.shareCount || 0}</p>
										<p className="text-sm text-gray-500">Shares</p>
									</div>
									<div className="text-center">
										<p className="text-2xl font-bold text-red-600">{selectedMedia.usage?.reportCount || 0}</p>
										<p className="text-sm text-gray-500">Reports</p>
									</div>
								</div>
							</div>

							{/* Content Analysis */}
							{selectedMedia.contentAnalysis && (
								<div>
									<h4 className="text-lg font-medium text-gray-900 mb-3">Content Analysis</h4>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="text-sm font-medium text-gray-500">AI Moderated</label>
											<p className="text-sm text-gray-900">
												{selectedMedia.contentAnalysis.aiModerated ? 'Yes' : 'No'}
											</p>
										</div>
										<div>
											<label className="text-sm font-medium text-gray-500">AI Flags</label>
											<p className="text-sm text-gray-900">
												{selectedMedia.contentAnalysis.aiFlags?.length > 0
													? selectedMedia.contentAnalysis.aiFlags.join(', ')
													: 'None'}
											</p>
										</div>
										<div>
											<label className="text-sm font-medium text-gray-500">Objects Detected</label>
											<p className="text-sm text-gray-900">
												{selectedMedia.contentAnalysis.objects?.length > 0
													? selectedMedia.contentAnalysis.objects.join(', ')
													: 'None detected'}
											</p>
										</div>
										<div>
											<label className="text-sm font-medium text-gray-500">Faces Detected</label>
											<p className="text-sm text-gray-900">
												{selectedMedia.contentAnalysis.faces || 0} face(s)
											</p>
										</div>
									</div>
								</div>
							)}

							{/* Actions */}
							<div className="flex justify-end space-x-2 pt-4 border-t">
								<Button
									variant="outline"
									onClick={() => window.open(selectedMedia.url, '_blank')}
								>
									<Download className="w-4 h-4 mr-2" />
									Download
								</Button>
								{selectedMedia.moderationStatus === 'pending' && (
									<>
										<Button
											className="bg-green-600 hover:bg-green-700"
											onClick={() => {
												handleApproveMedia(selectedMedia._id);
												setShowMediaModal(false);
											}}
										>
											<CheckCircle className="w-4 h-4 mr-2" />
											Approve
										</Button>
										<Button
											variant="destructive"
											onClick={() => {
												handleRejectMedia(selectedMedia._id);
												setShowMediaModal(false);
											}}
										>
											<XCircle className="w-4 h-4 mr-2" />
											Reject
										</Button>
									</>
								)}
								<Button
									variant="destructive"
									onClick={() => {
										handleDeleteMedia(selectedMedia._id);
										setShowMediaModal(false);
									}}
								>
									<Trash2 className="w-4 h-4 mr-2" />
									Delete
								</Button>
							</div>
						</div>
					)}
				</Modal>
			</div>
		</Layout>
	);
}
