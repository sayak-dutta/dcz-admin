import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	Users,
	UserPlus,
	AlertTriangle,
	Calendar,
	TrendingUp,
	Eye,
	MessageSquare,
	CheckCircle,
	XCircle,
	Clock
} from 'lucide-react';

const statsCards = [
	{
		title: "Total Members",
		value: "38,472",
		change: "+12% from last week",
		changeType: "positive",
		icon: Users,
		color: "blue"
	},
	{
		title: "Premium Members",
		value: "12,845",
		change: "+8% from last week",
		changeType: "positive",
		icon: UserPlus,
		color: "purple"
	},
	{
		title: "Pending Verifications",
		value: "18",
		change: "Requires attention",
		changeType: "warning",
		icon: AlertTriangle,
		color: "yellow"
	},
	{
		title: "Active Events",
		value: "4,278",
		change: "+23 new today",
		changeType: "positive",
		icon: Calendar,
		color: "green"
	}
];

const recentSignups = [
	{
		id: 1,
		name: "Sarah Johnson",
		email: "sarah.jo@example.com",
		status: "verified",
		joinedTime: "5 min ago",
		location: "New York, USA",
		avatar: null
	},
	{
		id: 2,
		name: "Michael Chen",
		email: "michael.c@example.com",
		status: "pending",
		joinedTime: "15 min ago",
		location: "Toronto, Canada",
		avatar: null
	},
	{
		id: 3,
		name: "Emma Rodriguez",
		email: "emma.r@example.com",
		status: "flagged",
		joinedTime: "1 hour ago",
		location: "London, UK",
		avatar: null
	}
];

const recentReports = [
	{
		id: 1,
		type: "Inappropriate profile",
		reporter: "user123",
		reported: "michael_j",
		time: "2 minutes ago",
		status: "pending"
	},
	{
		id: 2,
		type: "Spam message",
		reporter: "sarah_connor",
		reported: "jane.doe",
		time: "30 minutes ago",
		status: "resolved"
	},
	{
		id: 3,
		type: "Inappropriate photo",
		reporter: "moderator",
		reported: "emma123",
		time: "4 hours ago",
		status: "under_review"
	}
];

export default function Dashboard() {
	const getStatusColor = (status) => {
		switch (status) {
			case 'verified': return 'success';
			case 'pending': return 'warning';
			case 'flagged': return 'destructive';
			case 'resolved': return 'success';
			case 'under_review': return 'warning';
			default: return 'secondary';
		}
	};

	const getStatusIcon = (status) => {
		switch (status) {
			case 'verified': return CheckCircle;
			case 'pending': return Clock;
			case 'flagged': return XCircle;
			case 'resolved': return CheckCircle;
			case 'under_review': return Eye;
			default: return Clock;
		}
	};

	return (
		<Layout title="Dashboard Overview">
			<div className="space-y-6">
				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{statsCards.map((stat, index) => {
						const Icon = stat.icon;
						return (
							<Card key={index}>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium text-muted-foreground">
										{stat.title}
									</CardTitle>
									<Icon className={`w-4 h-4 text-${stat.color}-500`} />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{stat.value}</div>
									<p className={`text-xs ${stat.changeType === 'positive' ? 'text-green-600' :
											stat.changeType === 'warning' ? 'text-yellow-600' : 'text-gray-600'
										}`}>
										{stat.change}
									</p>
								</CardContent>
							</Card>
						);
					})}
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Profile Verifications */}
					<Card>
						<CardHeader>
							<CardTitle>Profile Verifications</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="bg-gray-900 rounded-lg p-4 relative">
								<video
									className="w-full h-48 bg-gray-800 rounded object-cover"
									poster="/api/placeholder/400/200"
								>
									Your browser does not support the video tag.
								</video>
								<div className="absolute bottom-2 left-2">
									<span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
										john_doe
									</span>
								</div>
								<div className="absolute bottom-2 right-2">
									<span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
										Joined: 2023-05-15
									</span>
								</div>
							</div>
							<div className="flex space-x-2">
								<Button className="flex-1 bg-green-600 hover:bg-green-700">
									<CheckCircle className="w-4 h-4 mr-2" />
									Approve
								</Button>
								<Button variant="destructive" className="flex-1">
									<XCircle className="w-4 h-4 mr-2" />
									Reject
								</Button>
								<Button variant="outline">
									<MessageSquare className="w-4 h-4 mr-2" />
									Request New Video
								</Button>
							</div>
							<div className="text-center">
								<Button variant="link">View All 18 Pending Verifications</Button>
							</div>
						</CardContent>
					</Card>

					{/* Recent Signups */}
					<Card>
						<CardHeader>
							<CardTitle>Recent Signups</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{recentSignups.map((user) => {
								const StatusIcon = getStatusIcon(user.status);
								return (
									<div key={user.id} className="flex items-center space-x-4 p-3 border rounded-lg">
										<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
											<span className="text-blue-600 font-semibold text-sm">
												{user.name.split(' ').map(n => n[0]).join('')}
											</span>
										</div>
										<div className="flex-1 min-w-0">
											<div className="flex items-center space-x-2">
												<p className="font-medium text-sm truncate">{user.name}</p>
												<Badge variant={getStatusColor(user.status)} className="text-xs">
													<StatusIcon className="w-3 h-3 mr-1" />
													{user.status}
												</Badge>
											</div>
											<p className="text-xs text-gray-500 truncate">{user.email}</p>
											<p className="text-xs text-gray-400">{user.location} • {user.joinedTime}</p>
										</div>
										<div className="flex space-x-1">
											<Button size="sm" variant="outline">
												<Eye className="w-3 h-3" />
											</Button>
											<Button size="sm" variant="outline">
												<MessageSquare className="w-3 h-3" />
											</Button>
										</div>
									</div>
								);
							})}
						</CardContent>
					</Card>
				</div>

				{/* Recent Reports */}
				<Card>
					<CardHeader>
						<CardTitle>Recent Reports</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{recentReports.map((report) => (
								<div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
									<div className="flex items-center space-x-4">
										<div className="w-2 h-2 bg-red-500 rounded-full"></div>
										<div>
											<p className="font-medium text-sm">{report.type}</p>
											<p className="text-xs text-gray-500">
												Reported by user123 • 30 minutes ago
											</p>
										</div>
									</div>
									<div className="flex items-center space-x-3">
										<Badge variant={getStatusColor(report.status)}>
											{report.status.replace('_', ' ')}
										</Badge>
										<Button size="sm" variant="outline">View</Button>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</Layout>
	);
}