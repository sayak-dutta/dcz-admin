import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Settings,
	Users,
	ShieldCheck,
	Loader2,
	AlertCircle,
	Check,
	Plus,
	RefreshCw,
	KeyRound,
	X,
	CheckCircle2,
	Copy,
} from 'lucide-react';
import { useAdminAuthContext } from '@/contexts/AdminAuthContext';
import { adminAppConfigAPI, adminAdminsAPI, adminAuthAPI } from '@/lib/adminApi';

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type = 'success', onClose }) {
	useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
	return (
		<div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium
			${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
			{type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
			{message}
			<button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X className="w-3 h-3" /></button>
		</div>
	);
}

// ─── Toggle row ───────────────────────────────────────────────────────────────
function ConfigToggle({ label, description, value, onChange, disabled }) {
	return (
		<div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
			<div>
				<p className="text-sm font-medium text-gray-900">{label}</p>
				{description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
			</div>
			<button
				onClick={() => onChange(!value)}
				disabled={disabled}
				className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none
					${value ? 'bg-blue-600' : 'bg-gray-300'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
			>
				<span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
			</button>
		</div>
	);
}

// ─── Section card ─────────────────────────────────────────────────────────────
function SectionCard({ title, icon: Icon, children, action }) {
	return (
		<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
			<div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
				<div className="flex items-center gap-2">
					<Icon className="w-5 h-5 text-blue-500" />
					<h2 className="text-base font-semibold text-gray-900">{title}</h2>
				</div>
				{action}
			</div>
			<div className="p-6">{children}</div>
		</div>
	);
}

// ─── Tab 1: App Configuration ─────────────────────────────────────────────────
function AppConfigTab({ isSuperAdmin }) {
	const [config, setConfig] = useState(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [toast, setToast] = useState(null);

	useEffect(() => {
		const load = async () => {
			try {
				const resp = await adminAppConfigAPI.getConfig();
				setConfig(resp.data?.data || resp.data);
			} catch {
				setConfig({
					requireSignupApproval: true, requireMediaApproval: true,
					requireGroupApproval: true, requireFireDateApproval: true,
					mfaRequiredForAllAdmins: false, maintenanceMode: false,
					supportEmail: '', appName: 'DesiCouplesz', maxMediaUploadSizeMb: 50,
				});
			} finally { setLoading(false); }
		};
		load();
	}, []);

	const handleToggle = async (key, val) => {
		if (!isSuperAdmin) return;
		const prev = config;
		setConfig(c => ({ ...c, [key]: val }));
		setSaving(true);
		try {
			await adminAppConfigAPI.updateConfig({ [key]: val });
			setToast({ message: 'Setting saved', type: 'success' });
		} catch {
			setConfig(prev);
			setToast({ message: 'Failed to save. Backend endpoint not yet live.', type: 'error' });
		} finally { setSaving(false); }
	};

	const handleFieldSave = async () => {
		setSaving(true);
		try {
			await adminAppConfigAPI.updateConfig({ supportEmail: config.supportEmail, appName: config.appName, maxMediaUploadSizeMb: config.maxMediaUploadSizeMb });
			setToast({ message: 'Configuration saved', type: 'success' });
		} catch {
			setToast({ message: 'Failed to save. Backend endpoint not yet live.', type: 'error' });
		} finally { setSaving(false); }
	};

	if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>;

	const toggles = [
		{ key: 'requireSignupApproval', label: 'Require Signup Approval', description: 'New user registrations must be approved by an admin before activation.' },
		{ key: 'requireMediaApproval', label: 'Require Media Approval', description: 'Photos and videos need admin approval before going live.' },
		{ key: 'requireGroupApproval', label: 'Require Group Approval', description: 'Newly created groups stay "pending" until approved.' },
		{ key: 'requireFireDateApproval', label: 'Require Fire Date Approval', description: 'Speed date listings must be approved before publishing.' },
		{ key: 'mfaRequiredForAllAdmins', label: 'Require MFA for All Admins', description: 'Enforce TOTP two-factor auth for every admin account.' },
		{ key: 'maintenanceMode', label: 'Maintenance Mode', description: 'Take the app offline for maintenance.' },
	];

	return (
		<div className="space-y-6">
			{toast && <Toast {...toast} onClose={() => setToast(null)} />}
			{!isSuperAdmin && (
				<div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
					<AlertCircle className="w-4 h-4 flex-shrink-0" />
					These settings can only be changed by a super-admin.
				</div>
			)}
			<SectionCard title="Approval Workflows" icon={Settings}>
				{toggles.slice(0, 4).map(({ key, label, description }) => (
					<ConfigToggle key={key} label={label} description={description}
						value={!!config?.[key]} onChange={(v) => handleToggle(key, v)} disabled={!isSuperAdmin || saving} />
				))}
			</SectionCard>
			<SectionCard title="Security & Access" icon={ShieldCheck}>
				{toggles.slice(4).map(({ key, label, description }) => (
					<ConfigToggle key={key} label={label} description={description}
						value={!!config?.[key]} onChange={(v) => handleToggle(key, v)} disabled={!isSuperAdmin || saving} />
				))}
			</SectionCard>
			<SectionCard title="General" icon={Settings}>
				<div className="space-y-4">
					{[
						{ label: 'App Name', key: 'appName', type: 'text', placeholder: 'DesiCouplesz' },
						{ label: 'Support Email', key: 'supportEmail', type: 'email', placeholder: 'support@desicouplesz.com' },
						{ label: 'Max Media Upload Size (MB)', key: 'maxMediaUploadSizeMb', type: 'number', placeholder: '50' },
					].map(({ label, key, type, placeholder }) => (
						<div key={key}>
							<label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
							<Input type={type} value={config?.[key] || ''} onChange={(e) => setConfig(p => ({ ...p, [key]: e.target.value }))}
								placeholder={placeholder} disabled={!isSuperAdmin} />
						</div>
					))}
					{isSuperAdmin && (
						<Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleFieldSave} disabled={saving}>
							{saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
							Save General Settings
						</Button>
					)}
				</div>
			</SectionCard>
		</div>
	);
}

// ─── Tab 2: Admin Accounts ────────────────────────────────────────────────────
function AdminAccountsTab({ isSuperAdmin }) {
	const [admins, setAdmins] = useState([]);
	const [loading, setLoading] = useState(true);
	const [toast, setToast] = useState(null);
	const [showCreate, setShowCreate] = useState(false);
	const [resetTarget, setResetTarget] = useState(null);
	const [createForm, setCreateForm] = useState({ firstName: '', lastName: '', email: '', role: 'admin', temporaryPassword: '', sendWelcomeEmail: true });
	const [createLoading, setCreateLoading] = useState(false);
	const [createError, setCreateError] = useState('');
	const [resetPw, setResetPw] = useState('');
	const [resetLoading, setResetLoading] = useState(false);

	const loadAdmins = useCallback(async () => {
		try {
			setLoading(true);
			const resp = await adminAdminsAPI.getAll();
			setAdmins(resp.data?.data?.admins || resp.data?.admins || resp.data || []);
		} catch { setAdmins([]); }
		finally { setLoading(false); }
	}, []);

	useEffect(() => { loadAdmins(); }, [loadAdmins]);

	const handleCreate = async (e) => {
		e.preventDefault();
		setCreateError('');
		setCreateLoading(true);
		try {
			await adminAdminsAPI.create(createForm);
			setShowCreate(false);
			setCreateForm({ firstName: '', lastName: '', email: '', role: 'admin', temporaryPassword: '', sendWelcomeEmail: true });
			setToast({ message: 'Admin account created', type: 'success' });
			loadAdmins();
		} catch (err) {
			setCreateError(err.response?.data?.message || 'Failed to create admin. Backend may not be live yet.');
		} finally { setCreateLoading(false); }
	};

	const handleDeactivate = async (admin) => {
		try {
			await adminAdminsAPI.update(admin.id, { isActive: !admin.isActive });
			setToast({ message: `Admin ${admin.isActive ? 'deactivated' : 'activated'}`, type: 'success' });
			loadAdmins();
		} catch { setToast({ message: 'Action failed. Backend may not be live yet.', type: 'error' }); }
	};

	const handleResetPassword = async () => {
		if (!resetPw || !resetTarget) return;
		setResetLoading(true);
		try {
			await adminAdminsAPI.resetPassword(resetTarget.id, { temporaryPassword: resetPw, sendEmail: true });
			setToast({ message: `Password reset and sent to ${resetTarget.email}`, type: 'success' });
			setResetTarget(null); setResetPw('');
		} catch { setToast({ message: 'Reset failed. Backend may not be live yet.', type: 'error' }); }
		finally { setResetLoading(false); }
	};

	const roleBadge = (role) => (
		<span className={`text-xs font-medium px-2 py-0.5 rounded-full ${role === 'super_admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
			{role?.replace('_', ' ')}
		</span>
	);

	return (
		<div className="space-y-6">
			{toast && <Toast {...toast} onClose={() => setToast(null)} />}
			<SectionCard title="Admin Accounts" icon={Users}
				action={isSuperAdmin && (
					<Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setShowCreate(true)}>
						<Plus className="w-4 h-4 mr-1" /> Add Admin
					</Button>
				)}
			>
				{loading ? (
					<div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
				) : admins.length === 0 ? (
					<div className="text-center py-8 text-gray-400">
						<Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
						<p className="text-sm">No admins found. Backend endpoint may not be live yet.</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="text-left border-b border-gray-100">
									<th className="pb-3 font-medium text-gray-500">Name</th>
									<th className="pb-3 font-medium text-gray-500">Role</th>
									<th className="pb-3 font-medium text-gray-500">MFA</th>
									<th className="pb-3 font-medium text-gray-500">Last Login</th>
									<th className="pb-3 font-medium text-gray-500">Status</th>
									{isSuperAdmin && <th className="pb-3 font-medium text-gray-500 text-right">Actions</th>}
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-50">
								{admins.map((admin) => (
									<tr key={admin.id} className="py-3">
										<td className="py-3">
											<p className="font-medium text-gray-900">{admin.firstName} {admin.lastName}</p>
											<p className="text-xs text-gray-500">{admin.email}</p>
										</td>
										<td className="py-3">{roleBadge(admin.role)}</td>
										<td className="py-3">{admin.mfaEnabled
											? <span className="text-green-600 text-xs font-medium">✓ Enabled</span>
											: <span className="text-gray-400 text-xs">Disabled</span>}
										</td>
										<td className="py-3 text-gray-500 text-xs">
											{admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleDateString() : '—'}
										</td>
										<td className="py-3">
											<span className={`text-xs px-2 py-0.5 rounded-full font-medium ${admin.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
												{admin.isActive !== false ? 'Active' : 'Inactive'}
											</span>
										</td>
										{isSuperAdmin && (
											<td className="py-3 text-right space-x-1">
												<Button size="sm" variant="ghost" className="text-xs h-7 px-2"
													onClick={() => { setResetTarget(admin); setResetPw(''); }}>
													<KeyRound className="w-3 h-3 mr-1" /> Reset PW
												</Button>
												<Button size="sm" variant="ghost" className="text-xs h-7 px-2"
													onClick={() => handleDeactivate(admin)}>
													{admin.isActive !== false ? 'Deactivate' : 'Activate'}
												</Button>
											</td>
										)}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</SectionCard>

			{/* Create Admin Modal */}
			{showCreate && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
					<div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-semibold">Add New Admin</h3>
							<button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
						</div>
						<form onSubmit={handleCreate} className="space-y-3">
							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="block text-xs font-medium text-gray-600 mb-1">First Name *</label>
									<Input value={createForm.firstName} onChange={(e) => setCreateForm(p => ({ ...p, firstName: e.target.value }))} required />
								</div>
								<div>
									<label className="block text-xs font-medium text-gray-600 mb-1">Last Name *</label>
									<Input value={createForm.lastName} onChange={(e) => setCreateForm(p => ({ ...p, lastName: e.target.value }))} required />
								</div>
							</div>
							<div>
								<label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
								<Input type="email" value={createForm.email} onChange={(e) => setCreateForm(p => ({ ...p, email: e.target.value }))} required />
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
									<select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
										value={createForm.role} onChange={(e) => setCreateForm(p => ({ ...p, role: e.target.value }))}>
										<option value="admin">Admin</option>
										<option value="super_admin">Super Admin</option>
									</select>
								</div>
								<div>
									<label className="block text-xs font-medium text-gray-600 mb-1">Temp Password *</label>
									<Input type="password" value={createForm.temporaryPassword}
										onChange={(e) => setCreateForm(p => ({ ...p, temporaryPassword: e.target.value }))} required />
								</div>
							</div>
							<div className="flex items-center gap-2">
								<input type="checkbox" id="sendWelcome" checked={createForm.sendWelcomeEmail}
									onChange={(e) => setCreateForm(p => ({ ...p, sendWelcomeEmail: e.target.checked }))}
									className="accent-blue-600 w-4 h-4" />
								<label htmlFor="sendWelcome" className="text-sm text-gray-700">Send welcome email</label>
							</div>
							{createError && (
								<div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
									<AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
									<p className="text-sm text-red-600">{createError}</p>
								</div>
							)}
							<div className="flex gap-3 justify-end">
								<Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
								<Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={createLoading}>
									{createLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
									Create Admin
								</Button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Reset Password Modal */}
			{resetTarget && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
					<div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-semibold">Reset Password</h3>
							<button onClick={() => setResetTarget(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
						</div>
						<p className="text-sm text-gray-600">New temporary password for <strong>{resetTarget.email}</strong>.</p>
						<Input type="password" placeholder="New temporary password" value={resetPw} onChange={(e) => setResetPw(e.target.value)} />
						<div className="flex gap-3 justify-end">
							<Button variant="outline" onClick={() => setResetTarget(null)}>Cancel</Button>
							<Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleResetPassword}
								disabled={resetLoading || !resetPw}>
								{resetLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <KeyRound className="w-4 h-4 mr-2" />}
								Reset & Send
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

// ─── Tab 3: Security & MFA ────────────────────────────────────────────────────
function SecurityTab() {
	const { setupMfa, confirmMfaSetup } = useAdminAuthContext();

	// ── Fetch FRESH profile from /me — localStorage snapshot may not have mfaEnabled ──
	const [profileLoading, setProfileLoading] = useState(true);
	const [mfaEnabled, setMfaEnabled] = useState(false);

	useEffect(() => {
		const load = async () => {
			try {
				const resp = await adminAuthAPI.getProfile();
				const data = resp.data?.data || resp.data;
				setMfaEnabled(!!data?.mfaEnabled);
			} catch {
				// Fall back to localStorage snapshot
				try {
					const raw = localStorage.getItem('admin_user_data');
					if (raw) setMfaEnabled(!!(JSON.parse(raw)?.mfaEnabled));
				} catch { }
			} finally { setProfileLoading(false); }
		};
		load();
	}, []);

	const [mfaStep, setMfaStep] = useState('idle'); // idle | loading | scan | done
	const [qrDataUrl, setQrDataUrl] = useState('');
	const [secret, setSecret] = useState('');
	const [recoveryCodes, setRecoveryCodes] = useState([]);
	const [code, setCode] = useState('');
	const [confirming, setConfirming] = useState(false);
	const [setupError, setSetupError] = useState('');
	const [copiedSecret, setCopiedSecret] = useState(false);
	const [disableCode, setDisableCode] = useState('');
	const [disabling, setDisabling] = useState(false);
	const [toast, setToast] = useState(null);

	const startMfaSetup = async () => {
		setMfaStep('loading');
		setSetupError('');
		// tempToken = null → axios interceptor attaches full JWT automatically
		const result = await setupMfa(null);
		if (!result.success) {
			setSetupError(result.error || 'Setup failed. Backend endpoint may not be live yet.');
			setMfaStep('idle');
			return;
		}
		const otpUri = result.data?.qrCodeUri || result.data?.data?.qrCodeUri || '';
		const rawSecret = result.data?.secret || result.data?.data?.secret || '';
		setSecret(rawSecret);
		if (otpUri) {
			const QRCode = (await import('qrcode')).default;
			const dataUrl = await QRCode.toDataURL(otpUri, { width: 200, margin: 1 });
			setQrDataUrl(dataUrl);
			setMfaStep('scan');
		} else {
			setSetupError('Backend did not return a QR code URI.');
			setMfaStep('idle');
		}
	};

	const handleConfirm = async (e) => {
		e.preventDefault();
		setSetupError('');
		if (code.length !== 6) { setSetupError('Enter a 6-digit code.'); return; }
		setConfirming(true);
		const result = await confirmMfaSetup(code, null);
		setConfirming(false);
		if (result.success) {
			setRecoveryCodes(result.data?.recoveryCodes || result.data?.data?.recoveryCodes || []);
			setMfaStep('done');
			setMfaEnabled(true);
		} else {
			setSetupError(result.error || 'Invalid code. Try again.');
		}
	};

	const handleDisableMfa = async () => {
		if (disableCode.length !== 6) return;
		setDisabling(true);
		try {
			await adminAuthAPI.disableMfa({ code: disableCode });
			setToast({ message: 'MFA disabled successfully', type: 'success' });
			setMfaEnabled(false);
			setDisableCode('');
		} catch (err) {
			setToast({ message: err.response?.data?.message || 'Failed to disable MFA.', type: 'error' });
		} finally { setDisabling(false); }
	};

	const copySecret = async () => {
		await navigator.clipboard.writeText(secret);
		setCopiedSecret(true);
		setTimeout(() => setCopiedSecret(false), 2000);
	};

	if (profileLoading) {
		return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>;
	}

	return (
		<div className="space-y-6">
			{toast && <Toast {...toast} onClose={() => setToast(null)} />}

			<SectionCard title="Two-Factor Authentication" icon={ShieldCheck}>
				<div className="flex items-center justify-between mb-6">
					<div>
						<p className="text-sm font-medium text-gray-900">Authenticator App (TOTP)</p>
						<p className="text-xs text-gray-500 mt-0.5">Google Authenticator, Authy or any TOTP-compatible app</p>
					</div>
					<span className={`text-sm font-semibold px-3 py-1 rounded-full
						${mfaEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
						{mfaEnabled ? '✓ Enabled' : 'Not Configured'}
					</span>
				</div>

				{!mfaEnabled && mfaStep === 'idle' && (
					<Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={startMfaSetup}>
						<ShieldCheck className="w-4 h-4 mr-2" /> Set Up MFA
					</Button>
				)}

				{mfaStep === 'loading' && (
					<div className="flex items-center gap-3 py-6 text-gray-500">
						<Loader2 className="w-5 h-5 animate-spin" /> Generating QR code…
					</div>
				)}

				{mfaStep === 'scan' && (
					<div className="space-y-5">
						<p className="text-sm text-gray-700 font-medium">Step 1 — Scan with your authenticator app</p>
						{qrDataUrl && (
							<div className="bg-white border border-gray-200 rounded-xl p-3 w-fit">
								<img src={qrDataUrl} alt="MFA QR" className="w-48 h-48" />
							</div>
						)}
						{secret && (
							<div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 flex items-center gap-2 w-fit">
								<div>
									<p className="text-xs text-gray-500 mb-1">Manual entry key</p>
									<code className="text-sm font-mono text-blue-600 tracking-widest">{secret}</code>
								</div>
								<button onClick={copySecret} className="ml-2 text-gray-400 hover:text-gray-700">
									{copiedSecret ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
								</button>
							</div>
						)}
						<form onSubmit={handleConfirm} className="space-y-3">
							<p className="text-sm text-gray-700 font-medium">Step 2 — Enter the 6-digit code to activate</p>
							<input
								type="text" inputMode="numeric" maxLength={6}
								value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
								placeholder="000000"
								className="w-40 text-center text-2xl font-mono tracking-[0.4em] border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
							{setupError && <p className="text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{setupError}</p>}
							<Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={confirming || code.length !== 6}>
								{confirming ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
								Activate MFA
							</Button>
						</form>
					</div>
				)}

				{mfaStep === 'done' && (
					<div className="space-y-4">
						<div className="flex items-center gap-3 text-green-700">
							<CheckCircle2 className="w-6 h-6" />
							<p className="font-medium">MFA activated! Save your recovery codes below.</p>
						</div>
						{recoveryCodes.length > 0 && (
							<div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
								<p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Recovery Codes</p>
								<div className="grid grid-cols-2 gap-2">
									{recoveryCodes.map((c, i) => (
										<code key={i} className="text-xs font-mono bg-white border border-gray-200 rounded px-2 py-1.5 text-green-700 text-center">{c}</code>
									))}
								</div>
							</div>
						)}
					</div>
				)}
			</SectionCard>

			{mfaEnabled && (
				<SectionCard title="Disable MFA" icon={ShieldCheck}>
					<p className="text-sm text-gray-600 mb-4">Enter a code from your authenticator app to confirm.</p>
					<div className="flex items-center gap-3">
						<input
							type="text" inputMode="numeric" maxLength={6}
							value={disableCode} onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
							placeholder="000000"
							className="w-36 text-center text-xl font-mono tracking-[0.4em] border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
						/>
						<Button variant="destructive" onClick={handleDisableMfa} disabled={disabling || disableCode.length !== 6}>
							{disabling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
							Disable MFA
						</Button>
					</div>
				</SectionCard>
			)}

			<SectionCard title="Active Sessions" icon={RefreshCw}>
				<p className="text-sm text-gray-500">Session management will be available once the backend endpoint is live.</p>
			</SectionCard>
		</div>
	);
}

// ─── Main Settings Page ───────────────────────────────────────────────────────
export default function AdminSettings() {
	const router = useRouter();
	const { isSuperAdmin } = useAdminAuthContext();

	const tabs = [
		{ id: 'config', label: 'App Configuration', icon: Settings },
		{ id: 'admins', label: 'Admin Accounts', icon: Users },
		{ id: 'security', label: 'Security & MFA', icon: ShieldCheck },
	];

	const activeTab = router.query.tab || 'config';
	const setTab = (id) => router.replace({ pathname: '/settings', query: { tab: id } }, undefined, { shallow: true });

	return (
		<Layout title="Admin Settings">
			<div className="max-w-4xl mx-auto space-y-6">
				<p className="text-gray-500 text-sm">
					Manage application configuration, admin accounts, and security settings.
				</p>

				{/* Tab bar */}
				<div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
					{tabs.map(({ id, label, icon: Icon }) => (
						<button
							key={id}
							onClick={() => setTab(id)}
							className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
								${activeTab === id ? 'bg-white shadow-sm text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
						>
							<Icon className="w-4 h-4" />
							{label}
						</button>
					))}
				</div>

				{activeTab === 'config' && <AppConfigTab isSuperAdmin={isSuperAdmin?.()} />}
				{activeTab === 'admins' && <AdminAccountsTab isSuperAdmin={isSuperAdmin?.()} />}
				{activeTab === 'security' && <SecurityTab />}
			</div>
		</Layout>
	);
}
