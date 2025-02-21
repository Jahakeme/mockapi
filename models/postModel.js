const mongoose = require('mongoose');


const postModel = new mongoose.Schema(
    {
        title:{
            type: String,
            required: true
        },
        content:{
            type: String,
            required: true
        },
        numberOfLikes:{
            type: Number,
            default: 0
        },
        author:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
    }, 
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Post', postModel);