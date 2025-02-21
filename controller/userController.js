const mongoose = require('mongoose');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const generateToken = require('../jwt/tokenGeneration');

// Create a user
const signup = async (req, res, next) => {
    const {password, email, username} = req.body;
    if (!password ||!email ||!username) {
        return res.status(400).json({message: 'Please provide all required fields'});
    } 

    try {
        // Check if user with inputted email address already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(409).json({message: 'User already exists'});
        }
        const saltRounds = bcrypt.genSaltSync(10); // generate salt
        const hashedPassword = bcrypt.hashSync(password, saltRounds); // hash password
        const newUser = new User({...req.body, password: hashedPassword, profile: {}});
        await newUser.save();
        res.json(newUser);
    } catch (error) {
        next (error);
    }
};

// Update a user's profile
const updateProfile = async (req, res, next) => {
    const userId = req.user.id;
    const requestId = req.params.id;
    const {country, phoneNumber, city, bio} = req.body;
    try {
        if (userId === requestId) {
            const user = await User.findByIdAndUpdate(requestId, 
                {
                    $set: {
                        "profile.country": country,
                        "profile.phoneNumber": phoneNumber,
                        "profile.city": city,
                        "profile.bio": bio
                    }
                }, {new: true});
            }       
    } catch (error) {
        next(error);
    }
    
};

// Login an existing user
const login = async (req, res, next) => {
    const {email, password} = req.body;
    if (!email ||!password) {
        return res.status(400).json({message: 'Please provide all required fields'});
    }
    try {
       const user = await User.findOne({email});
        if (!user) {
              return res.status(404).json({message: 'User does not exist. Please sign up.' });
         } 
        const comparison = await bcrypt.compare(password, user.password);
        if (!comparison) {
            return res.status(401).json({message: 'Email address or password is incorrect'});
        }
        const token = generateToken(user._id); // generate token
        const {password: _, ...userWithoutPassword} = user.toObject(); // remove password from user object

        // Set the cookie to the client-side browser
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict', 
            maxAge: 3600000
        });
        res.status(200).json({message: 'Logged in successfully', user: userWithoutPassword});
    } catch (error) {
        next(error);
    }
};    

// Get a single user from the database
const getSingleUser = async (req, res, next) => {
     // Ensure user is authenticated
     if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    // Get user by ID from the database
    const {id} = req.params;

    // Check if the ID is valid 
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }

    try {
        // Fetch user, excluding sensitive fields
        const user = await User.findById(id).select('-password -email');

        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
        res.json(user);
        
    } catch (error) {
        next(error); // Pass error to the error handler middleware
    }
}  

// Update user information in the database
const updateUser = async (req, res, next) => {
    // Ensure user is authenticated
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }
    const {id} = req.params;
    const updatedFields = req.body;
    
    // Check if the ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    try {
        const user = await User.findByIdAndUpdate(id, updatedFields, {new: true});
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
        res.json(user);
    } catch (error) {
        next(error);
    }
};

// Delete user from the database
const deleteUser = async (req, res, next) => {
    // Ensure user is authenticated
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }
    const {id} = req.params;

    // Check if the authenticated user is the same as the user to be deleted
    if (req.user.id !== id) {
        return res.status(403).json({ message: 'Forbidden. You can only delete your own account.'});
    }
    
    // Delete user from the database
    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
        res.json({message: 'User deleted successfully'});
    } catch (error) {
        next(error);
    }
}

module.exports = {signup, login, getSingleUser, updateUser, deleteUser};
