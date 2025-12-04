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
	Download,
	UserPlus,
	Eye,
	MessageSquare,
	Crown,
	Star
} from 'lucide-react';

const mockPremiumMembers = [
	{
		id: 1,
		name: "John Doe",
		email: "john.doe@example.com",
		status: "Active",
		membership: "Premium",
		joined: "15 May 2025",
		lastActive: "2 hours ago",
		expiresAt: "15 May 2026"
	},
	{
		id: 2,
		name: "Jane Smith",
		email: "jane.smith@example.com",
		status: "Active",
		membership: "VIP",
		joined: "1 Jun 2025",
		lastActive: "1 day ago",
		expiresAt: "1 Jun 2026"
	}
];

export default function PremiumMembers() {
	const [searchTerm, setSearchTerm] = useState('');

	const getMembershipBadge = (membership) => {
		switch (membership.toLowerCase()) {
			case 'premium': return <Badge variant="default"><Star className="w-3 h-3 mr-1" />Premium</Badge>;
			case 'vip': return <Badge variant="secondary"><Crown className="w-3 h-3 mr-1" />VIP</Badge>;
			default: return <Badge variant="outline">{membership}</Badge>;
		}
	};

	return (
		<Layout title="Premium Members">
			<div className="space-y-6">
				<p className="text-muted-foreground">
					Manage premium and VIP subscribers
				</p>

				<Card>
					<CardHeader>
						<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
							<div className="relative flex-1 max-w-sm">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
								<Input
									placeholder="Search premium members..."
									className="pl-10"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</div>

							<div className="flex gap-2">
								<Button variant="outline" size="sm">
									<Filter className="w-4 h-4 mr-2" />
									Filters
								</Button>
								<Button variant="outline" size="sm">
									<Download className="w-4 h-4 mr-2" />
									Export
								</Button>
							</div>
						</div>
					</CardHeader>

					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Member</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Membership</TableHead>
									<TableHead>Joined</TableHead>
									<TableHead>Expires</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{mockPremiumMembers.map((member) => (
									<TableRow key={member.id}>
										<TableCell>
											<div className="flex items-center space-x-3">
												<div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
													<span className="text-white font-semibold text-xs">
														{member.name.split(' ').map(n => n[0]).join('')}
													</span>
												</div>
												<div>
													<p className="font-medium text-sm">{member.name}</p>
													<p className="text-xs text-gray-500">{member.email}</p>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<Badge variant="success">Active</Badge>
										</TableCell>
										<TableCell>
											{getMembershipBadge(member.membership)}
										</TableCell>
										<TableCell className="text-sm">{member.joined}</TableCell>
										<TableCell className="text-sm">{member.expiresAt}</TableCell>
										<TableCell className="text-right">
											<div className="flex items-center justify-end space-x-2">
												<Button size="sm" variant="ghost">
													<Eye className="w-4 h-4" />
												</Button>
												<Button size="sm" variant="ghost">
													<MessageSquare className="w-4 h-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>
		</Layout>
	);
}
