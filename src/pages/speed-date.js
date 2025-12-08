import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Clock, Settings } from 'lucide-react';

export default function SpeedDateManagement() {
	return (
		<Layout title="Speed Date Management">
			<div className="space-y-6">
				{/* Header */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div>
						<h1 className="text-2xl font-bold">Speed Date Management</h1>
						<p className="text-muted-foreground">
							Manage speed dating sessions and events
						</p>
					</div>
					<Button className="bg-blue-600 hover:bg-blue-700">
						<Calendar className="w-4 h-4 mr-2" />
						Create Speed Date Event
					</Button>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">12</div>
							<p className="text-xs text-muted-foreground">
								+2 from yesterday
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Scheduled Events</CardTitle>
							<Calendar className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">8</div>
							<p className="text-xs text-muted-foreground">
								This week
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total Participants</CardTitle>
							<Clock className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">1,247</div>
							<p className="text-xs text-muted-foreground">
								+15% from last month
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Coming Soon Message */}
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<Calendar className="w-16 h-16 text-gray-400 mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">Speed Date Management</h3>
						<p className="text-sm text-gray-500 text-center max-w-md">
							This feature is currently under development. Speed dating session management and monitoring will be available soon.
						</p>
						<Button className="mt-4" variant="outline">
							<Settings className="w-4 h-4 mr-2" />
							Configure Settings
						</Button>
					</CardContent>
				</Card>
			</div>
		</Layout>
	);
}
