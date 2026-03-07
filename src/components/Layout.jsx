import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Sidebar from './Sidebar';
import {
	Search,
	Bell,
	Settings,
	LogOut,
	UserCircle,
	KeyRound,
	ShieldCheck,
	ChevronDown,
	X,
	Eye,
	EyeOff,
	Loader2,
	Check,
	AlertCircle,
} from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useAdminAuthContext } from '@/contexts/AdminAuthContext';
import { adminAuthAPI } from '@/lib/adminApi';

// ─── Inline Edit Profile Modal ────────────────────────────────────────────────
function EditProfileModal({ adminUser, onClose, onSaved }) {
	const [form, setForm] = useState({
		firstName: adminUser?.firstName || '',
		lastName: adminUser?.lastName || '',
		email: adminUser?.email || '',
		phone: adminUser?.phone || '',
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleSave = async (e) => {
		e.preventDefault();
		setError('');
		setLoading(true);
		try {
			await adminAuthAPI.updateProfile(form);
			onSaved(form);
			onClose();
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to update profile. Try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-5">
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-semibold">Edit Profile</h3>
					<button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
				</div>
				<form onSubmit={handleSave} className="space-y-4">
					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className="block text-xs font-medium text-gray-600 mb-1">First Name</label>
							<Input value={form.firstName} onChange={(e) => setForm(p => ({ ...p, firstName: e.target.value }))} />
						</div>
						<div>
							<label className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
							<Input value={form.lastName} onChange={(e) => setForm(p => ({ ...p, lastName: e.target.value }))} />
						</div>
					</div>
					<div>
						<label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
						<Input type="email" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} />
					</div>
					<div>
						<label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
						<Input value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91..." />
					</div>
					{error && (
						<div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
							<AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
							<p className="text-sm text-red-600">{error}</p>
						</div>
					)}
					<div className="flex gap-3 justify-end pt-1">
						<Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
						<Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
							{loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
							Save Changes
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}

// ─── Inline Change Password Modal ─────────────────────────────────────────────
function ChangePasswordModal({ onClose }) {
	const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
	const [showCurrent, setShowCurrent] = useState(false);
	const [showNew, setShowNew] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState(false);

	const handleSave = async (e) => {
		e.preventDefault();
		setError('');
		if (form.newPassword !== form.confirmPassword) {
			setError('New passwords do not match.');
			return;
		}
		if (form.newPassword.length < 8) {
			setError('New password must be at least 8 characters.');
			return;
		}
		setLoading(true);
		try {
			await adminAuthAPI.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
			setSuccess(true);
			setTimeout(onClose, 1500);
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to change password. Check your current password.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-5">
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-semibold flex items-center gap-2">
						<KeyRound className="w-5 h-5 text-blue-500" /> Change Password
					</h3>
					<button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
				</div>
				{success ? (
					<div className="flex flex-col items-center py-6 gap-3">
						<Check className="w-10 h-10 text-green-500" />
						<p className="text-green-700 font-medium">Password changed successfully!</p>
					</div>
				) : (
					<form onSubmit={handleSave} className="space-y-4">
						<div>
							<label className="block text-xs font-medium text-gray-600 mb-1">Current Password</label>
							<div className="relative">
								<Input
									type={showCurrent ? 'text' : 'password'}
									value={form.currentPassword}
									onChange={(e) => setForm(p => ({ ...p, currentPassword: e.target.value }))}
									className="pr-10"
									required
								/>
								<button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
									onClick={() => setShowCurrent(!showCurrent)}>
									{showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
								</button>
							</div>
						</div>
						<div>
							<label className="block text-xs font-medium text-gray-600 mb-1">New Password</label>
							<div className="relative">
								<Input
									type={showNew ? 'text' : 'password'}
									value={form.newPassword}
									onChange={(e) => setForm(p => ({ ...p, newPassword: e.target.value }))}
									className="pr-10"
									required
								/>
								<button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
									onClick={() => setShowNew(!showNew)}>
									{showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
								</button>
							</div>
						</div>
						<div>
							<label className="block text-xs font-medium text-gray-600 mb-1">Confirm New Password</label>
							<Input
								type="password"
								value={form.confirmPassword}
								onChange={(e) => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
								required
							/>
						</div>
						{error && (
							<div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
								<AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
								<p className="text-sm text-red-600">{error}</p>
							</div>
						)}
						<div className="flex gap-3 justify-end pt-1">
							<Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
							<Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
								{loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <KeyRound className="w-4 h-4 mr-2" />}
								Update Password
							</Button>
						</div>
					</form>
				)}
			</div>
		</div>
	);
}

// ─── Main Layout ──────────────────────────────────────────────────────────────
export default function Layout({ children, title }) {
	const { adminUser, isAuthenticated, isInitialized, logout } = useAdminAuthContext();
	const router = useRouter();

	// Profile dropdown
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef(null);

	// Modals
	const [showEditProfile, setShowEditProfile] = useState(false);
	const [showChangePassword, setShowChangePassword] = useState(false);

	// Local snapshot of profile (so immediate saves reflect in the navbar)
	const [localProfile, setLocalProfile] = useState(null);
	const profile = localProfile || adminUser;

	// Close dropdown on outside click
	useEffect(() => {
		const handle = (e) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
				setDropdownOpen(false);
			}
		};
		document.addEventListener('mousedown', handle);
		return () => document.removeEventListener('mousedown', handle);
	}, []);

	useEffect(() => {
		if (isInitialized && !isAuthenticated) {
			router.push('/login');
		}
	}, [isAuthenticated, isInitialized, router]);

	const handleLogout = async () => {
		setDropdownOpen(false);
		await logout();
		router.push('/login');
	};

	const initials = `${profile?.firstName?.[0] || profile?.username?.[0] || ''}${profile?.lastName?.[0] || ''}`.toUpperCase() || '?';
	const displayName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || profile?.username || profile?.email || 'Admin';

	if (!isInitialized) {
		return (
			<div className="flex h-screen bg-slate-900 items-center justify-center">
				<div className="text-white">Loading...</div>
			</div>
		);
	}

	if (!isAuthenticated) return null;

	return (
		<div className="flex h-screen bg-gray-50">
			<Sidebar />

			<div className="flex-1 flex flex-col overflow-hidden">
				{/* Top Header */}
				<header className="bg-white border-b border-gray-200 px-6 py-3.5">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-xl font-semibold text-gray-900">{title}</h1>
						</div>

						<div className="flex items-center space-x-2">
							{/* Global search */}
							<div className="relative hidden sm:block">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
								<Input placeholder="Search..." className="pl-10 w-56" />
							</div>

							{/* Notifications */}
							<Button variant="ghost" size="icon" className="relative">
								<Bell className="w-5 h-5" />
								<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
									3
								</span>
							</Button>

							{/* Settings link */}
							<Link href="/settings">
								<Button
									variant="ghost"
									size="icon"
									className={router.pathname.startsWith('/settings') ? 'bg-blue-50 text-blue-600' : ''}
									title="Settings"
								>
									<Settings className="w-5 h-5" />
								</Button>
							</Link>

							{/* Profile dropdown */}
							<div className="relative" ref={dropdownRef}>
								<button
									onClick={() => setDropdownOpen(!dropdownOpen)}
									className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
								>
									{profile?.avatarUrl ? (
										<img src={profile.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
									) : (
										<div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
											<span className="text-xs font-semibold text-white">{initials}</span>
										</div>
									)}
									<div className="text-left hidden sm:block">
										<p className="text-sm font-medium text-gray-900 leading-tight">{displayName}</p>
										<p className="text-xs text-gray-500 capitalize">{profile?.role?.replace('_', ' ') || 'Admin'}</p>
									</div>
									<ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
								</button>

								{/* Dropdown */}
								{dropdownOpen && (
									<div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-1 overflow-hidden">
										{/* Header */}
										<div className="px-4 py-3 border-b border-gray-100">
											<p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
											<p className="text-xs text-gray-500 truncate">{profile?.email}</p>
											<span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 capitalize">
												{profile?.role?.replace('_', ' ') || 'admin'}
											</span>
										</div>

										{/* Actions */}
										<button
											className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
											onClick={() => { setDropdownOpen(false); setShowEditProfile(true); }}
										>
											<UserCircle className="w-4 h-4 text-gray-400" />
											Edit Profile
										</button>
										<button
											className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
											onClick={() => { setDropdownOpen(false); setShowChangePassword(true); }}
										>
											<KeyRound className="w-4 h-4 text-gray-400" />
											Change Password
										</button>
										<Link
											href="/settings?tab=security"
											onClick={() => setDropdownOpen(false)}
											className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
										>
											<ShieldCheck className="w-4 h-4 text-gray-400" />
											MFA Settings
										</Link>

										<div className="border-t border-gray-100 mt-1" />

										<button
											className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
											onClick={handleLogout}
										>
											<LogOut className="w-4 h-4" />
											Sign Out
										</button>
									</div>
								)}
							</div>
						</div>
					</div>
				</header>

				{/* Page Content */}
				<main className="flex-1 overflow-y-auto p-6">
					{children}
				</main>
			</div>

			{/* Modals */}
			{showEditProfile && (
				<EditProfileModal
					adminUser={profile}
					onClose={() => setShowEditProfile(false)}
					onSaved={(updated) => setLocalProfile(prev => ({ ...(prev || adminUser), ...updated }))}
				/>
			)}
			{showChangePassword && (
				<ChangePasswordModal onClose={() => setShowChangePassword(false)} />
			)}
		</div>
	);
}
