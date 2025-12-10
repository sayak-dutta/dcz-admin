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
	Calendar,
	Clock,
	Loader2,
	User,
	MapPin,
	Info,
	Tag,
	Hash
} from 'lucide-react';
import { useAdminSpeedDates } from '@/hooks/useAdminSpeedDates';
import { Modal } from '@/components/ui/modal';

export default function SpeedDatePage() {
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedSpeedDate, setSelectedSpeedDate] = useState(null);
	const [showSpeedDateModal, setShowSpeedDateModal] = useState(false);
	const [speedDateDetails, setSpeedDateDetails] = useState(null);
	const [loadingDetails, setLoadingDetails] = useState(false);

	const {
		speedDates,
		loading,
		error,
		pagination,
		fetchSpeedDates,
		getSpeedDateDetails
	} = useAdminSpeedDates();

	// Fetch speed dates on component mount and when filters/page change
	useEffect(() => {
		const delay = searchTerm ? 500 : 0; // Debounce search

		const timeoutId = setTimeout(() => {
			fetchSpeedDates({
				page: currentPage,
				limit: 20,
				search: searchTerm || undefined,
				status: statusFilter !== 'all' ? statusFilter : undefined,
			});
		}, delay);

		return () => clearTimeout(timeoutId);
	}, [searchTerm, statusFilter, currentPage, fetchSpeedDates]);

	const handleViewSpeedDateDetails = async (speedDate) => {
		setSelectedSpeedDate(speedDate);
		setShowSpeedDateModal(true);
		setLoadingDetails(true);

		try {
			const detailsResponse = await getSpeedDateDetails(speedDate._id);
			setSpeedDateDetails(detailsResponse.data || detailsResponse);
		} catch (error) {
			console.error('Failed to fetch speed date details:', error);
		} finally {
			setLoadingDetails(false);
		}
	};

	const getStatusBadge = (status) => {
		switch (status?.toLowerCase()) {
			case 'active': return <Badge variant="success">Active</Badge>;
			case 'completed': return <Badge variant="secondary">Completed</Badge>;
			case 'cancelled': return <Badge variant="destructive">Cancelled</Badge>;
			case 'scheduled': return <Badge variant="warning">Scheduled</Badge>;
			default: return <Badge variant="outline">{status}</Badge>;
		}
	};

	const getTypeBadge = (type) => {
		switch (type?.toLowerCase()) {
			case 'virtual': return <Badge variant="default">Virtual</Badge>;
			case 'in-person': return <Badge variant="secondary">In-Person</Badge>;
			default: return <Badge variant="outline">{type}</Badge>;
		}
	};

	const getStatsCards = () => {
		const totalSpeedDates = pagination.totalSpeedDates || 0;
		const activeSpeedDates = speedDates.filter(sd => sd.status === 'active').length;
		const completedSpeedDates = speedDates.filter(sd => sd.status === 'completed').length;
		const totalParticipants = speedDates.reduce((sum, sd) => sum + (sd.participants?.length || 0), 0);

		return [
			{
				title: "Total Speed Dates",
				value: totalSpeedDates.toString(),
				change: "All speed dates",
				icon: Calendar,
				color: "blue"
			},
			{
				title: "Active Speed Dates",
				value: activeSpeedDates.toString(),
				change: "Currently running",
				icon: Clock,
				color: "green"
			},
			{
				title: "Completed Speed Dates",
				value: completedSpeedDates.toString(),
				change: "Successfully completed",
				icon: Users,
				color: "purple"
			},
			{
				title: "Total Participants",
				value: totalParticipants.toString(),
				change: "Across all events",
				icon: User,
				color: "orange"
			}
		];
	};

	return (
		<Layout title="Speed Dates">
			<div className="space-y-6">
				{/* Header */}
				<p className="text-muted-foreground">
					Manage speed dating events and monitor participation
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
									placeholder="Search speed dates..."
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
									<option value="active">Active</option>
									<option value="completed">Completed</option>
									<option value="cancelled">Cancelled</option>
									<option value="scheduled">Scheduled</option>
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
								Loading speed dates...
							</div>
						) : error ? (
							<div className="text-center p-8 text-red-600">
								Error: {error}
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Event</TableHead>
										<TableHead>Type</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Participants</TableHead>
										<TableHead>Creator</TableHead>
										<TableHead>Scheduled</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{speedDates.length > 0 ? speedDates.map((speedDate) => (
										<TableRow key={speedDate._id}>
											<TableCell>
												<div>
													<p className="font-medium text-sm">{speedDate.title || speedDate.details || 'Speed Date Event'}</p>
													<p className="text-xs text-gray-500 line-clamp-1">
														{speedDate.details || speedDate.description || 'No description'}
													</p>
												</div>
											</TableCell>
											<TableCell>
												{getTypeBadge(speedDate.type)}
											</TableCell>
											<TableCell>
												{getStatusBadge(speedDate.status)}
											</TableCell>
											<TableCell className="text-sm">
												{speedDate.participants?.length || 0} / {speedDate.maxParticipants || '∞'}
											</TableCell>
											<TableCell className="text-sm">
												{typeof speedDate.creator === 'object' && speedDate.creator?.profile?.firstName && speedDate.creator?.profile?.lastName
													? `${speedDate.creator.profile.firstName} ${speedDate.creator.profile.lastName}`
													: typeof speedDate.creator === 'object' 
														? speedDate.creator?.username || 'Unknown'
														: speedDate.creator || 'Unknown'}
											</TableCell>
											<TableCell className="text-sm">
												{speedDate.startDate 
													? new Date(speedDate.startDate).toLocaleDateString() 
													: speedDate.scheduledAt 
														? new Date(speedDate.scheduledAt).toLocaleDateString() 
														: 'TBD'}
											</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end space-x-2">
													<Button
														size="sm"
														variant="ghost"
														onClick={() => handleViewSpeedDateDetails(speedDate)}
														title="View speed date details"
													>
														<Eye className="w-4 h-4" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									)) : (
										<TableRow>
											<TableCell colSpan={7} className="text-center py-8 text-gray-500">
												<Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
												<p>No speed dates found</p>
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>

				{/* Pagination */}
				{!loading && speedDates.length > 0 && (
					<div className="flex items-center justify-between">
						<p className="text-sm text-muted-foreground">
							Showing {((pagination.currentPage - 1) * 20) + 1} to {Math.min(pagination.currentPage * 20, pagination.totalSpeedDates)} of {pagination.totalSpeedDates} results
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

				{/* Speed Date Details Modal */}
				<Modal
					isOpen={showSpeedDateModal}
					onClose={() => {
						setShowSpeedDateModal(false);
						setSelectedSpeedDate(null);
						setSpeedDateDetails(null);
					}}
					title="Speed Date Details"
					size="xl"
				>
					{selectedSpeedDate && (
						<div className="space-y-6">
							{/* Speed Date Info */}
							<div className="border-b pb-4">
								<div className="flex items-start space-x-4">
									<div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
										<Calendar className="w-8 h-8 text-blue-600" />
									</div>
									<div className="flex-1">
										<h3 className="text-xl font-semibold">
											{selectedSpeedDate.title || selectedSpeedDate.details || 'Speed Date Event'}
										</h3>
										<p className="text-gray-600 mb-2">
											{selectedSpeedDate.details || selectedSpeedDate.description || 'No description'}
										</p>
										<div className="flex flex-wrap gap-2">
											{getTypeBadge(selectedSpeedDate.type)}
											{getStatusBadge(selectedSpeedDate.status)}
										</div>
									</div>
								</div>

								<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
									<div className="text-center">
										<p className="text-2xl font-bold text-blue-600">{selectedSpeedDate.participants?.length || 0}</p>
										<p className="text-sm text-gray-500">Participants</p>
									</div>
									<div className="text-center">
										<p className="text-2xl font-bold text-green-600">{selectedSpeedDate.maxParticipants || '∞'}</p>
										<p className="text-sm text-gray-500">Max Capacity</p>
									</div>
									<div className="text-center">
										<p className="text-2xl font-bold text-purple-600">
											{selectedSpeedDate.startDate 
												? new Date(selectedSpeedDate.startDate).toLocaleDateString() 
												: selectedSpeedDate.scheduledAt 
													? new Date(selectedSpeedDate.scheduledAt).toLocaleDateString() 
													: 'TBD'}
										</p>
										<p className="text-sm text-gray-500">Start Date</p>
									</div>
									<div className="text-center">
										<p className="text-2xl font-bold text-orange-600">
											{selectedSpeedDate.endDate 
												? new Date(selectedSpeedDate.endDate).toLocaleDateString() 
												: 'N/A'}
										</p>
										<p className="text-sm text-gray-500">End Date</p>
									</div>
								</div>
							</div>

							{/* Additional Details */}
							{loadingDetails ? (
								<div className="flex items-center justify-center p-8">
									<Loader2 className="w-6 h-6 animate-spin mr-2" />
									Loading details...
								</div>
							) : speedDateDetails ? (
								<div className="space-y-6">
									{/* Basic Information */}
									<div>
										<h4 className="text-lg font-semibold mb-4 flex items-center">
											<Info className="w-5 h-5 mr-2" />
											Basic Information
										</h4>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<p className="text-sm text-gray-600 mb-1">Event ID</p>
												<p className="font-medium text-sm break-all">{speedDateDetails._id || selectedSpeedDate._id}</p>
											</div>
											<div>
												<p className="text-sm text-gray-600 mb-1">Type</p>
												<p className="font-medium">{getTypeBadge(speedDateDetails.type || selectedSpeedDate.type)}</p>
											</div>
											<div>
												<p className="text-sm text-gray-600 mb-1">Status</p>
												<p className="font-medium">{getStatusBadge(speedDateDetails.status || selectedSpeedDate.status)}</p>
											</div>
											<div>
												<p className="text-sm text-gray-600 mb-1">Created At</p>
												<p className="font-medium">
													{(speedDateDetails.createdAt || selectedSpeedDate.createdAt) ? 
														new Date(speedDateDetails.createdAt || selectedSpeedDate.createdAt).toLocaleString() : 
														'N/A'}
												</p>
											</div>
										</div>
									</div>

									{/* Date & Time Information */}
									<div>
										<h4 className="text-lg font-semibold mb-4 flex items-center">
											<Calendar className="w-5 h-5 mr-2" />
											Date & Time
										</h4>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<p className="text-sm text-gray-600 mb-1">Start Date</p>
												<p className="font-medium">
													{(speedDateDetails.startDate || selectedSpeedDate.startDate) ? 
														new Date(speedDateDetails.startDate || selectedSpeedDate.startDate).toLocaleString() : 
														'N/A'}
												</p>
											</div>
											<div>
												<p className="text-sm text-gray-600 mb-1">End Date</p>
												<p className="font-medium">
													{(speedDateDetails.endDate || selectedSpeedDate.endDate) ? 
														new Date(speedDateDetails.endDate || selectedSpeedDate.endDate).toLocaleString() : 
														'N/A'}
												</p>
											</div>
										</div>
									</div>

									{/* Location Information */}
									<div>
										<h4 className="text-lg font-semibold mb-4 flex items-center">
											<MapPin className="w-5 h-5 mr-2" />
											Location
										</h4>
										<div className="bg-gray-50 rounded-lg p-4">
											{speedDateDetails.location || selectedSpeedDate.location ? (
												typeof (speedDateDetails.location || selectedSpeedDate.location) === 'object' ? (
													<div className="space-y-2">
														{Object.entries(speedDateDetails.location || selectedSpeedDate.location).map(([key, value]) => (
															<div key={key} className="flex justify-between">
																<span className="text-sm text-gray-600 capitalize">{key}:</span>
																<span className="text-sm font-medium">{String(value)}</span>
															</div>
														))}
													</div>
												) : (
													<p className="font-medium">{speedDateDetails.location || selectedSpeedDate.location}</p>
												)
											) : (
												<p className="text-gray-500">No location specified</p>
											)}
										</div>
									</div>

									{/* Preferences */}
									<div>
										<h4 className="text-lg font-semibold mb-4 flex items-center">
											<Tag className="w-5 h-5 mr-2" />
											Preferred With
										</h4>
										<div className="flex flex-wrap gap-2">
											{(speedDateDetails.preferredWith || selectedSpeedDate.preferredWith || []).length > 0 ? (
												(speedDateDetails.preferredWith || selectedSpeedDate.preferredWith).map((pref, index) => (
													<Badge key={index} variant="outline">{pref}</Badge>
												))
											) : (
												<p className="text-gray-500">No preferences specified</p>
											)}
										</div>
									</div>

									{/* Details/Description */}
									<div>
										<h4 className="text-lg font-semibold mb-4 flex items-center">
											<Info className="w-5 h-5 mr-2" />
											Details
										</h4>
										<div className="bg-gray-50 rounded-lg p-4">
											<p className="text-sm text-gray-700 whitespace-pre-wrap">
												{speedDateDetails.details || selectedSpeedDate.details || speedDateDetails.description || selectedSpeedDate.description || 'No details provided'}
											</p>
										</div>
									</div>

									{/* Creator Information */}
									<div>
										<h4 className="text-lg font-semibold mb-4 flex items-center">
											<User className="w-5 h-5 mr-2" />
											Creator Information
										</h4>
										<div className="bg-gray-50 rounded-lg p-4">
											{speedDateDetails.creator || selectedSpeedDate.creator ? (
												<div className="space-y-2">
													<div className="flex justify-between">
														<span className="text-sm text-gray-600">Creator ID:</span>
														<span className="text-sm font-medium break-all">
															{typeof (speedDateDetails.creator || selectedSpeedDate.creator) === 'object' 
																? (speedDateDetails.creator?._id || selectedSpeedDate.creator?._id || speedDateDetails.creator || selectedSpeedDate.creator)
																: (speedDateDetails.creator || selectedSpeedDate.creator)}
														</span>
													</div>
													{typeof (speedDateDetails.creator || selectedSpeedDate.creator) === 'object' && (
														<>
															<div className="flex justify-between">
																<span className="text-sm text-gray-600">Username:</span>
																<span className="text-sm font-medium">
																	{(speedDateDetails.creator || selectedSpeedDate.creator)?.username || 'N/A'}
																</span>
															</div>
															<div className="flex justify-between">
																<span className="text-sm text-gray-600">Email:</span>
																<span className="text-sm font-medium">
																	{(speedDateDetails.creator || selectedSpeedDate.creator)?.email || 'N/A'}
																</span>
															</div>
															{(speedDateDetails.creator || selectedSpeedDate.creator)?.profile && (
																<div className="flex justify-between">
																	<span className="text-sm text-gray-600">Name:</span>
																	<span className="text-sm font-medium">
																		{(speedDateDetails.creator || selectedSpeedDate.creator)?.profile?.firstName && 
																		 (speedDateDetails.creator || selectedSpeedDate.creator)?.profile?.lastName
																			? `${(speedDateDetails.creator || selectedSpeedDate.creator).profile.firstName} ${(speedDateDetails.creator || selectedSpeedDate.creator).profile.lastName}`
																			: 'N/A'}
																	</span>
																</div>
															)}
														</>
													)}
												</div>
											) : (
												<p className="text-gray-500">Creator information not available</p>
											)}
										</div>
									</div>

									{/* Additional Metadata */}
									<div>
										<h4 className="text-lg font-semibold mb-4 flex items-center">
											<Hash className="w-5 h-5 mr-2" />
											Additional Metadata
										</h4>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<p className="text-sm text-gray-600 mb-1">Version</p>
												<p className="font-medium">{speedDateDetails.__v !== undefined ? speedDateDetails.__v : (selectedSpeedDate.__v !== undefined ? selectedSpeedDate.__v : 'N/A')}</p>
											</div>
											<div>
												<p className="text-sm text-gray-600 mb-1">Participants</p>
												<p className="font-medium">
													{(speedDateDetails.participants || selectedSpeedDate.participants)?.length || 0} 
													{(speedDateDetails.maxParticipants || selectedSpeedDate.maxParticipants) 
														? ` / ${speedDateDetails.maxParticipants || selectedSpeedDate.maxParticipants}` 
														: ''}
												</p>
											</div>
										</div>
									</div>
								</div>
							) : (
								<div className="text-center py-8 text-gray-500">
									<p>Unable to load detailed information</p>
								</div>
							)}
						</div>
					)}
				</Modal>
			</div>
		</Layout>
	);
}