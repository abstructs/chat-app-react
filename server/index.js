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

// const getChatUsername = (token) => {
//     const cert = fs.readFileSync(path.resolve(__dirname) + '/private.key');

//     try {
//         const decoded = jwt.verify(token, cert);

//         return decoded.username;        
//     } catch(err) {
//         return "Anonymous";
//     }
// }

class ChatCache {
    constructor() {
        this.roomCache = {};
    }

    roomInCache(roomName) {
        return this.roomCache[roomName] !== undefined;
    }

    usernameExistsInRoom(roomName, username) {
        return this.roomInCache(roomName) && this.roomCache[roomName][username] !== undefined;
    }

    saveUserInRoomCache(roomName, username) {
        if(!this.roomInCache(roomName)) {
            this.roomCache[roomName] = {};
        }

        this.roomCache[roomName][username] = "connected";
    }

    removeUserInRoomCache(roomName, username) {
        if(this.roomInCache(roomName) && this.usernameExistsInRoom(roomName, username)) {
            delete this.roomCache[roomName][username];
        }

        if(this.roomInCache(roomName) && Object.keys(this.roomCache[roomName]).length === 0) {
            delete this.roomCache[roomName];
        }
    }

    getConnectedUsers(roomName) {
        if(this.roomInCache(roomName)) {
            return Object.keys(this.roomCache[roomName]);
        } else {
            return [];
        }
    }
}

const getJoinMessage = (username) => {
    return `${username} has joined the room`;
}

const getDisconnectMessage = (username) => {
    return `${username} has left the room`;
}

// stores current connections on memory, can be done through database if memory is a problem.
const chatCache = new ChatCache();

io.on('connection', (socket) => {
    let roomName = undefined;

    const setSocketMetaData = (roomName1, username) => {
        socket.username = username;
        roomName = roomName1;
    }

    const removeSocketMetaData = () => {
        socket.username = undefined;
        roomName = undefined;
    }

    const validChatUsername = (username) => {
        return typeof(username === "string") && username.length >= 1 && username.length <= 15;;
    }

    const joinRoom = (roomName, username) => {
        socket.join(roomName);
        chatCache.saveUserInRoomCache(roomName, username);
        setSocketMetaData(roomName, username);

        Log.create({ username, event: 'join', message: getJoinMessage(username), roomName })
            .catch(err => console.trace(err));
        
        socket.emit("joinedRoom");
        io.in(roomName).emit("newMessage", { username, type: "join", message: getJoinMessage(username) });
    }

    socket.on("connectToRoom", (data) => {
        const { username, roomName } = data;

        Room.findOne({ name: roomName }, (err, room) => {
            if(err) {
                console.trace(err);

                socket.emit("error");
                return;
            }

            if(room == null || room.status === "inactive") {
                socket.emit("error");
                return;
            } 

            if(chatCache.roomInCache(room.name) && chatCache.usernameExistsInRoom(room.name, username) || !validChatUsername(username)) {
                socket.emit("error");
                return;
            }

            if(!chatCache.roomInCache(room.name)) {
                chatCache.roomCache[room.name] = {};
            }

            joinRoom(room.name, username);
        });
    });

    socket.on("validChatUsername", (data) => {
        const { username, roomName } = data;

        if(!chatCache.usernameExistsInRoom(roomName, username)) {
            socket.emit("validUsername");
        } else {
            socket.emit("invalidUsername");
        }
    });

    socket.on('message', (data) => {
        const { message } = data;

        if(roomName !== undefined && socket.username !== undefined) {
            io.in(roomName).emit("newMessage", { username: socket.username, message, type: "message" });

            Log.create({ username: socket.username, event: 'message', message, roomName })
                .catch(err => console.trace(err));
        } else {
            socket.emit("error");
        }
    });

    socket.on("disconnect", () => {
        if(roomName !== undefined && socket.username !== undefined) {
            Log.create({ username: socket.username, event: 'disconnect', message: getDisconnectMessage(socket.username), roomName })
            .catch(err => console.trace(err));

            io.in(roomName).emit("newMessage", { username: socket.username, type: "disconnect", message: `${socket.username} has left the room` });
            chatCache.removeUserInRoomCache(roomName, socket.username);

            removeSocketMetaData();
        }
    });

    socket.on("leaveRoom", (data) => {
        if(roomName !== undefined && socket.username !== undefined) {
            chatCache.removeUserInRoomCache(roomName, socket.username);
            socket.leave(roomName);
            socket.emit("leftRoom");

            Log.create({ username: socket.username, event: 'disconnect', message: getDisconnectMessage(socket.username), roomName })
                .catch(err => console.trace(err));

            io.in(roomName).emit("newMessage", { username: socket.username, type: "disconnect", message: getDisconnectMessage(socket.username)});

            removeSocketMetaData();
        }
    });
});

const port = process.env.PORT || 8000;

app.use(cors());
app.use(bodyParser.json());

app.set('socketio', io);

app.use('/user', require('./app/users/routes'));
app.use('/room', require('./app/rooms/routes'));

app.get('/chat/users/:roomName', (req, res) => {
    const roomName = req.params.roomName;

    if(chatCache.roomInCache(roomName)) {
        const usernames = chatCache.getConnectedUsers(roomName);

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