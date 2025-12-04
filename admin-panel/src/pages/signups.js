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
	Eye,
	AlertTriangle,
	MapPin,
	Clock,
	Mail
} from 'lucide-react';

const mockSignups = [
	{
		id: 1,
		name: "Sarah Johnson",
		email: "sarah.jo@example.com",
		status: "Verified",
		joinedTime: "Joined: 5 min ago",
		location: "New York, USA",
		verified: true,
		avatar: null,
		flagged: false
	},
	{
		id: 2,
		name: "Michael Chen",
		email: "michael.c@example.com",
		status: "Pending",
		joinedTime: "Joined: 15 min ago",
		location: "Toronto, Canada",
		verified: false,
		avatar: null,
		flagged: false
	},
	{
		id: 3,
		name: "Emma Rodriguez",
		email: "emma.r@example.com",
		status: "Flagged",
		joinedTime: "Joined: 1 hour ago",
		location: "London, UK",
		verified: false,
		avatar: null,
		flagged: true
	}
];

const statsCards = [
	{
		title: "Total New Signups",
		value: "142",
		change: "+12% from yesterday",
		color: "blue"
	},
	{
		title: "Pending Approval",
		value: "24",
		change: "↓ 8% from yesterday",
		color: "yellow"
	},
	{
		title: "Verified Today",
		value: "18",
		change: "Requires attention",
		color: "green"
	},
	{
		title: "Rejected Today",
		value: "6",
		change: "↑ 23 new today",
		color: "red"
	}
];

export default function NewSignups() {
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');

	const getStatusBadge = (status) => {
		switch (status.toLowerCase()) {
			case 'verified': return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
			case 'pending': return <Badge variant="warning"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
			case 'flagged': return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Flagged</Badge>;
			default: return <Badge variant="secondary">{status}</Badge>;
		}
	};

	return (
		<Layout title="New Signups">
			<div className="space-y-6">
				{/* Header */}
				<p className="text-muted-foreground">
					Recently registered members awaiting approval
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
									placeholder="Search new signups..."
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
									<option value="verified">Verified</option>
									<option value="pending">Pending</option>
									<option value="flagged">Flagged</option>
								</select>

								<Button variant="outline" size="sm">
									<Filter className="w-4 h-4 mr-2" />
									Filters
								</Button>
							</div>
						</div>
					</CardHeader>
				</Card>

				{/* Signups Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{mockSignups.map((user) => (
						<Card key={user.id} className="relative">
							{user.flagged && (
								<div className="absolute top-2 right-2">
									<AlertTriangle className="w-5 h-5 text-red-500" />
								</div>
							)}

							<CardContent className="p-6">
								<div className="flex items-center space-x-4 mb-4">
									<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
										<span className="text-blue-600 font-semibold">
											{user.name.split(' ').map(n => n[0]).join('')}
										</span>
									</div>
									<div className="flex-1">
										<h3 className="font-semibold text-lg">{user.name}</h3>
										<div className="flex items-center text-sm text-gray-500 mt-1">
											<Mail className="w-4 h-4 mr-1" />
											{user.email}
										</div>
									</div>
								</div>

								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-500">Status:</span>
										{getStatusBadge(user.status)}
									</div>

									<div className="flex items-center text-sm text-gray-500">
										<Clock className="w-4 h-4 mr-2" />
										{user.joinedTime}
									</div>

									<div className="flex items-center text-sm text-gray-500">
										<MapPin className="w-4 h-4 mr-2" />
										{user.location}
									</div>

									{user.verified && (
										<div className="flex items-center text-sm text-green-600">
											<CheckCircle className="w-4 h-4 mr-2" />
											Verified email
										</div>
									)}
								</div>

								<div className="flex space-x-2 mt-6">
									<Button size="sm" variant="outline" className="flex-1">
										<Eye className="w-4 h-4 mr-2" />
										View
									</Button>
									<Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
										<CheckCircle className="w-4 h-4 mr-2" />
										Approve
									</Button>
									<Button size="sm" variant="destructive" className="flex-1">
										<XCircle className="w-4 h-4 mr-2" />
										Reject
									</Button>
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
