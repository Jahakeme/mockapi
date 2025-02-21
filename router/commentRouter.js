const {Router} = require("express");
const commentRouter = Router();
const {createComment, getComments} = require("../controller/commentController");
const authMiddleware = require('../middlewares/authMiddlware');


commentRouter.post('/comment/:id', authMiddleware, createComment);

commentRouter.get('/comments/:id', authMiddleware, getComments);

module.exports = commentRouter;