const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token; // Get token from cookie

    // Check if token is valid
    if (!token) {
        return res.status(401).json({message: 'Unauthorized'});
    }

    // Verify token and get user data
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decodedToken.id).select('-password');
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
        req.user = user; // Attach user data to request object
        next();
    } catch (error) {
        res.status(500).json({message: 'Internal server error'});
    }
};

module.exports = authMiddleware;