import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export default function AdminLogin() {
	const router = useRouter();
	const { login, loading, error } = useAdminAuth();
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});
	const [showPassword, setShowPassword] = useState(false);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!formData.email || !formData.password) {
			return;
		}

		const result = await login(formData);

		if (result.success) {
			window.location.href = '/';
		} else if (result.mfaNotSetup && result.tempToken) {
			// First-time MFA setup required
			window.location.href = `/mfa-setup?tempToken=${encodeURIComponent(result.tempToken)}`;
		} else if (result.mfaRequired && result.tempToken) {
			// MFA verification step
			window.location.href = `/mfa-verify?tempToken=${encodeURIComponent(result.tempToken)}`;
		}
	};

	return (
		<div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				{/* Logo */}
				<div className="text-center mb-8">
					<img src="/logo.png" alt="DesiCouplesz" className="w-20 h-20 mx-auto mb-4" />
					<h1 className="text-2xl font-bold text-white">Admin Panel</h1>
					<p className="text-slate-400 mt-2">Sign in to access the admin dashboard</p>
				</div>

				<Card className="bg-slate-800 border-slate-700">
					<CardHeader>
						<CardTitle className="text-white text-center">Admin Login</CardTitle>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							{/* Email Field */}
							<div>
								<label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
									Email Address
								</label>
								<Input
									id="email"
									name="email"
									type="email"
									value={formData.email}
									onChange={handleInputChange}
									placeholder="admin@example.com"
									className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
									required
									disabled={loading}
								/>
							</div>

							{/* Password Field */}
							<div>
								<label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
									Password
								</label>
								<div className="relative">
									<Input
										id="password"
										name="password"
										type={showPassword ? 'text' : 'password'}
										value={formData.password}
										onChange={handleInputChange}
										placeholder="Enter your password"
										className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 pr-10"
										required
										disabled={loading}
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
										disabled={loading}
									>
										{showPassword ? (
											<EyeOff className="w-4 h-4" />
										) : (
											<Eye className="w-4 h-4" />
										)}
									</button>
								</div>
							</div>

							{/* Error Message */}
							{error && (
								<div className="flex items-center space-x-2 p-3 bg-red-900/50 border border-red-700 rounded-md">
									<AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
									<p className="text-sm text-red-400">{error}</p>
								</div>
							)}

							{/* Submit Button */}
							<Button
								type="submit"
								className="w-full bg-blue-600 hover:bg-blue-700 text-white"
								disabled={loading || !formData.email || !formData.password}
							>
								{loading ? 'Signing in...' : 'Sign In'}
							</Button>
						</form>

						{/* Back to User App Link */}
						<div className="mt-6 text-center">
							<Link
								href="https://desicouplesz.com"
								className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
							>
								Back to User App
							</Link>
						</div>
					</CardContent>
				</Card>

				{/* Footer */}
				<div className="text-center mt-8">
					<p className="text-xs text-slate-500">
						©{new Date().getFullYear()} DesiCouplesz Admin Panel. All rights reserved.
					</p>
				</div>
			</div>
		</div>
	);
}
