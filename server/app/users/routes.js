const express = require('express');
const User = require('./schema');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const bcrypt = require('bcrypt');
const path = require('path');

const saltRounds = 10;

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

const validUsername = (req, res, next) => {
    const { username } = req.body.user;

    User.findOne({
        username: {
            $eq: username
        }
    }, (err, user) => {
        if(err) {
            console.trace(err);
            return;
        }
        
        if(user) {
            res.status(400).send({ errors: { username: "Username already in use." } });
            return;
        }

        next();
    });
}

router.post('/signup', validUsername, (req, res) => {
    const { username, password } = req.body.user;

    bcrypt.genSalt(saltRounds, (err, salt) => {
        if(err) {
            console.error(err);
            throw err;
        }

        bcrypt.hash(password, salt, (err, hash) => {
            if(err) {
                console.error(err);
                throw err
            }

            const user = new User({
                username,
                password: hash
            });
        
            user.save((err, user) => {
                if(err) {
                    console.trace(err);
                    res.status(400).send({ errors: { user: "Couldn't save user." }});
                    return;
                }

                const cert = fs.readFileSync(path.resolve(__dirname) + '/../../private.key');
        
                const token = jwt.sign({ id: user._id, username: user.username }, cert);

                res.status(200).send({ success: "User was saved.", auth: { token } });
            });
        });
    });
});

router.post('/login', (req, res) => {
    const { username, password } = req.body.user;

    User.findOne({
        username: { $eq: username }
    }, (err, user) => {
        if(err) {
            console.trace(err);
            res.status(400).send({ errors: { user: "Something went wrong." }});
            return;
        }

        if(!user) {
            res.status(400).send({ errors: { username: "Username not found." }});
            return;
        }

        bcrypt.compare(password, user.password, (err, isValid) => {
            if(isValid) {
                
                const cert = fs.readFileSync(path.resolve(__dirname) + '/../../private.key');
                const token = jwt.sign({ id: user._id, username: user.username }, cert);
                
                res.status(200).send({ success: "Valid user.", auth: { token } });
                return;
            } else {
                res.status(400).send({ errors: { password: "Invalid password." }});
                return;
            }
        });
    });
});

router.post('/valid-username', validUsername, (req, res) => {
    res.status(200).send({ success: "Availible username." });
});

router.post('/auth', authorizeUser, (req, res) => {
    res.status(200).send();
});

module.exports = router;