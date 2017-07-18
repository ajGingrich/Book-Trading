'use strict';
var Users = require('../models/users.js');
var Query = require('../models/queries.js');
var Book = require('../models/books.js');
var Trade = require('../models/trades.js');
var request = require("request");

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
        ///get userId for facebook/twitter/google
        /*if (req.user.facebook.id != null) {
            userId = req.user.facebook.id
        }
        else if (req.user.twitter.id != null) {
            userId = req.user.twitter.id;
        }
        else if (req.user.google.id != null) {
            userId = req.user.google.id;
        }*/

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
        /*var userId;
        ///get userId for facebook/twitter/google
        if (req.user.facebook.id != null) {
            userId = req.user.facebook.id
        }
        else if (req.user.twitter.id != null) {
            userId = req.user.twitter.id;
        }
        else if (req.user.google.id != null) {
            userId = req.user.google.id;
        }*/
        var userId = req.user._id;

        //find user's book
        Book.find({user: userId}, function(err, doc) {
            if (err) throw err;
            res.render('myBooks', {myBooks: doc});
        });
    };

    this.remove = function(req, res, next) {
        var bookId = req.params.bookId;

        /*var userId;
        ///get userId for facebook/twitter/google
        if (req.user.facebook.id != null) {
            userId = req.user.facebook.id
        }
        else if (req.user.twitter.id != null) {
            userId = req.user.twitter.id;
        }
        else if (req.user.google.id != null) {
            userId = req.user.google.id;
        }*/
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

        /*var userId;
        ///get userId for facebook/twitter/google
        if (req.user.facebook.id != null) {
            userId = req.user.facebook.id
        }
        else if (req.user.twitter.id != null) {
            userId = req.user.twitter.id;
        }
        else if (req.user.google.id != null) {
            userId = req.user.google.id;
        }*/

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
                    res.render('exchange', {myBooks: doc, exchangeBook: book});
                }
            });
        });
    };

    this.exchangeFinal = function(req, res, next) {
        var exchangeUser = req.params.exchangeUser;
        var bookId = req.params.bookId;
        var userId = req.user._id;

        /*var userId;

        ///get userId for facebook/twitter/google
        ///why didn't i just use id of doc?! fix?! save a lot of code
        if (req.user.facebook.id != null) {
            userId = req.user.facebook.id
        }
        else if (req.user.twitter.id != null) {
            userId = req.user.twitter.id;
        }
        else if (req.user.google.id != null) {
            userId = req.user.google.id;
        }*/

        var newTrade = new Trade({
            userSending: userId,
            userReceiving: exchangeUser,
            bookId: bookId
        });

        //render myBooks with Trade message
        Book.find({user: userId}, function(err, doc) {
            if (err) throw err;

            newTrade.save(function(err) {
                if (err) throw err;
                res.render('myBooks', {myBooks: doc, message:"Your trade request has been sent"});
            });

        })
    };

    this.showTrades = function(req,res, next) {
        console.log(req.user._id);
        return next();
    };
}

module.exports = bookHandler;
