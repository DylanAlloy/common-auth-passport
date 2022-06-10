const express = require('express');
const router = express.Router();
const User = require("../models/user")
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const config = require('../config.json');
const nodemailer = require('nodemailer');

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    session: false
},
    function (email, password, done) {
        User.getUserByEmail(email, function (err, user) {
            if (err) throw err;
            if (!user) {
                return done(null, false, { message: "Unknown Email" });
            }
            User.comparePassword(password, user.password, function (err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: "Invalid Password" });
                }
            });
        });
    }));

passport.serializeUser(function (user, done) {
    done(null, user.id);
})

passport.deserializeUser(function (id, done) {
    User.getUserById(id, function (err, user) {
        done(err, user);
    });
});

// Login
router.post('/',
    passport.authenticate('local', { failureRedirect: '/', failureFlash: false }),
    function (req, res) {
        res.send('success');
    });

// Register User
router.post('/register', function (req, res) {
    var email = req.body.email.toLowerCase();
    var password = req.body.password;
    User.find({ email: email }, function (err, data) {
        if (data.length > 0) {
            res.json({"message":'User exists'})
        } else {
            var newUser = new User({
                email: email,
                password: password
            });
            User.createUser(newUser, function (err, user) {
                if (err) {
                    res.send(err)
                } else if (config.email.active) {
                    let transport = nodemailer.createTransport(config.email.params)
                    var message = {
                        from: config.email.from,
                        to: email,
                        subject: "Registration Successful",
                        text: config.email.registrationMessage,
                        html: config.email.registrationMessage
                    };
                    transport.sendMail({ message })
                    res.json({"message":'success'})
                } else {
                    res.json({"message":'success'})
                };
            });
        }
    })
});

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

router.post('/forgot', function (req, res) {
    function makeid(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
    var email = req.body.email;
    User.find({ "email": email }, function (err, data) {
        if (err) { res.send(err) }
        var doc = data
        doc.active = makeid(12)
        User.updateOne({ "email": email }, { "active": doc.active }, function (err, response) {
            if (err) { 
                res.send(err)
            } else if (config.email.active) {
                let transport = nodemailer.createTransport(config.email.params)
                var message = {
                    from: config.email.from,
                    to: email,
                    subject: "Password Reset",
                    text: config.email.forgottenPasswordMessage,
                    html: config.email.forgottenPasswordMessage
                };
                transport.sendMail(message, function (err, resp) {
                    if (err) { console.log(err) }
                    res.json({"message":'success'})
                })
            } else {
                res.json({"message":'success'})
            };
        })
    })
});

router.get('/forgot/:active', function (req, res) {
    User.find({ "active": req.params.active }, function (err, doc) {
        if (doc.length > 0) {
            var context = { "message": "", "email": doc[0].email }
            res.json({"message":"context"})
        } else {
            var context = { "message": "This link has expired or does not exist" }
            res.json({"message":"context"})
        }
    })
});

router.get('/update/:email/:newpassword', function (req, res) {
    const bcrypt = require("bcryptjs");
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(req.params.newpassword, salt, function (err, hash) {
            var newpassword = hash;
            User.updateOne({ "email": req.params.email }, { "active": '', "password": newpassword }, function (err, response) {
                if (err) { res.send(err) };
                res.json({"message":'success'})
            })
        });
    });
})

module.exports = router;