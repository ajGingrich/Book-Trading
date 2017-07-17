'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Query = new Schema({
    user: String,
    title: Array,
    img: Array,
    url: Array,
    author: Array
});

module.exports = mongoose.model('Query', Query);