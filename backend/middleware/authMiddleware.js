const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Check cookie first, fallback to header for backwards compatibility
    const token = req.cookies?.token || 
                 (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);

    if (!token) return res.status(401).json({ message: 'Authentication required' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'change-me-in-prod');
        req.user = decoded;
        return next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authMiddleware;
