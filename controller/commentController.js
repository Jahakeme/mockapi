const mongoose = require('mongoose');
const Comment = require('../models/commentModel');


const createComment = async (req, res, next) => {
    // Ensure user is authenticated
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }
    
    // Extract comment data from request body
    const { content } = req.body;
    const postId = req.params.id;
    const userId = req.user._id; // Extracted from authMiddleware

    // Trim content of comment and check if comment is empty
    if (!content || content.trim() === '') {
        return res.status(400).json({ message: 'Comment cannot be empty.' });
    }

    try {
        const comment = new Comment({
            ...req.body,
            author: userId,
            post: postId
        });
        
        // Save the comment to the database
        await comment.save();
        
        // Return the created comment
        res.status(201).json(comment);
    } catch (error) {
        next(error);    
    }
}

const getComments = async (req, res, next) => {
    // Ensure user is authenticated
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    // Get the post ID from the request parameters
    const postId = req.params.id;
    
    try {
        // Find all comments for a post
        const comments = await Comment.find({ post: postId }).populate('author', 'username -_id');
        ;
        
        // Return the comments
        res.status(200).json(comments);    
    } catch (error) {
        next(error);
    }
}

module.exports = {createComment, getComments};