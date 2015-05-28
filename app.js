var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('./oauth');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
var session = require('express-session');
var uuid = require('node-uuid').v1;


var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    genid: function(req) {
        return uuid() // use UUIDs for session IDs 
    },
    secret: 'keyboard cat'
}))

app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);
app.use('/users', users);

passport.use(new FacebookStrategy({
    clientID: config.clientID,
    clientSecret: config.clientSecret,
    callbackURL: config.callbackURL
}, function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
        done(null, profile);
    });
}));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/success',
    failureRedirect: '/error'
}));

app.get('/success', function(req, res, next) {
    if (req.user.id === '811513274') {
        res.redirect('/admin');
    } else {
        res.send('Success');
    }
});

app.get('/error', function(req, res, next) {
    res.send("Error logging in.");
});

app.get('/admin', function(req, res, next) {
    if (req.user.id !== '811513274') {
        res.redirect('/');
    } else {
        res.send('Amdmin Page');
    }
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
