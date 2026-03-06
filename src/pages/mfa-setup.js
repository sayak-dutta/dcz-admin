import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ShieldCheck, ArrowLeft, RefreshCw, CheckCircle2, Copy } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export default function MfaSetup() {
	const router = useRouter();
	const { tempToken } = router.query;
	const { setupMfa, confirmMfaSetup, loading } = useAdminAuth();

	const [step, setStep] = useState('loading'); // 'loading' | 'scan' | 'confirm' | 'done'
	const [qrCodeUri, setQrCodeUri] = useState('');
	const [secret, setSecret] = useState('');
	const [recoveryCodes, setRecoveryCodes] = useState([]);
	const [code, setCode] = useState('');
	const [error, setError] = useState('');
	const [confirming, setConfirming] = useState(false);
	const [copiedSecret, setCopiedSecret] = useState(false);

	useEffect(() => {
		if (!tempToken) return;

		const initSetup = async () => {
			const result = await setupMfa(tempToken);
			if (result.success) {
				setQrCodeUri(result.data?.qrCodeUri || '');
				setSecret(result.data?.secret || '');
				setStep('scan');
			} else {
				setError(result.error || 'Failed to initialize MFA. Please try logging in again.');
				setStep('scan');
			}
		};

		initSetup();
	}, [tempToken]); // eslint-disable-line react-hooks/exhaustive-deps

	const handleConfirm = async (e) => {
		e.preventDefault();
		setError('');

		if (!code || code.length !== 6) {
			setError('Please enter the 6-digit code from your authenticator app.');
			return;
		}

		setConfirming(true);
		const result = await confirmMfaSetup(code, tempToken);
		setConfirming(false);

		if (result.success) {
			setRecoveryCodes(result.data?.recoveryCodes || []);
			setStep('done');
		} else {
			setError(result.error || 'Invalid code. Make sure your phone clock is synced and try again.');
		}
	};

	const handleCodeChange = (e) => {
		const val = e.target.value.replace(/\D/g, '').slice(0, 6);
		setCode(val);
	};

	const copySecret = () => {
		navigator.clipboard.writeText(secret);
		setCopiedSecret(true);
		setTimeout(() => setCopiedSecret(false), 2000);
	};

	// Generate Google Charts QR code URL as fallback renderer
	const qrImageUrl = qrCodeUri
		? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUri)}`
		: '';

	return (
		<div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				{/* Header */}
				<div className="text-center mb-8">
					<img src="/logo.png" alt="DesiCouplesz" className="w-20 h-20 mx-auto mb-4" />
					<h1 className="text-2xl font-bold text-white">Set Up Two-Factor Auth</h1>
					<p className="text-slate-400 mt-2">
						Secure your super-admin account with an authenticator app
					</p>
				</div>

				<Card className="bg-slate-800 border-slate-700">
					<CardHeader>
						<CardTitle className="text-white flex items-center gap-2">
							<ShieldCheck className="w-5 h-5 text-blue-400" />
							{step === 'done' ? 'MFA Enabled ✓' : 'Scan QR Code'}
						</CardTitle>
					</CardHeader>
					<CardContent>
						{step === 'loading' && (
							<div className="flex flex-col items-center py-8 gap-3">
								<RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
								<p className="text-slate-400">Generating your QR code…</p>
							</div>
						)}

						{(step === 'scan' || step === 'confirm') && (
							<div className="space-y-5">
								{/* Step 1: QR */}
								<div>
									<p className="text-sm text-slate-300 font-medium mb-3">
										Step 1 — Scan this QR code with Google Authenticator, Authy, or any TOTP app.
									</p>
									{qrImageUrl && (
										<div className="flex justify-center mb-3">
											<div className="bg-white p-3 rounded-lg">
												<img
													src={qrImageUrl}
													alt="MFA QR Code"
													className="w-48 h-48"
												/>
											</div>
										</div>
									)}
									{secret && (
										<div className="bg-slate-700 rounded-md px-3 py-2 flex items-center justify-between">
											<div>
												<p className="text-xs text-slate-400 mb-0.5">Manual entry key</p>
												<code className="text-sm text-blue-300 font-mono tracking-widest">
													{secret}
												</code>
											</div>
											<button
												type="button"
												onClick={copySecret}
												className="text-slate-400 hover:text-slate-200 transition-colors ml-2"
											>
												{copiedSecret ? (
													<CheckCircle2 className="w-4 h-4 text-green-400" />
												) : (
													<Copy className="w-4 h-4" />
												)}
											</button>
										</div>
									)}
								</div>

								{/* Step 2: Confirm */}
								<form onSubmit={handleConfirm} className="space-y-4">
									<div>
										<label htmlFor="setup-code" className="block text-sm font-medium text-slate-300 mb-2">
											Step 2 — Enter the 6-digit code to verify and activate MFA
										</label>
										<Input
											id="setup-code"
											name="code"
											type="text"
											inputMode="numeric"
											value={code}
											onChange={handleCodeChange}
											placeholder="000000"
											className="bg-slate-700 border-slate-600 text-white text-center text-2xl tracking-[0.5em] placeholder:text-slate-500 h-14 font-mono"
											maxLength={6}
											required
											disabled={confirming}
										/>
									</div>

									{error && (
										<div className="flex items-center gap-2 p-3 bg-red-900/50 border border-red-700 rounded-md">
											<AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
											<p className="text-sm text-red-400">{error}</p>
										</div>
									)}

									<Button
										type="submit"
										className="w-full bg-blue-600 hover:bg-blue-700 text-white"
										disabled={confirming || code.length !== 6}
									>
										{confirming ? (
											<>
												<RefreshCw className="w-4 h-4 mr-2 animate-spin" />
												Verifying…
											</>
										) : (
											'Activate MFA'
										)}
									</Button>
								</form>

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
							</div>
						)}

						{step === 'done' && (
							<div className="space-y-5">
								<div className="flex flex-col items-center py-4 gap-2">
									<CheckCircle2 className="w-12 h-12 text-green-400" />
									<p className="text-white font-medium text-lg">MFA Activated!</p>
									<p className="text-slate-400 text-sm text-center">
										Save these recovery codes in a secure place. They can be used if you lose access to your authenticator app. Each code can only be used once.
									</p>
								</div>

								{recoveryCodes.length > 0 && (
									<div className="bg-slate-700 rounded-lg p-4">
										<p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">Recovery Codes</p>
										<div className="grid grid-cols-2 gap-2">
											{recoveryCodes.map((c, i) => (
												<code key={i} className="text-xs text-green-300 font-mono bg-slate-800 px-2 py-1 rounded">
													{c}
												</code>
											))}
										</div>
									</div>
								)}

								<Button
									onClick={() => router.push(`/mfa-verify?tempToken=${encodeURIComponent(tempToken || '')}`)}
									className="w-full bg-blue-600 hover:bg-blue-700 text-white"
								>
									Continue to Sign In
								</Button>
							</div>
						)}
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
