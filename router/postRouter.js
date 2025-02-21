const {Router} = require("express");
const postRouter = Router();
const {createPost, getPosts, getSinglePost, updatePost, deletePost, getPostByQuery} = require("../controller/postController");
const authMiddleware = require('../middlewares/authMiddlware');

// Apply authentication middleware to all routes 
postRouter.use(authMiddleware);

// POST /api/posts
postRouter.post("/posts", createPost);

// GET /api/posts
postRouter.get("/posts", getPosts);

// GET /api/post/:id
postRouter.get("/post/:id", getSinglePost);

// PUT /api/post/:id
postRouter.put("/post/:id", updatePost);

// DELETE /api/post/:id
postRouter.delete("/post/:id", deletePost);

// GET /api/posts/query
postRouter.get("/post/query", getPostByQuery);


module.exports = postRouter;