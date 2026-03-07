import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	AlertCircle,
	ShieldCheck,
	ArrowLeft,
	RefreshCw,
	CheckCircle2,
	Copy,
	KeyRound,
} from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export default function MfaSetup() {
	const router = useRouter();
	const { setupMfa, confirmMfaSetup } = useAdminAuth();

	// ─── State ────────────────────────────────────────────────────
	const [step, setStep] = useState('waiting'); // waiting | scan | confirm | done | error
	const [qrDataUrl, setQrDataUrl] = useState('');
	const [secret, setSecret] = useState('');
	const [recoveryCodes, setRecoveryCodes] = useState([]);
	const [code, setCode] = useState('');
	const [error, setError] = useState('');
	const [confirming, setConfirming] = useState(false);
	const [copiedSecret, setCopiedSecret] = useState(false);
	const calledRef = useRef(false); // prevent double-call in StrictMode / dev

	// ─── Wait for router hydration, then call backend ─────────────
	useEffect(() => {
		if (!router.isReady) return;      // router.query not populated yet
		if (calledRef.current) return;    // already fired
		calledRef.current = true;

		const { tempToken } = router.query;

		if (!tempToken) {
			setError('No session token found. Please log in again.');
			setStep('error');
			return;
		}

		const initSetup = async () => {
			setStep('waiting');
			const result = await setupMfa(tempToken);

			if (!result.success) {
				setError(result.error || 'Failed to initialise MFA. Please log in and try again.');
				setStep('error');
				return;
			}

			const otpUri = result.data?.qrCodeUri || result.data?.data?.qrCodeUri || '';
			const rawSecret = result.data?.secret || result.data?.data?.secret || '';
			setSecret(rawSecret);

			if (otpUri) {
				// Generate QR code client-side using the 'qrcode' npm package
				const QRCode = (await import('qrcode')).default;
				const dataUrl = await QRCode.toDataURL(otpUri, {
					width: 220,
					margin: 1,
					color: { dark: '#000000', light: '#ffffff' },
				});
				setQrDataUrl(dataUrl);
				setStep('scan');
			} else {
				setError('Backend did not return a QR code URI. Please check the MFA setup endpoint.');
				setStep('error');
			}
		};

		initSetup();
	}, [router.isReady]); // eslint-disable-line react-hooks/exhaustive-deps

	// ─── Confirm TOTP code ────────────────────────────────────────
	const handleConfirm = async (e) => {
		e.preventDefault();
		setError('');

		if (!code || code.length !== 6) {
			setError('Please enter the 6-digit code from your authenticator app.');
			return;
		}

		const { tempToken } = router.query;
		setConfirming(true);
		const result = await confirmMfaSetup(code, tempToken);
		setConfirming(false);

		if (result.success) {
			setRecoveryCodes(result.data?.recoveryCodes || result.data?.data?.recoveryCodes || []);
			setStep('done');
		} else {
			setError(result.error || 'Invalid code. Make sure your phone clock is synced and try again.');
		}
	};

	const handleCodeChange = (e) => {
		setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
	};

	const copySecret = async () => {
		await navigator.clipboard.writeText(secret);
		setCopiedSecret(true);
		setTimeout(() => setCopiedSecret(false), 2000);
	};

	// ─── Render ───────────────────────────────────────────────────
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
						<CardTitle className="text-white flex items-center gap-2 text-base">
							<ShieldCheck className="w-5 h-5 text-blue-400" />
							{step === 'done' ? 'MFA Enabled ✓' : 'Scan QR Code'}
						</CardTitle>
					</CardHeader>

					<CardContent>
						{/* ── Loading ── */}
						{step === 'waiting' && (
							<div className="flex flex-col items-center py-10 gap-3">
								<RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
								<p className="text-slate-400">Generating your QR code…</p>
							</div>
						)}

						{/* ── Error ── */}
						{step === 'error' && (
							<div className="space-y-4">
								<div className="flex items-start gap-2 p-4 bg-red-900/40 border border-red-700 rounded-lg">
									<AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
									<p className="text-sm text-red-300">{error}</p>
								</div>
								<Button
									variant="outline"
									className="w-full border-slate-600 text-slate-300"
									onClick={() => router.push('/login')}
								>
									<ArrowLeft className="w-4 h-4 mr-2" />
									Back to Login
								</Button>
							</div>
						)}

						{/* ── Scan + Confirm ── */}
						{step === 'scan' && (
							<div className="space-y-5">
								{/* Step 1 — QR */}
								<div>
									<p className="text-sm text-slate-300 font-medium mb-3">
										Step 1 — Scan this QR code with{' '}
										<span className="text-blue-300">Google Authenticator</span>, Authy, or any TOTP app.
									</p>

									{qrDataUrl ? (
										<div className="flex justify-center mb-3">
											<div className="bg-white p-3 rounded-xl shadow-xl">
												<img
													src={qrDataUrl}
													alt="MFA QR Code"
													className="w-52 h-52 block"
												/>
											</div>
										</div>
									) : (
										<div className="flex justify-center mb-3">
											<div className="w-52 h-52 bg-slate-700 rounded-xl flex items-center justify-center">
												<RefreshCw className="w-6 h-6 text-slate-500 animate-spin" />
											</div>
										</div>
									)}

									{secret && (
										<div className="bg-slate-700 rounded-lg px-3 py-2.5 flex items-center justify-between gap-2">
											<div className="min-w-0">
												<p className="text-xs text-slate-400 mb-1">Can't scan? Enter key manually:</p>
												<code className="text-sm text-blue-300 font-mono tracking-widest break-all">
													{secret}
												</code>
											</div>
											<button
												type="button"
												onClick={copySecret}
												className="text-slate-400 hover:text-slate-200 transition-colors flex-shrink-0"
												title="Copy secret"
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

								{/* Step 2 — Verify */}
								<form onSubmit={handleConfirm} className="space-y-4">
									<div>
										<label
											htmlFor="setup-code"
											className="block text-sm font-medium text-slate-300 mb-2"
										>
											Step 2 — Enter the 6-digit code to activate MFA
										</label>
										<Input
											id="setup-code"
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
											disabled={confirming}
											autoFocus
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
											<>
												<KeyRound className="w-4 h-4 mr-2" />
												Activate MFA
											</>
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

						{/* ── Done / Recovery codes ── */}
						{step === 'done' && (
							<div className="space-y-5">
								<div className="flex flex-col items-center py-4 gap-2">
									<CheckCircle2 className="w-12 h-12 text-green-400" />
									<p className="text-white font-semibold text-lg">MFA Activated!</p>
									<p className="text-slate-400 text-sm text-center">
										Save these recovery codes somewhere safe. Each can only be used once if you
										lose access to your authenticator app.
									</p>
								</div>

								{recoveryCodes.length > 0 && (
									<div className="bg-slate-700 rounded-lg p-4">
										<p className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wider">
											Recovery Codes — save now!
										</p>
										<div className="grid grid-cols-2 gap-2">
											{recoveryCodes.map((c, i) => (
												<code
													key={i}
													className="text-xs text-green-300 font-mono bg-slate-800 px-2 py-1.5 rounded text-center"
												>
													{c}
												</code>
											))}
										</div>
									</div>
								)}

								<Button
									className="w-full bg-blue-600 hover:bg-blue-700 text-white"
									onClick={() =>
										router.push(
											`/mfa-verify?tempToken=${encodeURIComponent(router.query.tempToken || '')}`
										)
									}
								>
									Continue to Sign In →
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
