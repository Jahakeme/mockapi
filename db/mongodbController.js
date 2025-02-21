const mongoose = require('mongoose');


// Connect to MongoDB
const connectdb = async (req, res) => {
    try {
        await mongoose.connect(process.env.MONGODB);
    } catch (err) {
        return console.error(err);
    }
    console.log('Connected to MongoDB');
};

module.exports = connectdb;