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

const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

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
  secret: 'secur1ty',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true, // Prevents JavaScript access to session cookies
    maxAge: 3600000   // Set the session to expire after 1 hour (3600000 milliseconds)
  }
}));
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files
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


const xss = require('xss-clean');

// Use xss-clean to sanitize all incoming data
app.use(xss());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', '..', 'public')));

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

app.get('/onDemandService', function (req, res, next) {
  console.log("Route /onDemandService was accessed.");  // Confirm the route is being triggered
  var filePath = path.resolve(__dirname, '..', 'public', 'Forms', 'ondemandservice.html');
  console.log("Resolved file path:", filePath);

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    console.log("File does not exist at this path.");
    return res.status(404).send('File not found');
  }
  res.sendFile(filePath);
});


module.exports = app;