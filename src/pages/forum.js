import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, Eye, Settings } from 'lucide-react';

export default function ForumManagement() {
	return (
		<Layout title="Forum Management">
			<div className="space-y-6">
				{/* Header */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div>
						<h1 className="text-2xl font-bold">Forum Management</h1>
						<p className="text-muted-foreground">
							Moderate forum categories, posts, and discussions
						</p>
					</div>
					<Button className="bg-blue-600 hover:bg-blue-700">
						<MessageSquare className="w-4 h-4 mr-2" />
						Create Category
					</Button>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Active Categories</CardTitle>
							<MessageSquare className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">18</div>
							<p className="text-xs text-muted-foreground">
								+2 new this month
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total Posts</CardTitle>
							<Eye className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">12,847</div>
							<p className="text-xs text-muted-foreground">
								+8% from last week
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Active Users</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">3,421</div>
							<p className="text-xs text-muted-foreground">
								Currently online
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Coming Soon Message */}
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<MessageSquare className="w-16 h-16 text-gray-400 mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">Forum Management</h3>
						<p className="text-sm text-gray-500 text-center max-w-md">
							Forum moderation and management features are currently under development. You'll be able to manage categories, moderate posts, and monitor discussions from this dashboard.
						</p>
						<Button className="mt-4" variant="outline">
							<Settings className="w-4 h-4 mr-2" />
							Forum Settings
						</Button>
					</CardContent>
				</Card>
			</div>
		</Layout>
	);
}
