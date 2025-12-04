import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
	Search,
	Filter,
	Download,
	Eye,
	Trash2,
	CheckCircle,
	XCircle,
	AlertTriangle
} from 'lucide-react';

const mockMediaItems = [
	{
		id: 1,
		type: 'image',
		url: '/api/placeholder/200/200',
		uploadedBy: 'John Doe',
		reportedBy: 'User123',
		reason: 'Inappropriate content',
		status: 'pending',
		uploadedAt: '2 hours ago',
		reportedAt: '1 hour ago'
	},
	{
		id: 2,
		type: 'video',
		url: '/api/placeholder/200/200',
		uploadedBy: 'Jane Smith',
		reportedBy: 'User456',
		reason: 'Spam content',
		status: 'approved',
		uploadedAt: '1 day ago',
		reportedAt: '5 hours ago'
	},
	{
		id: 3,
		type: 'image',
		url: '/api/placeholder/200/200',
		uploadedBy: 'Mike Johnson',
		reportedBy: 'User789',
		reason: 'Fake profile image',
		status: 'rejected',
		uploadedAt: '3 days ago',
		reportedAt: '2 days ago'
	}
];

export default function MediaModeration() {
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');

	const getStatusBadge = (status) => {
		switch (status.toLowerCase()) {
			case 'pending':
				return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />Pending</Badge>;
			case 'approved':
				return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
			case 'rejected':
				return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	const filteredItems = mockMediaItems.filter(item => {
		const matchesSearch = item.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
			item.reportedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
			item.reason.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

	return (
		<Layout title="Media Moderation">
			<div className="space-y-6">
				<p className="text-muted-foreground">
					Review and moderate reported media content
				</p>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<Card>
						<CardContent className="p-4">
							<div className="flex items-center space-x-2">
								<AlertTriangle className="w-4 h-4 text-yellow-500" />
								<div>
									<p className="text-sm font-medium">Pending Review</p>
									<p className="text-2xl font-bold">24</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-4">
							<div className="flex items-center space-x-2">
								<CheckCircle className="w-4 h-4 text-green-500" />
								<div>
									<p className="text-sm font-medium">Approved Today</p>
									<p className="text-2xl font-bold">18</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-4">
							<div className="flex items-center space-x-2">
								<XCircle className="w-4 h-4 text-red-500" />
								<div>
									<p className="text-sm font-medium">Rejected Today</p>
									<p className="text-2xl font-bold">6</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-4">
							<div className="flex items-center space-x-2">
								<Eye className="w-4 h-4 text-blue-500" />
								<div>
									<p className="text-sm font-medium">Avg Review Time</p>
									<p className="text-2xl font-bold">3.2h</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				<Card>
					<CardHeader>
						<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
							<div className="relative flex-1 max-w-sm">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
								<Input
									placeholder="Search media reports..."
									className="pl-10"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</div>

							<div className="flex gap-2">
								<select
									className="px-3 py-2 border border-gray-200 rounded-md text-sm"
									value={statusFilter}
									onChange={(e) => setStatusFilter(e.target.value)}
								>
									<option value="all">All Status</option>
									<option value="pending">Pending</option>
									<option value="approved">Approved</option>
									<option value="rejected">Rejected</option>
								</select>

								<Button variant="outline" size="sm">
									<Filter className="w-4 h-4 mr-2" />
									More Filters
								</Button>
								<Button variant="outline" size="sm">
									<Download className="w-4 h-4 mr-2" />
									Export
								</Button>
							</div>
						</div>
					</CardHeader>

					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{filteredItems.map((item) => (
								<div key={item.id} className="border rounded-lg p-4 space-y-4">
									{/* Media Preview */}
									<div className="relative">
										<div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
											{item.type === 'video' ? (
												<div className="text-gray-500 text-sm">Video Preview</div>
											) : (
												<div className="text-gray-500 text-sm">Image Preview</div>
											)}
										</div>
										<div className="absolute top-2 right-2">
											{getStatusBadge(item.status)}
										</div>
									</div>

									{/* Media Info */}
									<div className="space-y-2">
										<div>
											<p className="text-sm font-medium">Uploaded by</p>
											<p className="text-sm text-gray-600">{item.uploadedBy}</p>
										</div>

										<div>
											<p className="text-sm font-medium">Reported by</p>
											<p className="text-sm text-gray-600">{item.reportedBy}</p>
										</div>

										<div>
											<p className="text-sm font-medium">Reason</p>
											<p className="text-sm text-red-600">{item.reason}</p>
										</div>

										<div className="flex justify-between text-xs text-gray-500">
											<span>Uploaded: {item.uploadedAt}</span>
											<span>Reported: {item.reportedAt}</span>
										</div>
									</div>

									{/* Actions */}
									{item.status === 'pending' && (
										<div className="flex space-x-2">
											<Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
												<CheckCircle className="w-3 h-3 mr-1" />
												Approve
											</Button>
											<Button size="sm" variant="destructive" className="flex-1">
												<XCircle className="w-3 h-3 mr-1" />
												Remove
											</Button>
										</div>
									)}

									<div className="flex space-x-2">
										<Button size="sm" variant="outline" className="flex-1">
											<Eye className="w-3 h-3 mr-1" />
											View Details
										</Button>
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
