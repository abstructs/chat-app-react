const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const url = process.env.DB_URL;

mongoose.connect(url, { useNewUrlParser: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        required: true,
        enum: ["active", "inactive"]
    }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);