const mongoose = require('mongoose');

const url = process.env.DB_URL;

mongoose.connect(url, { useNewUrlParser: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 15
    },
    password: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('User', userSchema);