'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Trade = new Schema({
    userSending: String,
    userReceiving: String,
    bookId: String
});

module.exports = mongoose.model('Trade', Trade);