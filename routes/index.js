var express = require('express');
var passport = require('passport');
var router = express.Router();
var BookHandler = require('../app/controllers/bookHandler.server');
var bookHandler = new BookHandler();
var Book = require('../app/models/books.js');

//home page
router.get('/', bookHandler.getBooks, function(req, res) {
    res.render('index', {allBooks: res.locals.allBooks});
});

//profile
router.get('/profile', isLoggedIn, bookHandler.showTrades, function(req, res) {
    res.render('profile', { user: req.user });
});

//profile
router.post('/updateProf', isLoggedIn, bookHandler.showTrades, bookHandler.updateProfile);

//search for book
router.post('/search', bookHandler.search);

//add bok
router.get('/add/:bookId/:bookPlacement', isLoggedIn, bookHandler.add);

//remove book
router.get('/remove/:bookId', isLoggedIn, bookHandler.remove);

//show user books
router.get('/userBooks', isLoggedIn, bookHandler.getUserBooks);

//exchange
router.get('/exchange/:bookId', isLoggedIn, bookHandler.exchange);

//exchange final
router.get('/exchangeFinal/:bookId/:exchangeUser/:bookReceiving', isLoggedIn, bookHandler.exchangeFinal);

//decline trade
router.get('/declineTrade/:sendingId/:receivingId', isLoggedIn, bookHandler.declineTrade);

//decline trade
router.get('/acceptTrade/:sendingId/:receivingId', isLoggedIn, bookHandler.acceptTrade);

//logout
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

//authentications for facebook, twitter and google.
// Facebook routes
router.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));

router.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/profile',
    failureRedirect: '/'
}));

// Twitter routes
router.get('/auth/twitter', passport.authenticate('twitter'));

router.get('/auth/twitter/callback', passport.authenticate('twitter', {
    successRedirect: '/profile',
    failureRedirect: '/'
}));

// Google routes
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', passport.authenticate('google', {
    successRedirect: '/profile',
    failureRedirect: '/'
}));

module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    //console.log(req.path)

    res.locals.allBooks = [];
    Book.find({}, function(err, doc) {
        if (err) throw err;
        res.locals.allBooks = doc;
        res.render('index', {message: 'You need to be logged in', allBooks: res.locals.allBooks });
    });

}
