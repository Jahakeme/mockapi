const mongoose = require('mongoose');
const Post = require('../models/postModel');
const userModel = require('../models/userModel');

const createPost = async (req, res, next) => {
    // Ensure user is authenticated
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }
    
    // Extract post data from request body
    const { title, content } = req.body;
    const author = req.user._id; // Extracted from authMiddleware
    
    try {
        // Validate input
        if (!title || !content) {
            return res.status(400).json({ message: "Title and content are required." });
        }

        // Create new post
        const newPost = new Post({
            title,
            content,
            author
        });

        // Save post to database
        await newPost.save();

        // Update user's posts array
        await userModel.findByIdAndUpdate(author, { $push: { posts: newPost._id } });
        res.status(201).json({ success: true, message: "Post created successfully!", post: newPost });
    } catch (error) {
        next(error); // Pass error to errorHandler middleware
    }
};

const getPosts = async (req, res, next) => {
    // Ensure user is authenticated
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    try {
        const posts = await Post.find().populate('author', 'username'); 
        res.status(200).json(posts);
    } catch (error) {
        next(error); 
    }
};

const getSinglePost = async (req, res, next) => {
     // Ensure user is authenticated
     if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    const requestId = req.params._id;

    // Check if the ID is valid
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
        return res.status(400).json({ message: 'Invalid post ID' });
    }

    try {
        const post = await Post.findById(requestId).populate('author', 'username');
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json(post);
    } catch (error) {
        next(error); // Pass error to errorHandler middleware
    }
};

const updatePost = async (req, res, next) => {
    // Ensure user is authenticated
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }
    const { id } = req.params;

    try {
        // Check if the ID is valid
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if the authenticated user is the creator of the post
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Forbidden. You can only update your own posts.' });
        }

        // Update the post
        const updatedPost = await Post.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json({ message: 'Post updated successfully', post: updatedPost });
    } catch (error) {
        next(error); // Pass error to errorHandler middleware
    }
};

const deletePost = async (req, res, next) => {
    // Ensure user is authenticated
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }
    const { id } = req.params;
    
    try {
        // Check if the ID is valid
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if the authenticated user is the creator of the post
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Forbidden. You can only delete your own posts.' });
        }

        // Delete the post
        await Post.findByIdAndDelete(id);
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        next(error); // Pass error to errorHandler middleware
    }
};

const getPostByQuery = async (req, res, next) => {
    const {search} = req.query;
    
    try {
        // Check if the search query is provided
        if (!search) {
            return res.status(400).json({message: "Search query is required"});
        }
        const searchWords = search.split(' ');

        // Perform search query on title field in the database, ignoring case.
        const querybySearch = {
            $or: searchWords.map(eachWord => ({
                content: {$regex: eachWord, $options: 'i'}
            }))
        };
        const posts = await Post.find(querybySearch);
        res.status(200).json(posts);
    } catch (error) {
        next(error);
    }

};


module.exports = {createPost, getPosts, getSinglePost, updatePost, deletePost, getPostByQuery}; 