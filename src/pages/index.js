import React, { useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
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
	Clock,
	RefreshCw
} from 'lucide-react';

const Dashboard = () => {
	const { stats, loading, error, refetch } = useAdminDashboard();

	const getStatsCards = () => {
		console.log(stats);
		if (!stats) {
			return [
				{
					title: "Total Members",
					value: "0",
					change: "Loading...",
					changeType: "neutral",
					icon: Users,
					color: "blue"
				},
				{
					title: "Premium Members",
					value: "0",
					change: "Loading...",
					changeType: "neutral",
					icon: UserPlus,
					color: "purple"
				},
				{
					title: "Pending Verifications",
					value: "0",
					change: "Loading...",
					changeType: "neutral",
					icon: AlertTriangle,
					color: "yellow"
				},
				{
					title: "Active Chatrooms",
					value: "0",
					change: "Loading...",
					changeType: "neutral",
					icon: MessageSquare,
					color: "green"
				},
				{
					title: "Pending Reports",
					value: "0",
					change: "Loading...",
					changeType: "neutral",
					icon: AlertTriangle,
					color: "red"
				},
				{
					title: "Revenue This Month",
					value: "$0",
					change: "Loading...",
					changeType: "neutral",
					icon: TrendingUp,
					color: "green"
				}
			];
		}

		return [
			{
				title: "Total Members",
				value: stats.users.total?.toLocaleString() || "0",
				change: stats.users.newToday ? `+${stats.users.newToday} today` : "No new users",
				changeType: (stats.users.newToday || 0) > 0 ? "positive" : "neutral",
				icon: Users,
				color: "blue"
			},
			{
				title: "Premium Members",
				value: stats.premiumUsers?.toLocaleString() || "0",
				change: stats.newPremiumUsers ? `+${stats.newPremiumUsers} this week` : "No new premium",
				changeType: (stats.newPremiumUsers || 0) > 0 ? "positive" : "neutral",
				icon: UserPlus,
				color: "purple"
			},
			{
				title: "Pending Verifications",
				value: stats.pendingVerifications?.toString() || "0",
				change: stats.pendingVerifications > 0 ? "Requires attention" : "All caught up",
				changeType: stats.pendingVerifications > 0 ? "warning" : "positive",
				icon: AlertTriangle,
				color: stats.pendingVerifications > 0 ? "yellow" : "green"
			},
			{
				title: "Active Chatrooms",
				value: stats.activeChatrooms?.toString() || "0",
				change: stats.liveChatrooms ? `${stats.liveChatrooms} live now` : "No live rooms",
				changeType: (stats.liveChatrooms || 0) > 0 ? "positive" : "neutral",
				icon: MessageSquare,
				color: "green"
			},
			{
				title: "Pending Reports",
				value: stats.pendingReports?.toString() || "0",
				change: stats.reportsResolvedToday ? `${stats.reportsResolvedToday} resolved today` : "No reports",
				changeType: stats.pendingReports > 0 ? "warning" : "positive",
				icon: AlertTriangle,
				color: stats.pendingReports > 0 ? "red" : "green"
			},
			{
				title: "Revenue This Month",
				value: stats.monthlyRevenue ? `$${stats.monthlyRevenue.toLocaleString()}` : "$0",
				change: stats.revenueChange ? `${stats.revenueChange > 0 ? '+' : ''}${stats.revenueChange}% from last month` : "No change",
				changeType: (stats.revenueChange || 0) >= 0 ? "positive" : "negative",
				icon: TrendingUp,
				color: (stats.revenueChange || 0) >= 0 ? "green" : "red"
			}
		];
	};

	const statsCards = getStatsCards();

	// Recent signups and reports would come from API in the future
	const recentSignups = [];
	const recentReports = [];

	return (
		<Layout title="Dashboard Overview">
			<div className="space-y-6">
				{/* Header */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div>
						<h1 className="text-2xl font-bold">Dashboard Overview</h1>
						<p className="text-muted-foreground">
							Monitor your platform's key metrics and recent activities
						</p>
					</div>
					<Button
						className="bg-blue-600 hover:bg-blue-700"
						onClick={() => refetch()}
						disabled={loading}
					>
						<RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
						Refresh Data
					</Button>
				</div>

				{/* Loading/Error States */}
				{error && (
					<Card className="border-red-200 bg-red-50">
						<CardContent className="pt-6">
							<div className="text-center text-red-600">
								<p>Error loading dashboard data: {error}</p>
								<Button
									variant="outline"
									className="mt-2"
									onClick={() => refetch()}
								>
									Try Again
								</Button>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
					{statsCards.map((card, index) => (
						<Card key={index}>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">{card.title}</CardTitle>
								<card.icon className={`h-4 w-4 text-muted-foreground`} />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{card.value}</div>
								<p className={`text-xs ${card.changeType === 'positive' ? 'text-green-600' :
										card.changeType === 'negative' ? 'text-red-600' :
											'text-muted-foreground'
									}`}>
									{card.change}
								</p>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Quick Actions */}
				<Card>
					<CardHeader>
						<CardTitle>Quick Actions</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							<Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
								<UserPlus className="w-6 h-6" />
								<span className="text-sm">Add Member</span>
							</Button>
							<Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
								<Eye className="w-6 h-6" />
								<span className="text-sm">View Reports</span>
							</Button>
							<Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
								<MessageSquare className="w-6 h-6" />
								<span className="text-sm">Send Message</span>
							</Button>
							<Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
								<TrendingUp className="w-6 h-6" />
								<span className="text-sm">View Analytics</span>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</Layout>
	);
};

export default Dashboard;