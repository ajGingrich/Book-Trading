'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Books = new Schema ({
    title: String,
    img: String,
    url: String,
    price: String
});

var User = new Schema({
    facebook: {
        id: String,
        token: String,
        email: String,
        name: String,
        username: String,
        city: String,
        state: String,
        books: [Books]
    },
    twitter: {
        id: String,
        token: String,
        displayName: String,
        username: String,
        name: String,
        city: String,
        state: String,
        books: [Books]
    },
    google: {
        id: String,
        token: String,
        email: String,
        name: String,
        city: String,
        state: String,
        books: [Books]
    }
});

module.exports = mongoose.model('User', User);