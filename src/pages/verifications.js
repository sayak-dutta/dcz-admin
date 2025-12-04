import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
	Search,
	Filter,
	CheckCircle,
	XCircle,
	MessageSquare,
	Clock,
	Calendar,
	Eye,
	Play,
	Pause
} from 'lucide-react';

const mockVerifications = [
	{
		id: 1,
		name: "Sarah Johnson",
		email: "sarah.jo@example.com",
		status: "Pending",
		submittedTime: "15 min ago",
		joinedDate: "2023-06-05 14:32 UTC",
		location: "New York, USA",
		verificationVideo: "/api/placeholder/400/300",
		profilePhotos: ["/api/placeholder/100/100", "/api/placeholder/100/100"],
		notes: "I'm holding a paper with my username and today's date"
	},
	{
		id: 2,
		name: "Michael Chen",
		email: "michael.c@example.com",
		status: "Pending",
		submittedTime: "1 hour ago",
		joinedDate: "2023-06-05 13:45 UTC",
		location: "Toronto, Canada",
		verificationVideo: "/api/placeholder/400/300",
		profilePhotos: ["/api/placeholder/100/100"],
		notes: "Showing my face and holding ID card"
	}
];

const statsCards = [
	{
		title: "Pending Verifications",
		value: "24",
		change: "↓ 5 new today",
		color: "yellow"
	},
	{
		title: "Approved Today",
		value: "18",
		change: "↓ 8% from yesterday",
		color: "green"
	},
	{
		title: "Rejected Today",
		value: "6",
		change: "Requires attention",
		color: "red"
	},
	{
		title: "Avg Review Time",
		value: "2.4h",
		change: "↑ 23 new today",
		color: "blue"
	}
];

export default function ProfileVerifications() {
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('pending');

	const getStatusBadge = (status) => {
		switch (status.toLowerCase()) {
			case 'pending': return <Badge variant="warning"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
			case 'approved': return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
			case 'rejected': return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
			default: return <Badge variant="secondary">{status}</Badge>;
		}
	};

	return (
		<Layout title="Profile Verifications">
			<div className="space-y-6">
				{/* Header */}
				<p className="text-muted-foreground">
					Review and approve member verification requests
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
						<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
							<CardTitle>Pending Verification Requests</CardTitle>
							<p className="text-sm text-muted-foreground">Sorted by: Newest first</p>
						</div>
						<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
							<div className="relative flex-1 max-w-sm">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
								<Input
									placeholder="Search verifications..."
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
									<option value="pending">Pending</option>
									<option value="approved">Approved</option>
									<option value="rejected">Rejected</option>
									<option value="all">All Status</option>
								</select>

								<Button variant="outline" size="sm">
									<Filter className="w-4 h-4 mr-2" />
									Filters
								</Button>
							</div>
						</div>
					</CardHeader>
				</Card>

				{/* Verification Requests */}
				<div className="space-y-6">
					{mockVerifications.map((verification) => (
						<Card key={verification.id}>
							<CardContent className="p-6">
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
									{/* Left Side - Video and Photos */}
									<div>
										<h3 className="font-semibold text-lg mb-4">Verification Video</h3>
										<div className="bg-gray-900 rounded-lg p-4 relative mb-4">
											<div className="w-full h-64 bg-gray-800 rounded flex items-center justify-center relative">
												<div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded"></div>
												<Play className="w-16 h-16 text-white opacity-80" />
												<div className="absolute bottom-3 left-3">
													<span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
														{verification.name.toLowerCase().replace(' ', '_')}
													</span>
												</div>
												<div className="absolute bottom-3 right-3">
													<span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
														Joined: {verification.joinedDate}
													</span>
												</div>
											</div>
											<div className="flex items-center justify-between mt-2">
												<span className="text-white text-sm">
													<Calendar className="w-4 h-4 inline mr-1" />
													Recorded: {verification.joinedDate}
												</span>
											</div>
										</div>

										<h4 className="font-medium mb-2">Profile Comparison</h4>
										<div className="flex space-x-2">
											{verification.profilePhotos.map((photo, index) => (
												<div key={index} className="w-20 h-20 bg-gray-200 rounded border">
													<div className="w-full h-full bg-blue-100 rounded flex items-center justify-center">
														<span className="text-blue-600 text-xs">Photo</span>
													</div>
												</div>
											))}
											<div className="w-20 h-20 bg-gray-800 rounded border">
												<div className="w-full h-full bg-gray-700 rounded flex items-center justify-center">
													<span className="text-white text-xs">Video</span>
												</div>
											</div>
										</div>
									</div>

									{/* Right Side - User Info and Actions */}
									<div>
										<div className="flex items-center justify-between mb-4">
											<div>
												<h3 className="font-semibold text-lg">{verification.name}</h3>
												<p className="text-sm text-gray-500">{verification.email}</p>
											</div>
											{getStatusBadge(verification.status)}
										</div>

										<div className="space-y-3 mb-6">
											<div className="flex justify-between">
												<span className="text-sm text-gray-500">Submitted:</span>
												<span className="text-sm">{verification.submittedTime}</span>
											</div>

											<div className="flex justify-between">
												<span className="text-sm text-gray-500">Location:</span>
												<span className="text-sm">{verification.location}</span>
											</div>

											<div className="flex justify-between">
												<span className="text-sm text-gray-500">Joined:</span>
												<span className="text-sm">{verification.joinedDate}</span>
											</div>

											<div className="flex justify-between items-start">
												<span className="text-sm text-gray-500">Verification email:</span>
												<div className="flex items-center space-x-2">
													<CheckCircle className="w-4 h-4 text-green-500" />
													<span className="text-sm">Verified email</span>
												</div>
											</div>
										</div>

										<div className="mb-6">
											<h4 className="font-medium mb-2">User Notes</h4>
											<p className="text-sm bg-gray-50 p-3 rounded">
												"{verification.notes}"
											</p>
										</div>

										{/* Verification Actions */}
										<div className="space-y-3">
											<Button className="w-full bg-green-600 hover:bg-green-700">
												<CheckCircle className="w-4 h-4 mr-2" />
												Approve Verification
											</Button>
											<Button variant="destructive" className="w-full">
												<XCircle className="w-4 h-4 mr-2" />
												Reject Verification
											</Button>
											<Button variant="outline" className="w-full">
												<MessageSquare className="w-4 h-4 mr-2" />
												Request New Video
											</Button>
										</div>

										<div className="mt-6 pt-4 border-t">
											<h4 className="font-medium mb-2">Rejection Reason (if applicable)</h4>
											<select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
												<option value="">Select Reason</option>
												<option value="poor_quality">Poor video quality</option>
												<option value="no_id">No identification shown</option>
												<option value="fake_id">Suspected fake ID</option>
												<option value="face_mismatch">Face doesn't match profile</option>
												<option value="other">Other</option>
											</select>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{/* View All Button */}
				<div className="text-center">
					<Button variant="link">View All 18 Pending Verifications</Button>
				</div>
			</div>
		</Layout>
	);
}
