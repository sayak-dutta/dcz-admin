export const ADMIN_ROLES = {
	SUPER_ADMIN: 'super_admin',
	ADMIN: 'admin',
	MODERATOR: 'moderator',
};

export const checkRole = (adminUser, requiredRole) => {
	if (!adminUser || !adminUser.role) {
		return false;
	}

	if (requiredRole === ADMIN_ROLES.SUPER_ADMIN) {
		return adminUser.role === ADMIN_ROLES.SUPER_ADMIN;
	}

	if (requiredRole === ADMIN_ROLES.ADMIN) {
		return adminUser.role === ADMIN_ROLES.SUPER_ADMIN || adminUser.role === ADMIN_ROLES.ADMIN;
	}

	return adminUser.role === requiredRole;
};

export const isSuperAdmin = (adminUser) => {
	return checkRole(adminUser, ADMIN_ROLES.SUPER_ADMIN);
};

export const isAdmin = (adminUser) => {
	return checkRole(adminUser, ADMIN_ROLES.ADMIN);
};

export const hasAnyRole = (adminUser, roles) => {
	if (!adminUser || !adminUser.role) {
		return false;
	}
	return roles.includes(adminUser.role);
};

export const requireRole = (adminUser, requiredRole) => {
	if (!checkRole(adminUser, requiredRole)) {
		throw new Error(`Access denied. Role "${requiredRole}" required.`);
	}
};
