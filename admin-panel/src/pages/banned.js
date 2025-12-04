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
	Filter,
	UserX,
	RotateCcw,
	Eye,
	Calendar,
	AlertTriangle,
	CheckCircle
} from 'lucide-react';

const mockBannedUsers = [
	{
		id: 1,
		name: "John Doe",
		email: "john.doe@example.com",
		banType: "Permanent",
		banDate: "15 May 2025",
		banReason: "Multiple violations of community guidelines including...",
		bannedBy: "Admin (Sarah)",
		avatar: null
	},
	{
		id: 2,
		name: "Jane Smith",
		email: "jane.smith@example.com",
		banType: "Temporary (7 days)",
		banDate: "1 Jun 2025",
		banReason: "Spamming other members with...",
		bannedBy: "System (Auto-ban)",
		avatar: null
	},
	{
		id: 3,
		name: "Robert Johnson",
		email: "robert.j@example.com",
		banType: "Permanent",
		banDate: "20 Apr 2025",
		banReason: "Fake profile and fraudulent activity...",
		bannedBy: "Admin (Michael)",
		avatar: null
	}
];

const statsCards = [
	{
		title: "Total Banned Users",
		value: "327",
		change: "↓ 5% from last week",
		color: "red"
	},
	{
		title: "Banned This Week",
		value: "24",
		change: "↓ 8% from yesterday",
		color: "orange"
	},
	{
		title: "Permanent Bans",
		value: "189",
		change: "Requires attention",
		color: "red"
	},
	{
		title: "Temporary Bans",
		value: "138",
		change: "↑ 23 new today",
		color: "yellow"
	}
];

export default function BannedUsers() {
	const [searchTerm, setSearchTerm] = useState('');
	const [banTypeFilter, setBanTypeFilter] = useState('all');

	const getBanTypeBadge = (banType) => {
		if (banType.toLowerCase().includes('permanent')) {
			return <Badge variant="destructive">Permanent</Badge>;
		} else if (banType.toLowerCase().includes('temporary')) {
			return <Badge variant="warning">Temporary</Badge>;
		}
		return <Badge variant="secondary">{banType}</Badge>;
	};

	return (
		<Layout title="Banned Users">
			<div className="space-y-6">
				{/* Header */}
				<p className="text-muted-foreground">
					Manage suspended and banned member accounts
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
									placeholder="Search banned users..."
									className="pl-10"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</div>

							<div className="flex gap-2">
								<select
									className="px-3 py-2 border border-gray-300 rounded-md text-sm"
									value={banTypeFilter}
									onChange={(e) => setBanTypeFilter(e.target.value)}
								>
									<option value="all">All Ban Types</option>
									<option value="permanent">Permanent</option>
									<option value="temporary">Temporary</option>
								</select>

								<Button variant="outline" size="sm">
									<Filter className="w-4 h-4 mr-2" />
									Filters
								</Button>
							</div>
						</div>
					</CardHeader>

					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>User</TableHead>
									<TableHead>Ban Type</TableHead>
									<TableHead>Ban Date</TableHead>
									<TableHead>Ban Reason</TableHead>
									<TableHead>Banned By</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{mockBannedUsers.map((user) => (
									<TableRow key={user.id}>
										<TableCell>
											<div className="flex items-center space-x-3">
												<div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
													<span className="text-red-600 font-semibold text-xs">
														{user.name.split(' ').map(n => n[0]).join('')}
													</span>
												</div>
												<div>
													<p className="font-medium text-sm">{user.name}</p>
													<p className="text-xs text-gray-500">{user.email}</p>
												</div>
											</div>
										</TableCell>
										<TableCell>
											{getBanTypeBadge(user.banType)}
										</TableCell>
										<TableCell className="text-sm">{user.banDate}</TableCell>
										<TableCell className="text-sm max-w-xs">
											<div className="truncate" title={user.banReason}>
												{user.banReason}
											</div>
										</TableCell>
										<TableCell className="text-sm">{user.bannedBy}</TableCell>
										<TableCell className="text-right">
											<div className="flex items-center justify-end space-x-2">
												<Button size="sm" variant="ghost">
													<Eye className="w-4 h-4" />
												</Button>
												<Button size="sm" variant="ghost">
													<RotateCcw className="w-4 h-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>

				{/* Bulk Actions */}
				<Card>
					<CardHeader>
						<CardTitle>Bulk Actions</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center space-x-4">
							<div className="flex items-center space-x-2">
								<input type="checkbox" id="selectAll" className="rounded" />
								<label htmlFor="selectAll" className="text-sm">
									Select all 327 banned users
								</label>
							</div>
							<Button variant="outline" size="sm">
								Apply to selected
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Pagination */}
				<div className="flex items-center justify-between">
					<p className="text-sm text-muted-foreground">
						Showing 1 to 3 of 327 results
					</p>
					<div className="flex space-x-2">
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
							11
						</Button>
						<Button variant="outline" size="sm">
							Next
						</Button>
					</div>
				</div>
			</div>
		</Layout>
	);
}
