'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Book = new Schema({
    user: String,
    title: String,
    img: String,
    url: String,
    author: String
});

module.exports = mongoose.model('Book', Book);