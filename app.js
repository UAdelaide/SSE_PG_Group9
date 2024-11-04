var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var createError = require('http-errors');
var logger = require('morgan');
var passport = require('passport');
var https = require('https');
const fs = require('fs');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const webpush = require('web-push');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
var session = require('express-session');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var mysql = require('mysql');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// // Enable files upload
// app.use(fileUpload({
//   createParentPath: true
// }));

// Make sure your app is using bodyParser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
    secret : 'webslesson',
    resave : false,
    saveUninitialized : true
}));
app.use(passport.initialize());
app.use(passport.session());

var dbConnectionPool = mysql.createPool({
    host: '127.0.0.1',
    user:"root",
  password:'',
    database: 'sse'
});

app.use(function(req, res, next) {
    req.pool = dbConnectionPool;
    next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Passport and sessions
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/users', usersRouter);

// Serve the homepage
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

// Error handling
app.use((req, res, next) => {
    res.status(404).sendFile(__dirname + '/public/404.html');
  });


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;