import React, { useState } from 'react';
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
	Video
} from 'lucide-react';

const mockReports = [
	{
		id: 1,
		reporter: "Sarah Johnson",
		reportedUser: "Michael Chen",
		reportType: "Harassment",
		description: "Received inappropriate messages and unsolicited explicit content",
		status: "pending",
		reportedTime: "2 hours ago",
		responseTime: "3.2h",
		severity: "high",
		contentType: "message",
		evidence: ["message1.png", "message2.png"]
	},
	{
		id: 2,
		reporter: "David Wilson",
		reportedUser: "Emma Rodriguez",
		reportType: "Inappropriate Content",
		description: "Profile contains explicit images in public gallery",
		status: "under_review",
		reportedTime: "5 hours ago",
		responseTime: "2.4h",
		severity: "medium",
		contentType: "image",
		evidence: ["profile1.jpg", "profile2.jpg", "profile3.jpg"]
	},
	{
		id: 3,
		reporter: "System Auto-ban",
		reportedUser: "user123",
		reportType: "Spam message",
		description: "Multiple users reported spam messages",
		status: "resolved",
		reportedTime: "2 hours ago",
		responseTime: "3.2h",
		severity: "low",
		contentType: "message",
		evidence: []
	}
];

const statsCards = [
	{
		title: "Total Reports",
		value: "142",
		change: "↓ 12 new today",
		color: "blue"
	},
	{
		title: "Pending Review",
		value: "24",
		change: "↓ 8% from yesterday",
		color: "yellow"
	},
	{
		title: "Resolved Today",
		value: "18",
		change: "Requires attention",
		color: "green"
	},
	{
		title: "Avg Response Time",
		value: "3.2h",
		change: "↑ 23 new today",
		color: "purple"
	}
];

export default function ReportedContent() {
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');

	const getStatusBadge = (status) => {
		switch (status.toLowerCase()) {
			case 'pending': return <Badge variant="warning"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
			case 'under_review': return <Badge variant="default"><Eye className="w-3 h-3 mr-1" />Under Review</Badge>;
			case 'resolved': return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" />Resolved</Badge>;
			default: return <Badge variant="secondary">{status}</Badge>;
		}
	};

	const getSeverityBadge = (severity) => {
		switch (severity.toLowerCase()) {
			case 'high': return <Badge variant="destructive">High</Badge>;
			case 'medium': return <Badge variant="warning">Medium</Badge>;
			case 'low': return <Badge variant="secondary">Low</Badge>;
			default: return <Badge variant="secondary">{severity}</Badge>;
		}
	};

	const getContentIcon = (type) => {
		switch (type) {
			case 'image': return <Image className="w-4 h-4" aria-hidden="true" />;
			case 'video': return <Video className="w-4 h-4" aria-hidden="true" />;
			case 'message': return <MessageSquare className="w-4 h-4" aria-hidden="true" />;
			default: return <MessageSquare className="w-4 h-4" aria-hidden="true" />;
		}
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
					{statsCards.map((stat, index) => (
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
				<div className="space-y-4">
					{mockReports.map((report) => (
						<Card key={report.id}>
							<CardContent className="p-6">
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="flex items-center space-x-4 mb-3">
											<div className="flex items-center space-x-2">
												{getContentIcon(report.contentType)}
												<h3 className="font-semibold">{report.reportType}</h3>
											</div>
											{getStatusBadge(report.status)}
											{getSeverityBadge(report.severity)}
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
											<div>
												<p className="text-sm text-gray-600 mb-2">
													<strong>Reported by:</strong> {report.reporter}
												</p>
												<p className="text-sm text-gray-600 mb-2">
													<strong>Reported user:</strong> {report.reportedUser}
												</p>
												<p className="text-sm text-gray-600">
													<strong>Reported:</strong> {report.reportedTime}
												</p>
											</div>

											<div>
												<p className="text-sm text-gray-600 mb-2">
													<strong>Response time:</strong> {report.responseTime}
												</p>
												<p className="text-sm text-gray-600">
													<strong>Evidence:</strong> {report.evidence.length} items
												</p>
											</div>
										</div>

										<div className="mb-4">
											<p className="text-sm text-gray-600 mb-2">
												<strong>Description:</strong>
											</p>
											<p className="text-sm bg-gray-50 p-3 rounded">
												{report.description}
											</p>
										</div>

										{report.evidence.length > 0 && (
											<div className="mb-4">
												<p className="text-sm text-gray-600 mb-2">
													<strong>Evidence:</strong>
												</p>
												<div className="flex space-x-2">
													{report.evidence.slice(0, 7).map((evidence, index) => (
														<div key={index} className="w-16 h-16 bg-gray-200 rounded border flex items-center justify-center">
															{evidence.includes('.jpg') || evidence.includes('.png') ?
																<Image className="w-6 h-6 text-gray-500" aria-hidden="true" /> :
																<Video className="w-6 h-6 text-gray-500" aria-hidden="true" />
															}
														</div>
													))}
													{report.evidence.length > 7 && (
														<div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
															<span className="text-xs text-gray-500">+{report.evidence.length - 7}</span>
														</div>
													)}
												</div>
											</div>
										)}
									</div>

									<div className="flex flex-col space-y-2 ml-4">
										<Button size="sm" className="bg-red-600 hover:bg-red-700">
											<Ban className="w-4 h-4 mr-2" />
											Ban User
										</Button>
										<Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
											<AlertTriangle className="w-4 h-4 mr-2" />
											Warn User
										</Button>
										<Button size="sm" className="bg-green-600 hover:bg-green-700">
											<CheckCircle className="w-4 h-4 mr-2" />
											Dismiss Report
										</Button>
									</div>
								</div>

								<div className="mt-4 pt-4 border-t">
									<div className="flex justify-between items-center">
										<div className="text-sm text-gray-500">
											Action Reason (if applicable)
										</div>
										<Button variant="link" size="sm">
											View full conversation
										</Button>
									</div>
									<select className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
										<option value="">Select Reason</option>
										<option value="harassment">Harassment</option>
										<option value="inappropriate">Inappropriate Content</option>
										<option value="spam">Spam</option>
										<option value="fake">Fake Profile</option>
										<option value="other">Other</option>
									</select>
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Pagination */}
				<div className="flex items-center justify-center space-x-2">
					<Button variant="outline" size="sm" disabled>
						Previous
					</Button>
					<Button variant="outline" size="sm" className="bg-blue-600 text-white">
						1
					</Button>
					<Button variant="outline" size="sm">
						2
					</Button>
					<Button variant="outline" size="sm">
						3
					</Button>
					<Button variant="outline" size="sm">
						...
					</Button>
					<Button variant="outline" size="sm">
						8
					</Button>
					<Button variant="outline" size="sm">
						Next
					</Button>
				</div>
			</div>
		</Layout>
	);
}
