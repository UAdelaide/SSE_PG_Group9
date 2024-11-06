var express = require('express');
var router = express.Router();
var path = require('path');
var mysql = require('mysql');

router.get('/Login', function(req, res, next) {
    var filePath = path.join(__dirname, '..', '..', 'public',  'Login.html');
    res.sendFile(filePath);
});

// POST request for login authentication
router.post('/Login', function(req, res, next) {
    const { username, password } = req.body;

    if (username && password) {
        // Prepared statement to prevent SQL injection
        const query = `SELECT * FROM users WHERE email = ?`;

        req.pool.query(query, [username], function(error, results) {
            if (error) {
                console.error('Database query error:', error);
                return res.json({ success: false, errorMessage: 'Database error. Please try again later.' });
            }

            // Check if any user is returned from the database
            if (results.length > 0) {
                const user = results[0];

                // Compare hashed password using bcrypt
                bcrypt.compare(password, user.password, function(err, isMatch) {
                    if (err) {
                        console.error('Password comparison error:', err);
                        return res.json({ success: false, errorMessage: 'Error validating credentials.' });
                    }

                    if (isMatch) {
                        req.session.userId = user.id; // Store user ID in session
                        res.json({ success: true, id: req.session.userId });
                    } else {
                        res.json({ success: false, errorMessage: 'Incorrect password. Please enter a valid password!' });
                    }
                });
            } else {
                res.json({ success: false, errorMessage: 'Incorrect email. Please enter a valid email!' });
            }
        });
    } else {
        res.json({ success: false, errorMessage: 'Please enter both email and password!' });
    }
});

// Add this code to your main app file

  // Show All Admins
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

// router.get('/manager/login', function(req, res, next) {
//     var filePath = path.join(__dirname, '..', '..', 'public', 'Login', 'ManagerLogin.html');
//     res.sendFile(filePath);
// });

// router.post('/manager/login', function(req, res, next) {

//     var username = req.body.username;
//     var password = req.body.password;

//     if (username && password) {
//         var query = `SELECT * FROM Managers WHERE email = "${username}"`;
//         req.pool.query(query,function(error, data){
//             if(data.length>0){
//                 for(var count=0;count<data.length;count++){
//                     if(data[count].password==password){
//                         req.session.manager_id=data[count].manager_id;
//                         res.json({ success: true, manager_id: req.session.manager_id, user:"Manager"  });
//                     }else{
//                         res.json({ success: false, errorMessage: 'Incorrect password. Please enter valid Password!' });
//                     }
//                 }
//             }else{
//                 res.json({ success: false, errorMessage: 'Incorrect Email id. Please enter valid Email!' });
//             }

//         });
//     } else {
//         res.json({ success: false, errorMessage: 'Please enter valid Email and Password!' });
//     }


// });


// router.get('/admin/login', function(req, res, next) {

//     var filePath = path.join(__dirname, '..', '..', 'public', 'Login', 'AdminLogin.html');
//     res.sendFile(filePath);
// });

// router.post('/admin/login', function(req, res, next) {

//     var username = req.body.username;
//     var password = req.body.password;

//     if (username && password) {
//         var query = `SELECT * FROM Admins WHERE email = "${username}"`;
//         req.pool.query(query,function(error, data){
//             if(data && data.length>0){
//                 for(var count=0;count<data.length;count++){
//                     if(data[count].password==password){
//                         req.session.admin_id=data[count].admin_id;
//                         res.json({ success: true, admin_id: req.session.admin_id, user:"Admin" });
//                     }else{
//                         res.json({ success: false, errorMessage: 'Incorrect password. Please enter valid Password!' });
//                     }
//                 }
//             }else{
//                 res.json({ success: false, errorMessage: 'Incorrect Email id. Please enter valid Email!' });
//             }

//         });
//     } else {
//         res.json({ success: false, errorMessage: 'Please enter valid Email and Password!' });
//     }


// });


// router.post('/managerLoginGOAuth', function(req, res, next) {

//     console.log(req.body.user);
//     var user = req.body.user;
//     var username = user.email;

//     if (username) {
//         var query = `SELECT * FROM Managers WHERE email = "${username}"`;
//         req.pool.query(query,function(error, data){
//             if (error) {
//                 console.log(error);
//                 res.sendStatus(500);
//                 return;
//               }

//               console.log("In");
//             if(data.length>0){
//                 req.session.manager_id=data[0].manager_id;
//                 console.log(req.session.manager_id);
//                 console.log("-------");
//                 console.log(data[0]);
//                 res.json({ success: true, manager_id: req.session.manager_id, user:"Manager" });
//             }else{
//                 res.json({ success: false, check: true, message: 'Please sign in before login!' });
//             }

//         });
//     } else {
//         res.json({ success: false, message: 'Invalid username!' });
//     }
// });

// router.post('/volunteerLoginGOAuth', function(req, res, next) {

//     var username = req.body.user.email;

//     if (username) {
//         var query = `SELECT * FROM Volunteers WHERE email = "${username}"`;
//         req.pool.query(query,function(error, data){
//             if (error) {
//                 console.log(error);
//                 res.sendStatus(500);
//                 return;
//               }

//             if(data.length>0){
//                 for(var count=0;count<data.length;count++){
//                         req.session.volunteer_id=data[count].volunteer_id;
//                         res.json({ success: true, volunteer_id: req.session.volunteer_id, user:"Volunteer" });
//                 }
//             }else{
//                 res.json({ success: false, check: true, message: 'Please sign in before login!' });
//             }

//         });
//     } else {
//         res.json({ success: false, message: 'Invalid username!' });
//     }
// });


module.exports = router;