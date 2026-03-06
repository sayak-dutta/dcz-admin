import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export default function MfaVerify() {
	const router = useRouter();
	const { tempToken } = router.query;
	const { verifyMfa, loading, error } = useAdminAuth();

	const [code, setCode] = useState('');
	const [localError, setLocalError] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLocalError('');

		if (!code || code.length !== 6) {
			setLocalError('Please enter the 6-digit code from your authenticator app.');
			return;
		}

		if (!tempToken) {
			setLocalError('Session expired. Please log in again.');
			return;
		}

		const result = await verifyMfa(code, tempToken);

		if (result.success) {
			window.location.href = '/';
		} else {
			setLocalError(result.error || 'Invalid or expired code. Please try again.');
		}
	};

	const handleCodeChange = (e) => {
		const val = e.target.value.replace(/\D/g, '').slice(0, 6);
		setCode(val);
	};

	return (
		<div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				{/* Logo */}
				<div className="text-center mb-8">
					<img src="/logo.png" alt="DesiCouplesz" className="w-20 h-20 mx-auto mb-4" />
					<h1 className="text-2xl font-bold text-white">Two-Factor Auth</h1>
					<p className="text-slate-400 mt-2">Enter the code from your authenticator app</p>
				</div>

				<Card className="bg-slate-800 border-slate-700">
					<CardHeader>
						<CardTitle className="text-white text-center flex items-center justify-center gap-2">
							<ShieldCheck className="w-5 h-5 text-blue-400" />
							Verify Identity
						</CardTitle>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-5">
							{/* TOTP Input */}
							<div>
								<label htmlFor="totp-code" className="block text-sm font-medium text-slate-300 mb-2">
									6-Digit Authenticator Code
								</label>
								<Input
									id="totp-code"
									name="code"
									type="text"
									inputMode="numeric"
									autoComplete="one-time-code"
									value={code}
									onChange={handleCodeChange}
									placeholder="000000"
									className="bg-slate-700 border-slate-600 text-white text-center text-2xl tracking-[0.5em] placeholder:text-slate-500 h-14 font-mono"
									maxLength={6}
									required
									disabled={loading}
									autoFocus
								/>
								<p className="text-xs text-slate-500 mt-2 text-center">
									Code refreshes every 30 seconds
								</p>
							</div>

							{/* Error */}
							{(localError || error) && (
								<div className="flex items-center space-x-2 p-3 bg-red-900/50 border border-red-700 rounded-md">
									<AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
									<p className="text-sm text-red-400">{localError || error}</p>
								</div>
							)}

							{/* Submit */}
							<Button
								type="submit"
								className="w-full bg-blue-600 hover:bg-blue-700 text-white"
								disabled={loading || code.length !== 6}
							>
								{loading ? (
									<>
										<RefreshCw className="w-4 h-4 mr-2 animate-spin" />
										Verifying...
									</>
								) : (
									'Verify & Sign In'
								)}
							</Button>

							{/* Back */}
							<div className="text-center">
								<button
									type="button"
									onClick={() => router.push('/login')}
									className="text-sm text-slate-400 hover:text-slate-300 flex items-center justify-center mx-auto gap-1"
								>
									<ArrowLeft className="w-3 h-3" />
									Back to Login
								</button>
							</div>
						</form>
					</CardContent>
				</Card>

				<div className="text-center mt-6">
					<p className="text-xs text-slate-500">
						©{new Date().getFullYear()} DesiCouplesz Admin Panel
					</p>
				</div>
			</div>
		</div>
	);
}
