'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Trade = new Schema({
    userSending: String,
    userReceiving: String,
    bookSending: String,
    bookReceiving: String
});

module.exports = mongoose.model('Trade', Trade);