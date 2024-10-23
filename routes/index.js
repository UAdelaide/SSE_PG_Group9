var express = require('express');
var path = require('path');
var router = express.Router();
var webpush = require('web-push');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());

// Import the guestRoutes router
var loginRoutes = require('./loginRoutes/login');
var signUpRoutes = require('./signUpRoutes/signUp');
const session = require('express-session');

// GET home page
router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Express' });
  res.render('index',{title:'Express',session:req.session});
});


//Mount SignUp Routes
router.use('/', signUpRoutes);

//Mount Login Routes
router.use('/', loginRoutes);

module.exports = router;
