var express = require('express');
var path = require('path');
var router = express.Router();
var path = require('path');
var mysql = require('mysql');

const bcrypt = require('bcrypt');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/list', function(req, res, next) {
  req.pool.getConnection(function(err, connection) {
    if(err){
      res.sendStatus(500);
      return;
    }
    var query = 'select * from users;';
    connection.query(query, function(er, rows, fields){
      connection.release();
      if(er){
        res.sendStatus(500);
        return;
      }
      res.send(rows);
    });
  });
});


router.get('/Login', function(req, res, next) {
  var filePath = path.join(__dirname, '..', '..', 'public',  'Login.html');
  res.sendFile(filePath);
});

// POST login
router.post('/Login', function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;

  if (username && password) {
    // Use parameterized queries to avoid SQL injection
    var query = 'SELECT * FROM users WHERE email = ?';
    req.pool.query(query, [username], function(error, data) {
      if (error) {
        console.error('Database query error:', error);
        return res.json({ success: false, errorMessage: 'Database error. Please try again later.' });
      }

      // Check if any user is returned from the database
      if (data.length > 0) {
        const user = data[0]; // Get the first user from the result set

        // Compare plain text password
        if (user.password === password) { // Ideally, hash and compare passwords
          req.session. id = user.id; // Store manager ID in session
          return res.json({ success: true, id: req.session.id });
        } else {
          return res.json({ success: false, errorMessage: 'Incorrect password. Please enter a valid password!' });
        }
      } else {
        return res.json({ success: false, errorMessage: 'Incorrect email ID. Please enter a valid email!' });
      }
    });
  } else {
    return res.json({ success: false, errorMessage: 'Please enter valid email and password!' });
  }
});

module.exports = router;
