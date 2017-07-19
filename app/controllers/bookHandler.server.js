'use strict';
var Users = require('../models/users.js');
var Query = require('../models/queries.js');
var Book = require('../models/books.js');
var Trade = require('../models/trades.js');
var request = require("request");
var _ = require('lodash');

function bookHandler () {

    this.getBooks = function(req, res, next) {
        res.locals.allBooks = [];
        Book.find({}, function(err, doc) {
            if (err) throw err;
            res.locals.allBooks = doc;
            return next();
        });
    };

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

        var userId = req.user._id;
        var bookId = req.params.bookId;
        var bookPlacement = req.params.bookPlacement;

        //get all the appopraite information and then save
        ///first look up Query
        Query.findById(bookId, function(err, doc) {
           if (err) throw err;

           var title = doc.title[bookPlacement],
               img = doc.img[bookPlacement],
               url = doc.url[bookPlacement],
               author = doc.author[bookPlacement];

            var newBook = new Book({
                user: userId,
                title: title,
                img: img,
                url: url,
                author: author
            });

            newBook.save(function(err) {
                if (err) throw err;
                var savedBook = newBook;
                ///get all of user's books
                Book.find({user: userId}, function(err, doc) {
                  if (err) throw err;
                  res.render('myBooks', {myBooks: doc});
                });

            });

        });
    };

    this.getUserBooks = function(req, res, next) {
        var userId = req.user._id;

        //find user's book
        Book.find({user: userId}, function(err, doc) {
            if (err) throw err;
            res.render('myBooks', {myBooks: doc});
        });
    };

    this.remove = function(req, res, next) {
        var bookId = req.params.bookId;
        var userId = req.user._id;

        //find book to remove
        Book.findByIdAndRemove(bookId, function(err, doc) {
            if (err) throw err;
            //return all the other books
            Book.find({user: userId}, function(err, doc) {
                if (err) throw err;
                res.render('myBooks', {myBooks: doc});
            });
        });
    };

    this.exchange = function(req, res, next) {
        var bookId = req.params.bookId;
        var userId = req.user._id;

        //find user's book
        Book.find({user: userId}, function(err, doc) {
            if (err) throw err;

            ///find book being traded
            Book.findById(bookId, function(err, book) {
                if (err) throw err;

                ///check that user isn't trading their own book
                if (book.user == userId) {
                    res.locals.allBooks = [];
                    Book.find({}, function(err, doc) {
                        if (err) throw err;
                        res.locals.allBooks = doc;
                        res.render('index', {message: "You can't trade your own book", allBooks: res.locals.allBooks });
                    });
                }
                else {
                    res.render('exchange', {
                        myBooks: doc,
                        exchangeBook: book,
                        bookReceiving: bookId
                    });
                }
            });
        });
    };

    this.exchangeFinal = function(req, res, next) {
        var exchangeUser = req.params.exchangeUser;
        var bookSending = req.params.bookId;
        var bookReceiving = req.params.bookReceiving;
        var userId = req.user._id;

        var newTrade = new Trade({
            userSending: userId,
            userReceiving: exchangeUser,
            bookSending: bookSending,
            bookReceiving: bookReceiving
        });

        //render myBooks with Trade message
        Book.find({user: userId}, function(err, doc) {
            if (err) throw err;

            newTrade.save(function(err) {
                if (err) throw err;
                res.render('myBooks', {
                    myBooks: doc,
                    message:"Your trade request has been sent"
                });
            });

        })
    };

    this.showTrades = function(req,res, next) {
        var userId = req.user._id;

        ///get trades for userSending and userReceiving
        Trade.find({$or: [{userSending: userId}, {userReceiving:userId}]}, function(err, doc) {
            if (err) throw err;
            console.log(doc);

            /// there are trades
            if (doc.length > 0) {

                ////push all of the ids into an array in order to return array
                var sendingArray = [];
                var receivingArray = [];
                for (var i=0; i<doc.length; i++) {
                    sendingArray.push(doc[i].bookSending);
                    receivingArray.push(doc[i].bookReceiving);
                }

                //find sending books using array
                Book.find({_id: {$in: sendingArray}}, null,  function(err, sendingBooks) {
                    if (err) throw err;

                    //sort the files to same order as array
                    sendingBooks.sort(function (a, b) {
                        return _.findIndex(sendingArray, function (id) { return a._id.equals(id); }) -
                            _.findIndex(sendingArray, function (id) { return b._id.equals(id); });
                    });
                    res.locals.sendingBooks = sendingBooks;

                    //find receiving books using array
                    Book.find({_id: {$in: receivingArray}}, null,  function(err, receivingBooks) {
                        if (err) throw err;

                        //sort the files to same order as array
                        receivingBooks.sort(function (a, b) {
                            return _.findIndex(receivingArray, function (id) { return a._id.equals(id); }) -
                                _.findIndex(receivingArray, function (id) { return b._id.equals(id); });
                        });

                        res.locals.receivingBooks = receivingBooks;
                        ///find tradeId for each book
                        return next();
                    });
                });
            }
            else {
                res.locals.sendingBooks = false;
                res.locals.receivingBooks = false;
                return next();
            }
        });

    };

    this.declineTrade = function(req, res, next) {
        var sendingId = req.params.sendingId;
        var receivingId = req.params.receivingId;

        //find by both receiving and sending and remove
        Trade.findOneAndRemove({bookSending: sendingId, bookReceiving: receivingId}, function(err) {
            if (err) throw err;
            res.redirect('/profile');
        });

    };

    this.acceptTrade = function(req, res, next) {

        var sendingId = req.params.sendingId;
        var receivingId = req.params.receivingId;

        Trade.findOne({bookSending: sendingId, bookReceiving: receivingId}, function(err, doc) {
            if (err) throw err;

            ///make sure user isn't accepting their own trade
            if (req.user._id != doc.userSending) {
                ///remove trade before update books
                Trade.findOneAndRemove({bookSending: sendingId, bookReceiving: receivingId}, function(err) {
                    if (err) throw err;

                    //now update books
                    ///change User Id in sending book
                    Book.findByIdAndUpdate(sendingId, {user: doc.userReceiving}, function(err) {
                        if (err) throw err;

                        //change User Id in receiving book
                        Book.findByIdAndUpdate(receivingId, {user: doc.userSending}, function(err) {
                            if (err) throw err;
                            res.redirect('/profile');
                        });
                    });
                });
            }
            else {
                res.redirect('/profile');
            }
        });
    };
}

module.exports = bookHandler;
