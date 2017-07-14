'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    facebook: {
        id: String,
        token: String,
        email: String,
        name: String,
        username: String,
        city: String,
        state: String
    },
    twitter: {
        id: String,
        token: String,
        displayName: String,
        username: String,
        name: String,
        city: String,
        state: String
    },
    google: {
        id: String,
        token: String,
        email: String,
        name: String,
        city: String,
        state: String
    }
});

module.exports = mongoose.model('User', User);