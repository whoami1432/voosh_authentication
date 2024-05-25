// Middleware to validate access token
const ensureAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) {
		// Token is valid, proceed
		return next();
	}
	return res.status(401).json({
		Message: 'Unauthorized access.'
	});
};

module.exports = { ensureAuthenticated };
