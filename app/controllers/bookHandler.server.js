'use strict';
var Users = require('../models/users.js');
var Query = require('../models/queries.js');
var request = require("request");

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
                res.render('profile', { user: doc });
            });
        }

    };

    this.search = function(req,res, next) {
        var query = req.body.searchQuery;

        ///set user
        var userId = "Not available";
        if (req.user != null) {
            //need to check if its facebook/twitter/facebook
            userId = "There is a user";
        }


        var options = { method: 'GET',
            url: 'https://www.googleapis.com/books/v1/volumes',
            qs:
                { q: query,
                    key: process.env.GOOGLE_BOOKS_KEY,
                    maxResults: '40'
                },
            headers:
                { 'postman-token': process.env.POSTMAN_TOKEN,
                    'cache-control': 'no-cache' } };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            res.locals.searchArray = [];
            //only get the first 20 results
            var numBooks = 24,
                titles = [],
                imgs = [],
                urls = [],
                authors = [];

            //parse the Data
            var data = JSON.parse(body);

            //push all of the data to arrays
            for (var i=0; i<numBooks; i++) {
                //make sure they aren't undefined in specific volumes so as to not break app
                if (data.items[i] != undefined) {
                    if (data.items[i].volumeInfo.title != undefined) {
                        titles.push(data.items[i].volumeInfo.title);
                    }
                    if (data.items[i].volumeInfo.imageLinks != undefined) {
                        if (data.items[i].volumeInfo.imageLinks.thumbnail != undefined) {
                            imgs.push(data.items[i].volumeInfo.imageLinks.thumbnail);
                        }
                    }
                    if (data.items[i].volumeInfo.infoLink != undefined) {
                        urls.push(data.items[i].volumeInfo.infoLink);
                    }
                    if (data.items[i].volumeInfo.authors != undefined) {
                        if (data.items[i].volumeInfo.authors[0] != undefined) {
                            authors.push(data.items[i].volumeInfo.authors[0]);
                        }
                    }
                }
            }
            var newQuery = new Query({
                user: userId,
                title: titles,
                img: imgs,
                url: urls,
                author: authors
            });

            newQuery.save(function(err) {
                if (err) throw err;
                res.locals.searchArray = newQuery;
                res.render('searchResults');
            });
        });
    };

    this.add = function(req, res, next) {
        console.log(req.params.bookId);
        console.log(req.params.bookPlacement);

        res.render('index');
    }
}

module.exports = bookHandler;
