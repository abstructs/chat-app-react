require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const fs = require('fs');
const path = require('path');   
const jwt = require('jsonwebtoken');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const Log = require('./app/logs/schema');
const Room = require('./app/rooms/schema');

// server.listen(3100);

const getChatUsername = (token) => {
    const cert = fs.readFileSync(path.resolve(__dirname) + '/private.key');

    try {
        const decoded = jwt.verify(token, cert);

        return decoded.username;        
    } catch(err) {
        return "Anonymous";
    }
}

io.on('connection', (socket) => {
    const roomName = socket.handshake.query.room;
    const token = socket.handshake.query.token;

    const username = getChatUsername(token);

    Room.findOne({ name: roomName }).exec()
        .then((room) => {
            if(!room) {
                socket.disconnect();
                return;
            }
       
            socket.join(roomName);

            socket.username = username;
        
            const joinMessage = `${username} has joined the room`;
        
            Log.create({ username, event: 'join', message: joinMessage, roomName });
        
            io.in(roomName).emit('join', { username, message: joinMessage, type: 'join' });
        
            socket.on('disconnect', () => {
                const message = `${username} has left the room`;
        
                Log.create({ username, event: 'disconnect', message, roomName });
        
                io.in(roomName).emit('left', { username, message, type: 'disconnect' });
            });
        
            socket.on('message', (data) => {
                const message = data.message;
        
                Log.create({ username, event: 'message', message, roomName });
        
                io.to(roomName).emit('message', { username, message, type: 'message' });
            });
        });
});

const port = process.env.PORT || 8000;

app.use(cors());
app.use(bodyParser.json());

app.use('/user', require('./app/users/routes'));
app.use('/room', require('./app/rooms/routes'));

app.get('/chat/users/:roomName', (req, res) => {
    const roomName = req.params.roomName;

    const room = io.sockets.adapter.rooms[roomName];

    if(room) {
        const clients = room.sockets;

        const usernames = Object.keys(clients).map(clientId => {
            const clientSocket = io.sockets.connected[clientId];
    
            return clientSocket.username;
        });
    
        res.status(200).json({ usernames }).end();
    } else {
        res.sendStatus(404).end();
    }
});

// Get a list of all Chat History
app.get('/api/history', (req, res) => {
    Log.find({}, (err, logs) => {
        if(err) {
            console.error(err);
            res.sendStatus(400);
        } else {
            res.status(200).json(logs);
        }
    }).select('-_id username message roomName createdAt');
});

// Get a list Chat or Game History by Room Name
app.post('/api/roomhistory', (req, res) => {
    const roomName = req.body['roomname'];

    if(!roomName) {
        res.status(400).send("Expected param 'roomname'");
        return;
    }

    Log.find({ roomName }, (err, logs) => {
        if(err) {
            console.error(err);
            res.status(500).end();
        } else {
            res.status(200).json(logs);
        }
    }).select('-_id username message createdAt');
});

// Write a mongoose query to retrieve all event logs
// Get a list of all Events
app.get('/api/eventlog', (req, res) => {
    Log.find({}, (err, logs) => {
        if(err) {
            console.error(err);
            res.status(500).end();
        } else {
            res.status(200).json(logs);
        }
    }).select('-_id event roomName username createdAt');
});

// Write a mongoose query to retrieve all user history
app.get('/api/history/user/:username', (req, res) => {
    const username = req.params.username;

    Log.find({ username }, (err, logs) => {
        if(err) {
            console.error(err);
            res.status(500).end();
        } else {
            res.status(200).json(logs);
        }
    }).select("-_id username event message roomName createdAt");
});

// Write a mongoose query to retrieve all user history by room name
app.get('/api/history/:roomName/:username', (req, res) => {
    const roomName = req.params.roomName;
    const username = req.params.username;

    Log.find({ username, roomName }, (err, logs) => {
        if(err) {
            console.error(err);
            res.status(500).end();
        } else {
            res.status(200).json(logs);
        }
    }).select("-_id username event message createdAt");
});

app.use("/", express.static(__dirname + "/../dist/chat-app"));

app.get('*', (req, res) => {
    res.sendFile("index.html", { root: __dirname + "/../dist/chat-app-react" });
});

server.listen(port, () => console.log(`Now listening on port ${port}\n Go to domain:${port} on your browser to view the app.`));