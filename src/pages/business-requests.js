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
	Building,
	Eye,
	CheckCircle,
	XCircle,
	Filter
} from 'lucide-react';
import { useAdminBusinessRequests } from '@/hooks/useAdminBusinessRequests';
import { StatusBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';

export default function BusinessRequestsManagement() {
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedRequest, setSelectedRequest] = useState(null);
	const [showDetailsModal, setShowDetailsModal] = useState(false);

	const {
		businessRequests,
		loading,
		error,
		fetchBusinessRequests,
		approveBusinessRequest,
		rejectBusinessRequest
	} = useAdminBusinessRequests();

	const handleViewDetails = (request) => {
		setSelectedRequest(request);
		setShowDetailsModal(true);
	};

	const handleApprove = async (requestId) => {
		const result = await approveBusinessRequest(requestId);
		if (result.success) {
			await fetchBusinessRequests();
			setShowDetailsModal(false);
		}
	};

	const handleReject = async (requestId) => {
		const result = await rejectBusinessRequest(requestId, 'Request does not meet business criteria');
		if (result.success) {
			await fetchBusinessRequests();
			setShowDetailsModal(false);
		}
	};

	return (
		<Layout title="Business Profile Requests">
			<div className="space-y-6">
				{/* Header */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div>
						<h1 className="text-2xl font-bold">Business Profile Requests</h1>
						<p className="text-muted-foreground">
							Review and approve business profile applications
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
									placeholder="Search business requests..."
									className="pl-10"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</div>

							<div className="flex gap-2">
								<select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
									<option value="all">All Status</option>
									<option value="pending">Pending</option>
									<option value="approved">Approved</option>
									<option value="rejected">Rejected</option>
								</select>
							</div>
						</div>
					</CardHeader>

					<CardContent>
						{loading ? (
							<div className="flex items-center justify-center p-8">
								<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
								Loading business requests...
							</div>
						) : error ? (
							<div className="text-center p-8 text-red-600">
								Error: {error}
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Business</TableHead>
										<TableHead>Contact</TableHead>
										<TableHead>Goals</TableHead>
										<TableHead>Submitted</TableHead>
										<TableHead>Status</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{businessRequests && businessRequests.length > 0 ? (
										businessRequests.map((request) => (
											<TableRow key={request.id}>
												<TableCell>
													<div className="flex items-center space-x-3">
														<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
															<Building className="w-5 h-5 text-blue-600" />
														</div>
														<div>
															<p className="font-medium text-sm">{request.companyName}</p>
															<p className="text-xs text-gray-500">{request.webUrl}</p>
														</div>
													</div>
												</TableCell>
												<TableCell>
													<div>
														<p className="text-sm font-medium">
															{request.firstName} {request.lastName}
														</p>
														<p className="text-xs text-gray-500">{request.email}</p>
														<p className="text-xs text-gray-500">{request.phoneNumber}</p>
													</div>
												</TableCell>
												<TableCell>
													<div className="flex flex-wrap gap-1">
														{request.goals?.promoteEvents && (
															<Badge variant="outline" className="text-xs">Events</Badge>
														)}
														{request.goals?.buildAudience && (
															<Badge variant="outline" className="text-xs">Audience</Badge>
														)}
														{request.goals?.sellProduct && (
															<Badge variant="outline" className="text-xs">Sales</Badge>
														)}
														{request.goals?.paidAdvertising && (
															<Badge variant="outline" className="text-xs">Ads</Badge>
														)}
													</div>
												</TableCell>
												<TableCell className="text-sm">
													{request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}
												</TableCell>
												<TableCell>
													<StatusBadge status={request.status || 'pending'} />
												</TableCell>
												<TableCell className="text-right">
													<div className="flex items-center justify-end space-x-2">
														<Button
															size="sm"
															variant="ghost"
															onClick={() => handleViewDetails(request)}
														>
															<Eye className="w-4 h-4 mr-1" />
															View
														</Button>
														{request.status === 'pending' && (
															<>
																<Button
																	size="sm"
																	variant="ghost"
																	className="text-green-600 hover:text-green-700"
																	onClick={() => handleApprove(request.id)}
																>
																	<CheckCircle className="w-4 h-4 mr-1" />
																	Approve
																</Button>
																<Button
																	size="sm"
																	variant="ghost"
																	className="text-red-600 hover:text-red-700"
																	onClick={() => handleReject(request.id)}
																>
																	<XCircle className="w-4 h-4 mr-1" />
																	Reject
																</Button>
															</>
														)}
													</div>
												</TableCell>
											</TableRow>
										))
									) : (
										<TableRow>
											<TableCell colSpan={6} className="text-center py-8 text-gray-500">
												No business requests found
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>

				{/* Business Request Details Modal */}
				<Modal
					isOpen={showDetailsModal}
					onClose={() => {
						setShowDetailsModal(false);
						setSelectedRequest(null);
					}}
					title="Business Profile Request Details"
					size="lg"
				>
					{selectedRequest && (
						<div className="space-y-6">
							{/* Business Info */}
							<div className="border-b pb-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-3">
										<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
											<Building className="w-6 h-6 text-blue-600" />
										</div>
										<div>
											<h3 className="text-lg font-medium">{selectedRequest.companyName}</h3>
											<p className="text-sm text-gray-600">{selectedRequest.webUrl}</p>
											<div className="flex items-center space-x-2 mt-1">
												<StatusBadge status={selectedRequest.status || 'pending'} />
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Contact Information */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<h4 className="font-medium mb-3">Contact Information</h4>
									<div className="space-y-2">
										<p><span className="font-medium">Name:</span> {selectedRequest.firstName} {selectedRequest.lastName}</p>
										<p><span className="font-medium">Email:</span> {selectedRequest.email}</p>
										<p><span className="font-medium">Phone:</span> {selectedRequest.phoneNumber}</p>
										<p><span className="font-medium">Location:</span> {selectedRequest.location?.country}</p>
									</div>
								</div>

								<div>
									<h4 className="font-medium mb-3">Business Goals</h4>
									<div className="space-y-1">
										{selectedRequest.goals?.promoteEvents && (
											<div className="flex items-center space-x-2">
												<CheckCircle className="w-4 h-4 text-green-500" />
												<span className="text-sm">Promote Events</span>
											</div>
										)}
										{selectedRequest.goals?.buildAudience && (
											<div className="flex items-center space-x-2">
												<CheckCircle className="w-4 h-4 text-green-500" />
												<span className="text-sm">Build Audience</span>
											</div>
										)}
										{selectedRequest.goals?.sellProduct && (
											<div className="flex items-center space-x-2">
												<CheckCircle className="w-4 h-4 text-green-500" />
												<span className="text-sm">Sell Products</span>
											</div>
										)}
										{selectedRequest.goals?.paidAdvertising && (
											<div className="flex items-center space-x-2">
												<CheckCircle className="w-4 h-4 text-green-500" />
												<span className="text-sm">Paid Advertising</span>
											</div>
										)}
									</div>
								</div>
							</div>

							{/* Additional Information */}
							<div>
								<h4 className="font-medium mb-3">Additional Information</h4>
								<div className="bg-gray-50 p-4 rounded">
									<p className="text-sm text-gray-700">{selectedRequest.additionalInfo}</p>
									<p className="text-xs text-gray-500 mt-2">
										Referral Source: {selectedRequest.referralSource}
									</p>
								</div>
							</div>

							{/* Actions */}
							{selectedRequest.status === 'pending' && (
								<div className="flex justify-end space-x-2 pt-4 border-t">
									<Button
										variant="outline"
										onClick={() => handleReject(selectedRequest.id)}
									>
										<XCircle className="w-4 h-4 mr-2" />
										Reject
									</Button>
									<Button
										className="bg-green-600 hover:bg-green-700"
										onClick={() => handleApprove(selectedRequest.id)}
									>
										<CheckCircle className="w-4 h-4 mr-2" />
										Approve Business Profile
									</Button>
								</div>
							)}
						</div>
					)}
				</Modal>
			</div>
		</Layout>
	);
}
