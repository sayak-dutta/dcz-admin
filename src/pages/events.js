import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Settings } from 'lucide-react';

export default function PartiesEventsManagement() {
	return (
		<Layout title="Parties & Events">
			<div className="space-y-6">
				{/* Header */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div>
						<h1 className="text-2xl font-bold">Parties & Events Management</h1>
						<p className="text-muted-foreground">
							Manage parties, events, and social gatherings
						</p>
					</div>
					<Button className="bg-blue-600 hover:bg-blue-700">
						<Calendar className="w-4 h-4 mr-2" />
						Create New Event
					</Button>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Active Events</CardTitle>
							<Calendar className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">24</div>
							<p className="text-xs text-muted-foreground">
								+3 from last week
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total RSVPs</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">3,421</div>
							<p className="text-xs text-muted-foreground">
								+12% from last month
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Event Locations</CardTitle>
							<MapPin className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">156</div>
							<p className="text-xs text-muted-foreground">
								Across 12 cities
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Coming Soon Message */}
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<Calendar className="w-16 h-16 text-gray-400 mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">Events Management</h3>
						<p className="text-sm text-gray-500 text-center max-w-md">
							Event creation, management, and monitoring features are currently under development. You'll be able to create, moderate, and track all platform events from here.
						</p>
						<Button className="mt-4" variant="outline">
							<Settings className="w-4 h-4 mr-2" />
							Event Settings
						</Button>
					</CardContent>
				</Card>
			</div>
		</Layout>
	);
}
