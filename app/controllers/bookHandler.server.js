'use strict';
var Users = require('../models/users.js');

function bookHandler () {

    this.updateProfile = function(req, res, next) {
        var userName = req.body.userName,
            userCity = req.body.userCity,
            userState = req.body.userState,
            userId = req.user._id;

        ///check for google/twitter/facebook before updating
        if (req.user.facebook.id != null) {
            Users.findByIdAndUpdate(userId, { $set: { facebook: {
                id: req.user.facebook.id,
                token: req.user.facebook.token,
                email: req.user.facebook.email,
                username: req.user.facebook.username,
                name: userName,
                city: userCity,
                state: userState
            }}}, {new: true}, function (err, doc) {
                if (err) throw err;
                res.render('profile', { user: doc });
            });
        }
        else if (req.user.twitter.id != null) {
            Users.findByIdAndUpdate(userId, { $set: { twitter: {
                id: req.user.twitter.id,
                token: req.user.twitter.token,
                displayName: req.user.twitter.displayName,
                username: req.user.twitter.username,
                name: userName,
                city: userCity,
                state: userState
            }}}, {new: true}, function (err, doc) {
                if (err) throw err;
                res.render('profile', { user: doc });
            });
        }
         else if (req.user.google.id != null) {
            Users.findByIdAndUpdate(userId, { $set: { google: {
                id: req.user.google.id,
                token: req.user.google.token,
                email: req.user.google.email,
                name: userName,
                city: userCity,
                state: userState
            }}}, {new: true}, function (err, doc) {
                if (err) throw err;

                console.log(doc);
                res.render('profile', { user: doc });
            });
        }

    }

}

module.exports = bookHandler;
