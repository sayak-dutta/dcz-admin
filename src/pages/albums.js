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
	Image,
	Eye,
	AlertTriangle,
	Ban,
	Filter
} from 'lucide-react';
import { useAdminAlbums } from '@/hooks/useAdminAlbums';
import { StatusBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';

export default function AlbumsModeration() {
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedAlbum, setSelectedAlbum] = useState(null);
	const [showDetailsModal, setShowDetailsModal] = useState(false);

	const {
		albums,
		loading,
		error,
		fetchAlbums,
		getAlbumDetails,
		moderateAlbum,
		deleteAlbum
	} = useAdminAlbums();

	const handleViewDetails = async (album) => {
		setSelectedAlbum(album);
		setShowDetailsModal(true);

		// Fetch detailed information
		if (album.id) {
			const details = await getAlbumDetails(album.id);
			if (details) {
				setSelectedAlbum(details);
			}
		}
	};

	const handleModerateAlbum = async (albumId, action) => {
		const moderationData = {
			action: action,
			reason: action === 'hide' ? 'Content violation' : 'Approved'
		};

		const result = await moderateAlbum(albumId, moderationData);
		if (result.success) {
			await fetchAlbums();
			setShowDetailsModal(false);
		}
	};

	const handleDeleteAlbum = async (albumId) => {
		const result = await deleteAlbum(albumId);
		if (result.success) {
			await fetchAlbums();
			setShowDetailsModal(false);
		}
	};

	return (
		<Layout title="Album Moderation">
			<div className="space-y-6">
				{/* Header */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div>
						<h1 className="text-2xl font-bold">Album Moderation</h1>
						<p className="text-muted-foreground">
							Review and moderate user-created albums
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
									placeholder="Search albums..."
									className="pl-10"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</div>

							<div className="flex gap-2">
								<select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
									<option value="all">All Status</option>
									<option value="pending">Pending Review</option>
									<option value="approved">Approved</option>
									<option value="hidden">Hidden</option>
									<option value="flagged">Flagged</option>
								</select>
							</div>
						</div>
					</CardHeader>

					<CardContent>
						{loading ? (
							<div className="flex items-center justify-center p-8">
								<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
								Loading albums...
							</div>
						) : error ? (
							<div className="text-center p-8 text-red-600">
								Error: {error}
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Album</TableHead>
										<TableHead>Creator</TableHead>
										<TableHead>Photos</TableHead>
										<TableHead>Created</TableHead>
										<TableHead>Status</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{albums && albums.length > 0 ? (
										albums.map((album) => (
											<TableRow key={album.id}>
												<TableCell>
													<div className="flex items-center space-x-3">
														<div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
															<Image className="w-5 h-5 text-gray-400" />
														</div>
														<div>
															<p className="font-medium text-sm">{album.name}</p>
															<p className="text-xs text-gray-500 line-clamp-1">
																{album.description}
															</p>
														</div>
													</div>
												</TableCell>
												<TableCell>
													<div>
														<p className="text-sm font-medium">{album.creator?.name}</p>
														<p className="text-xs text-gray-500">{album.creator?.username}</p>
													</div>
												</TableCell>
												<TableCell>
													<span className="text-sm">{album.photoCount || 0}</span>
												</TableCell>
												<TableCell className="text-sm">
													{album.createdAt ? new Date(album.createdAt).toLocaleDateString() : 'N/A'}
												</TableCell>
												<TableCell>
													<StatusBadge status={album.moderationStatus || 'pending'} />
												</TableCell>
												<TableCell className="text-right">
													<div className="flex items-center justify-end space-x-2">
														<Button
															size="sm"
															variant="ghost"
															onClick={() => handleViewDetails(album)}
														>
															<Eye className="w-4 h-4 mr-1" />
															View
														</Button>
														{album.moderationStatus === 'pending' && (
															<>
																<Button
																	size="sm"
																	variant="ghost"
																	className="text-green-600 hover:text-green-700"
																	onClick={() => handleModerateAlbum(album.id, 'approve')}
																>
																	Approve
																</Button>
																<Button
																	size="sm"
																	variant="ghost"
																	className="text-red-600 hover:text-red-700"
																	onClick={() => handleModerateAlbum(album.id, 'hide')}
																>
																	<AlertTriangle className="w-4 h-4 mr-1" />
																	Hide
																</Button>
															</>
														)}
														<Button
															size="sm"
															variant="ghost"
															onClick={() => handleDeleteAlbum(album.id)}
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
											<TableCell colSpan={6} className="text-center py-8 text-gray-500">
												No albums found
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>

				{/* Album Details Modal */}
				<Modal
					isOpen={showDetailsModal}
					onClose={() => {
						setShowDetailsModal(false);
						setSelectedAlbum(null);
					}}
					title="Album Details"
					size="lg"
				>
					{selectedAlbum && (
						<div className="space-y-6">
							{/* Album Info */}
							<div className="border-b pb-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-3">
										<div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
											<Image className="w-6 h-6 text-gray-400" />
										</div>
										<div>
											<h3 className="text-lg font-medium">{selectedAlbum.name}</h3>
											<p className="text-sm text-gray-600">{selectedAlbum.description}</p>
											<div className="flex items-center space-x-2 mt-1">
												<span className="text-sm text-gray-500">
													by {selectedAlbum.creator?.name}
												</span>
												<StatusBadge status={selectedAlbum.moderationStatus || 'pending'} />
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Stats */}
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								<div className="text-center">
									<div className="text-2xl font-bold text-blue-600">
										{selectedAlbum.photoCount || 0}
									</div>
									<div className="text-sm text-gray-500">Photos</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-green-600">
										{selectedAlbum.viewCount || 0}
									</div>
									<div className="text-sm text-gray-500">Views</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-purple-600">
										{selectedAlbum.likeCount || 0}
									</div>
									<div className="text-sm text-gray-500">Likes</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-orange-600">
										{selectedAlbum.reportCount || 0}
									</div>
									<div className="text-sm text-gray-500">Reports</div>
								</div>
							</div>

							{/* Photo Grid Preview */}
							<div>
								<h4 className="font-medium mb-3">Photos Preview</h4>
								<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
									{selectedAlbum.photos && selectedAlbum.photos.length > 0 ? (
										selectedAlbum.photos.slice(0, 6).map((photo, index) => (
											<div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
												<img
													src={photo.thumbnailUrl || photo.url}
													alt={`Photo ${index + 1}`}
													className="w-full h-full object-cover"
												/>
											</div>
										))
									) : (
										<div className="col-span-full flex items-center justify-center py-8 text-gray-500">
											<Image className="w-8 h-8 mr-2 opacity-50" />
											<span>No photos in this album</span>
										</div>
									)}
								</div>
								{selectedAlbum.photos && selectedAlbum.photos.length > 6 && (
									<p className="text-sm text-gray-500 mt-2">
										And {selectedAlbum.photos.length - 6} more photos...
									</p>
								)}
							</div>

							{/* Actions */}
							<div className="flex justify-end space-x-2 pt-4 border-t">
								<Button variant="outline">
									View All Photos
								</Button>
								{selectedAlbum.moderationStatus === 'pending' && (
									<>
										<Button
											variant="outline"
											onClick={() => handleModerateAlbum(selectedAlbum.id, 'hide')}
										>
											<AlertTriangle className="w-4 h-4 mr-2" />
											Hide Album
										</Button>
										<Button
											className="bg-green-600 hover:bg-green-700"
											onClick={() => handleModerateAlbum(selectedAlbum.id, 'approve')}
										>
											Approve Album
										</Button>
									</>
								)}
								<Button
									variant="destructive"
									onClick={() => handleDeleteAlbum(selectedAlbum.id)}
								>
									<Ban className="w-4 h-4 mr-2" />
									Delete Album
								</Button>
							</div>
						</div>
					)}
				</Modal>
			</div>
		</Layout>
	);
}
