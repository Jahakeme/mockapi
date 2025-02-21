const express = require('express');
const cookieParser = require('cookie-parser');
const connectdb = require('./db/mongodbController');
const error = require('./middlewares/errorhandler');
const postRouter = require('./router/postRouter');
const userRouter = require('./router/userRouter');
const commentRouter = require('./router/commentRouter');


// Create an express app
const app = express();
require('dotenv').config();
const port = process.env.PORT;

// Connect to MongoDB
connectdb(); 

// Middleware
app.use(express.json());
app.use(express.urlencoded({extended: true})); 
app.use(cookieParser()); // Cookie parser middleware

// Import routes
app.use('/api', userRouter); 
app.use('/api', postRouter); 
app.use('/api', commentRouter);


app.use(error); // Error handling middleware
app.listen(port, ()=> {console.log("Listening")});