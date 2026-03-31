const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

const signToken = (user) => {
    const payload = {
        id: user._id,
        role: user.role,
        zone: user.zone,
        name: user.name,
        email: user.email
    };
    return jwt.sign(payload, process.env.JWT_SECRET || 'change-me-in-prod', { expiresIn: '12h' });
};

const login = async (req, res) => {
    console.log(`[AUTH-CTRL] Login attempt for: ${req.body.email}`);
    try {
        const { email, password, zone } = req.body;
        const normalizedEmail = (email || '').toLowerCase();
        const user = await User.findOne({ email: normalizedEmail, isActive: true });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password || '', user.passwordHash);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        // Allow caller to set operational zone if provided; otherwise default to user.zone
        const sessionZone = zone || user.zone;
        const token = signToken({ ...user.toObject(), zone: sessionZone });

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                zone: sessionZone
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { login };
