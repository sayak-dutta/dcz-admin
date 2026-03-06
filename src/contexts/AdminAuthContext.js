import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { isSuperAdmin, isAdmin } from '@/lib/permissions';

const AdminAuthContext = createContext();

export const useAdminAuthContext = () => {
	const context = useContext(AdminAuthContext);
	if (!context) {
		throw new Error('useAdminAuthContext must be used within an AdminAuthProvider');
	}
	return context;
};

export const AdminAuthProvider = ({ children }) => {
	const adminAuth = useAdminAuth();
	const [isInitialized, setIsInitialized] = useState(false);

	useEffect(() => {
		// Mark as initialized once the auth check is complete
		if (!adminAuth.loading) {
			setIsInitialized(true);
		}
	}, [adminAuth.loading]);

	const value = {
		...adminAuth,
		isInitialized,
		isSuperAdmin: () => isSuperAdmin(adminAuth.adminUser),
		isAdmin: () => isAdmin(adminAuth.adminUser),
	};

	return (
		<AdminAuthContext.Provider value={value}>
			{children}
		</AdminAuthContext.Provider>
	);
};
