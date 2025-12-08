import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from './Sidebar';
import { Search, Bell, Settings, LogOut } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useAdminAuthContext } from '@/contexts/AdminAuthContext';

export default function Layout({ children, title }) {
	const { adminUser, isAuthenticated, isInitialized, logout } = useAdminAuthContext();
	const router = useRouter();

	useEffect(() => {
		if (isInitialized && !isAuthenticated) {
			router.push('/login');
		}
	}, [isAuthenticated, isInitialized, router]);

	const handleLogout = async () => {
		await logout();
		router.push('/login');
	};

	// Show loading while checking authentication
	if (!isInitialized) {
		return (
			<div className="flex h-screen bg-slate-900 items-center justify-center">
				<div className="text-white">Loading...</div>
			</div>
		);
	}

	// Redirect if not authenticated
	if (!isAuthenticated) {
		return null;
	}

	return (
		<div className="flex h-screen bg-gray-50">
			{/* Sidebar */}
			<Sidebar />

			{/* Main Content */}
			<div className="flex-1 flex flex-col overflow-hidden">
				{/* Top Header */}
				<header className="bg-white border-b border-gray-200 px-6 py-4">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-xl font-semibold text-gray-900">{title}</h1>
						</div>

						<div className="flex items-center space-x-4">
							{/* Search */}
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
								<Input
									placeholder="Search..."
									className="pl-10 w-64"
								/>
							</div>

							{/* Admin Profile */}
							<div className="flex items-center space-x-3">
								<div className="text-right">
									<p className="text-sm font-medium text-gray-900">
										{adminUser?.firstName} {adminUser?.lastName}
									</p>
									<p className="text-xs text-gray-500">
										{adminUser?.role || 'Admin'}
									</p>
								</div>
								<div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
									<span className="text-xs font-semibold text-white">
										{adminUser?.firstName?.[0]}{adminUser?.lastName?.[0]}
									</span>
								</div>
							</div>

							{/* Notifications */}
							<Button variant="ghost" size="icon" className="relative">
								<Bell className="w-5 h-5" />
								<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
									3
								</span>
							</Button>

							{/* Settings */}
							<Button variant="ghost" size="icon">
								<Settings className="w-5 h-5" />
							</Button>

							{/* Logout */}
							<Button
								variant="ghost"
								size="icon"
								onClick={handleLogout}
								className="text-gray-500 hover:text-gray-700"
							>
								<LogOut className="w-5 h-5" />
							</Button>
						</div>
					</div>
				</header>

				{/* Page Content */}
				<main className="flex-1 overflow-y-auto p-6">
					{children}
				</main>
			</div>
		</div>
	);
}
