// Build model and scheme to save socket.io events
// Build model and schema to save user history 

const mongoose = require('mongoose');

const url = process.env.DB_URL;

mongoose.connect(url, { useNewUrlParser: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

const logSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    event: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    roomName: {
        type: String,
        required: true
    },
}, { timestamps: true });


module.exports = mongoose.model('Log', logSchema);