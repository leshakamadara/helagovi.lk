// Role-based access control middleware
export const user = (req, res, next) => {
	if (req.user && req.user.role === 'user') {
		return next();
	}
	return res.status(403).json({ message: 'User access required.' });
};

export const agent = (req, res, next) => {
	if (req.user && req.user.role === 'agent') {
		return next();
	}
	return res.status(403).json({ message: 'Agent access required.' });
};

export const admin = (req, res, next) => {
	if (req.user && req.user.role === 'admin') {
		return next();
	}
	return res.status(403).json({ message: 'Admin access required.' });
};
