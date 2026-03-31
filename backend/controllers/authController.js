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
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '12h' });
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

        const sessionZone = zone || user.zone;
        const token = signToken({ ...user.toObject(), zone: sessionZone });

        // Send token in cookie (works cross-device)
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,      // HTTPS required for Render + Vercel
            sameSite: "None",  // cross-origin
            maxAge: 12 * 60 * 60 * 1000 // 12 hours
        });

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                zone: sessionZone
            }
        });
    } catch (err) {
        console.error("[AUTH-ERROR]", err);
        res.status(500).json({ message: err.message });
    }
};

const logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "None"
    });
    res.status(200).json({ message: "Logout successful" });
};

module.exports = { login, logout };