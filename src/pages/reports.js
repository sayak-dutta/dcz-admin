import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
	Search,
	Filter,
	Ban,
	AlertTriangle,
	MessageSquare,
	Eye,
	CheckCircle,
	Clock,
	Image,
	Video,
	Loader2
} from 'lucide-react';
import { useAdminReports } from '@/hooks/useAdminReports';
import { Modal } from '@/components/ui/modal';

export default function ReportedContent() {
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [selectedReport, setSelectedReport] = useState(null);
	const [showReportModal, setShowReportModal] = useState(false);
	const [actionReason, setActionReason] = useState('');

	const {
		reports,
		loading,
		error,
		fetchReports,
		processReport
	} = useAdminReports();

	// Fetch reports on component mount
	useEffect(() => {
		fetchReports();
	}, []);

	const handleProcessReport = async (reportId, action, reason = '') => {
		const result = await processReport(reportId, {
			action,
			reason,
			resolution: reason || `Report ${action}ed by admin`
		});
		if (result.success) {
			// Refresh the reports list
			fetchReports();
			setShowReportModal(false);
			setSelectedReport(null);
			setActionReason('');
		}
	};

	const getStatusBadge = (status) => {
		// Since the API doesn't provide status, we'll assume all are pending for now
		return <Badge variant="warning"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>;
	};

	const getSeverityBadge = (reportTags) => {
		// Determine severity based on report tags
		if (reportTags?.includes('Harassment or Stalking')) {
			return <Badge variant="destructive">High</Badge>;
		} else if (reportTags?.includes('Spam / Scam')) {
			return <Badge variant="warning">Medium</Badge>;
		}
		return <Badge variant="secondary">Medium</Badge>;
	};

	const formatReportTime = (timestamp) => {
		if (!timestamp) return 'Unknown';
		const date = new Date(timestamp);
		const now = new Date();
		const diffMs = now - date;
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;
		return date.toLocaleDateString();
	};

	const getStatsCards = () => {
		return [
			{
				title: "Total Reports",
				value: reports.length.toString(),
				change: "All reported content",
				color: "blue"
			},
			{
				title: "Pending Review",
				value: reports.length.toString(),
				change: "Requires attention",
				color: "yellow"
			},
			{
				title: "High Priority",
				value: reports.filter(r => r.reportTags?.includes('Harassment or Stalking')).length.toString(),
				change: "Urgent cases",
				color: "red"
			},
			{
				title: "Spam Reports",
				value: reports.filter(r => r.reportTags?.includes('Spam / Scam')).length.toString(),
				change: "Spam/scam content",
				color: "purple"
			}
		];
	};

	return (
		<Layout title="Reported Content">
			<div className="space-y-6">
				{/* Header */}
				<p className="text-muted-foreground">
					Review and take action on reported content
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
									placeholder="Search reports..."
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
									<option value="pending">Pending</option>
									<option value="under_review">Under Review</option>
									<option value="resolved">Resolved</option>
								</select>

								<Button variant="outline" size="sm">
									<Filter className="w-4 h-4 mr-2" />
									Filters
								</Button>
							</div>
						</div>
					</CardHeader>
				</Card>

				{/* Reports List */}
				{loading ? (
					<div className="flex items-center justify-center p-8">
						<Loader2 className="w-6 h-6 animate-spin mr-2" />
						Loading reports...
					</div>
				) : error ? (
					<div className="text-center p-8 text-red-600">
						Error: {error}
					</div>
				) : (
					<div className="space-y-4">
						{reports.length > 0 ? reports.map((report) => (
							<Card key={report._id}>
								<CardContent className="p-6">
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<div className="flex items-center space-x-4 mb-3">
												<div className="flex items-center space-x-2">
													<MessageSquare className="w-4 h-4" />
													<h3 className="font-semibold">
														{report.reportTags?.join(', ') || 'Report'}
													</h3>
												</div>
												{getStatusBadge('pending')}
												{getSeverityBadge(report.reportTags)}
											</div>

											<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
												<div>
													<p className="text-sm text-gray-600 mb-2">
														<strong>Reported by:</strong> {report.userId?.username || 'Unknown'}
														{report.userId?.profile?.firstName && report.userId?.profile?.lastName &&
															` (${report.userId.profile.firstName} ${report.userId.profile.lastName})`}
													</p>
													<p className="text-sm text-gray-600 mb-2">
														<strong>Reported user:</strong> {report.targetUserId?.username || 'Unknown'}
														{report.targetUserId?.profile?.firstName && report.targetUserId?.profile?.lastName &&
															` (${report.targetUserId.profile.firstName} ${report.targetUserId.profile.lastName})`}
													</p>
													<p className="text-sm text-gray-600">
														<strong>Reported:</strong> {formatReportTime(report.timestamp)}
													</p>
												</div>

												<div>
													<p className="text-sm text-gray-600 mb-2">
														<strong>Report Type:</strong> {report.interactionType}
													</p>
													<p className="text-sm text-gray-600">
														<strong>Match Status:</strong> {report.isMatch ? 'Match' : 'No Match'}
													</p>
												</div>
											</div>

											{report.reportTags && report.reportTags.length > 0 && (
												<div className="mb-4">
													<p className="text-sm text-gray-600 mb-2">
														<strong>Report Tags:</strong>
													</p>
													<div className="flex flex-wrap gap-2">
														{report.reportTags.map((tag, index) => (
															<Badge key={index} variant="outline">
																{tag}
															</Badge>
														))}
													</div>
												</div>
											)}
										</div>

										<div className="flex flex-col space-y-2 ml-4">
											<Button
												size="sm"
												className="bg-red-600 hover:bg-red-700"
												onClick={() => {
													setSelectedReport(report);
													setShowReportModal(true);
												}}
											>
												<Ban className="w-4 h-4 mr-2" />
												Take Action
											</Button>
											<Button size="sm" variant="outline">
												<Eye className="w-4 h-4 mr-2" />
												View Details
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						)) : (
							<div className="text-center py-8 text-gray-500">
								<AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
								<p>No reports found</p>
							</div>
						)}
					</div>
				)}

				{/* Report Action Modal */}
				<Modal
					isOpen={showReportModal}
					onClose={() => {
						setShowReportModal(false);
						setSelectedReport(null);
						setActionReason('');
					}}
					title="Take Action on Report"
				>
					{selectedReport && (
						<div className="space-y-4">
							<div className="p-4 bg-gray-50 rounded-lg">
								<h4 className="font-medium mb-2">Report Details</h4>
								<p className="text-sm text-gray-600 mb-2">
									<strong>Reporter:</strong> {selectedReport.userId?.username || 'Unknown'}
								</p>
								<p className="text-sm text-gray-600 mb-2">
									<strong>Reported User:</strong> {selectedReport.targetUserId?.username || 'Unknown'}
								</p>
								<p className="text-sm text-gray-600">
									<strong>Tags:</strong> {selectedReport.reportTags?.join(', ') || 'None'}
								</p>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Action Reason (Optional)
								</label>
								<textarea
									className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
									rows={3}
									placeholder="Enter reason for the action taken..."
									value={actionReason}
									onChange={(e) => setActionReason(e.target.value)}
								/>
							</div>

							<div className="flex justify-end space-x-2 pt-4 border-t">
								<Button
									variant="outline"
									onClick={() => {
										setShowReportModal(false);
										setSelectedReport(null);
										setActionReason('');
									}}
								>
									Cancel
								</Button>
								<Button
									className="bg-yellow-600 hover:bg-yellow-700"
									onClick={() => handleProcessReport(selectedReport._id, 'warn', actionReason)}
								>
									<AlertTriangle className="w-4 h-4 mr-2" />
									Warn User
								</Button>
								<Button
									className="bg-red-600 hover:bg-red-700"
									onClick={() => handleProcessReport(selectedReport._id, 'ban', actionReason)}
								>
									<Ban className="w-4 h-4 mr-2" />
									Ban User
								</Button>
								<Button
									className="bg-green-600 hover:bg-green-700"
									onClick={() => handleProcessReport(selectedReport._id, 'none', actionReason)}
								>
									<CheckCircle className="w-4 h-4 mr-2" />
									Dismiss Report
								</Button>
							</div>
						</div>
					)}
				</Modal>
			</div>
		</Layout>
	);
}
