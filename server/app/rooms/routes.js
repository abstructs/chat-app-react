const express = require('express');
const Room = require('./schema');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const path = require('path');

const router = express.Router();

const Log = require('../logs/schema');

const authorizeUser = (req, res, next) => {
    const auth = req.get('Authorization');

    if(!auth) {
        return res.status(401).send({ errors: { auth: "No credentials sent." }});
    }

    const token = auth.split(' ')[1];
    
    const cert = fs.readFileSync(path.resolve(__dirname) + '/../../private.key');

    try {
        const decoded = jwt.verify(token, cert);
        res.locals.user_id = decoded.id;
        
        next();
    } catch(err) {
        console.trace(err);
        return res.status(403).send({ errors: { auth: "Invalid credential." }});
    }
}

const validRoomName = (req, res, next) => {
    const { name } = req.body.room;

    Room.findOne({
        name: {
            $eq: name
        }
    }, (err, room) => {
        if(err) {
            console.trace(err);
            res.status(500).send();
            return;
        }
        
        if(room) {
            res.status(400).send({ errors: { name: "Room name already in use." } });
            return;
        }

        next();
    });
}

router.post('/', validRoomName, authorizeUser, (req, res) => {
    if(req.body.room) {
        const room = new Room({ ...req.body.room });

        const user_id = res.locals.user_id;

        room.user = user_id;

        // consume user id
        res.locals.user_id = undefined;

        room.save(err => {
            if(err) {
                console.trace(err);
                res.status(500).send();
                return;
            }
    
            res.status(200).send({ success: "Successfully added room.", room });
        });
    } else {
        res.status(400).send({ errors: { room: "Expected a room." }});
    }
});

router.put('/', authorizeUser, (req, res) => {
    const room = req.body.room;

    const { _id, status } = room;

    Room.findOne({ _id }, (err, room) => {
        if(err) {
            console.trace(err);
            res.status(500).send();
            return;
        }

        if(room == null) {
            console.trace(err);
            res.status(404).send({ error: "Not Found" });
            return;
        }

        room.status = status;

        room.save();

        if(room.status === "inactive") {
            const io = req.app.get("socketio");

            io.in(room.name).emit("roomInactive");
        }

        res.status(200).send({ success: "Room updated" });
    });
});
 
router.get('/', (req, res) => {
    Room.find({ status: "active" })
        .populate('user', 'username')
        .select('-password')
        .exec((err, rooms) => {
            if(err) {
                console.trace(err);
                res.status(500).send();
                return;
            }

            res.status(200).send({ rooms });
        });
});

router.post('/getRooms', authorizeUser, (req, res) => {
    const { page, rowsPerPage } = req.body;

    if(page === undefined || rowsPerPage === undefined) {
        res.status(400).send();
        return;
    }

    const rowsPerPageInt = parseInt(rowsPerPage);

    if(isNaN(rowsPerPageInt) || rowsPerPageInt > 20 || rowsPerPageInt <= 0) {
        res.status(400).end();
        return;
    }

    Room.estimatedDocumentCount((err, count) => {
        if(err) {
            console.error(err);
            res.status(500).end();
            return;
        }

        Room.find({}, {}, { skip: page * rowsPerPageInt, limit: rowsPerPageInt })
            .populate('user', 'username')
            .select('-password')
            .exec((err, rooms) => {
                if(err) {
                    console.trace(err);
                    res.status(500).send();
                    return;
                }

                res.status(200).send({ rooms, roomsCount: count });
            });
    });
});


router.get('/exists/:name', (req, res) => {
    const roomName = req.params.name;

    Room.findOne({ name: roomName })
        .exec()
        .then(room => {
            if(!room) {
                res.status(404).end();
            } else {
                res.status(200).end();
            }
        });
});

const pageSize = 5;

router.post('/messages', (req, res) => {
    const { roomName, pageNumber, beforeTime } = req.body;

    const before = new Date(beforeTime);

    Log.find({ roomName, createdAt: { $lte: before } }, {}, { skip: pageNumber * pageSize, limit: pageSize}, (err, messages) => {
        if(err) {
            console.trace(err);
            res.status(500).send();
            return;
        }

        res.send({ messages: messages.reverse() });
    })
    .select("-_id username message type")
    .sort('-createdAt');
});

router.post('/valid-name', validRoomName, (req, res) => {
    res.status(200).send({ success: "Availible room name." });
});

module.exports = router;