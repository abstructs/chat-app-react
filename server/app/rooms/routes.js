const express = require('express');
const Room = require('./schema');
const jwt = require('jsonwebtoken');
const fs = require('fs');

// const io = require('../../index.js');

const path = require('path');

// socket.io.on('connection', (socket) => {
//     console.log(socket);
//     console.log('room connected');
// });

// const saltRounds = 10;

const router = express.Router();

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
            throw err;
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
                throw err;
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

        res.status(200).send({ success: "Room updated" });
    });
    
    // if(req.body.room) {
        

    //     const user_id = res.locals.user_id;

    //     room.user = user_id;

    //     // consume user id
    //     res.locals.user_id = undefined;

    //     room.save(err => {
    //         if(err) {
    //             console.trace(err);
    //             throw err;
    //         }
    
    //         res.status(200).send({ success: "Successfully added room.", room });
    //     });
    // } else {
    //     res.status(400).send({ errors: { room: "Expected a room." }});
    // }
});
 
router.get('/', (req, res) => {
    Room.find({})
        .populate('user', 'username')
        .select('-password')
        .exec((err, rooms) => {
            if(err) {
                console.trace(err);
                throw err;
            }

            res.status(200).send({ rooms });
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

router.post('/valid-name', validRoomName, (req, res) => {
    res.status(200).send({ success: "Availible room name." });
});

module.exports = router;