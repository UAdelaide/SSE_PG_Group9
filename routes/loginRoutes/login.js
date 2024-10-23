var express = require('express');
var router = express.Router();
var path = require('path');
var mysql = require('mysql');

router.get('/user/login', function(req, res, next) {
    var filePath = path.join(__dirname, '..', '..', 'public', 'Login', 'UserLogin.html');
    res.sendFile(filePath);
});

router.post('/user/login', function(req, res, next) {

    var username = req.body.username;
    var password = req.body.password;

    if (username && password) {
        var query = `SELECT * FROM Users WHERE email = "${username}"`;
        req.pool.query(query,function(error, data){

            if(data.length>0){
                for(var count=0;count<data.length;count++){
                    if(data[count].password==password){
                        req.session.volunteer_id=data[count].volunteer_id;
                        res.json({ success: true, volunteer_id: req.session.volunteer_id, user:"Volunteer" });
                    }else{
                        res.json({ success: false, errorMessage: 'Incorrect password. Please enter valid Password!' });
                    }
                }
            }else{
                res.json({ success: false, errorMessage: 'Incorrect Email id. Please enter valid Email!' });
            }

        });
    } else {
        res.json({ success: false, errorMessage: 'Please enter valid Email and Password!' });
    }


});

router.get('/manager/login', function(req, res, next) {
    var filePath = path.join(__dirname, '..', '..', 'public', 'Login', 'ManagerLogin.html');
    res.sendFile(filePath);
});

router.post('/manager/login', function(req, res, next) {

    var username = req.body.username;
    var password = req.body.password;

    if (username && password) {
        var query = `SELECT * FROM Managers WHERE email = "${username}"`;
        req.pool.query(query,function(error, data){
            if(data.length>0){
                for(var count=0;count<data.length;count++){
                    if(data[count].password==password){
                        req.session.manager_id=data[count].manager_id;
                        res.json({ success: true, manager_id: req.session.manager_id, user:"Manager"  });
                    }else{
                        res.json({ success: false, errorMessage: 'Incorrect password. Please enter valid Password!' });
                    }
                }
            }else{
                res.json({ success: false, errorMessage: 'Incorrect Email id. Please enter valid Email!' });
            }

        });
    } else {
        res.json({ success: false, errorMessage: 'Please enter valid Email and Password!' });
    }


});


router.get('/admin/login', function(req, res, next) {

    var filePath = path.join(__dirname, '..', '..', 'public', 'Login', 'AdminLogin.html');
    res.sendFile(filePath);
});

router.post('/admin/login', function(req, res, next) {

    var username = req.body.username;
    var password = req.body.password;

    if (username && password) {
        var query = `SELECT * FROM Admins WHERE email = "${username}"`;
        req.pool.query(query,function(error, data){
            if(data && data.length>0){
                for(var count=0;count<data.length;count++){
                    if(data[count].password==password){
                        req.session.admin_id=data[count].admin_id;
                        res.json({ success: true, admin_id: req.session.admin_id, user:"Admin" });
                    }else{
                        res.json({ success: false, errorMessage: 'Incorrect password. Please enter valid Password!' });
                    }
                }
            }else{
                res.json({ success: false, errorMessage: 'Incorrect Email id. Please enter valid Email!' });
            }

        });
    } else {
        res.json({ success: false, errorMessage: 'Please enter valid Email and Password!' });
    }


});


router.post('/managerLoginGOAuth', function(req, res, next) {

    console.log(req.body.user);
    var user = req.body.user;
    var username = user.email;

    if (username) {
        var query = `SELECT * FROM Managers WHERE email = "${username}"`;
        req.pool.query(query,function(error, data){
            if (error) {
                console.log(error);
                res.sendStatus(500);
                return;
              }

              console.log("In");
            if(data.length>0){
                req.session.manager_id=data[0].manager_id;
                console.log(req.session.manager_id);
                console.log("-------");
                console.log(data[0]);
                res.json({ success: true, manager_id: req.session.manager_id, user:"Manager" });
            }else{
                res.json({ success: false, check: true, message: 'Please sign in before login!' });
            }

        });
    } else {
        res.json({ success: false, message: 'Invalid username!' });
    }
});

router.post('/volunteerLoginGOAuth', function(req, res, next) {

    var username = req.body.user.email;

    if (username) {
        var query = `SELECT * FROM Volunteers WHERE email = "${username}"`;
        req.pool.query(query,function(error, data){
            if (error) {
                console.log(error);
                res.sendStatus(500);
                return;
              }

            if(data.length>0){
                for(var count=0;count<data.length;count++){
                        req.session.volunteer_id=data[count].volunteer_id;
                        res.json({ success: true, volunteer_id: req.session.volunteer_id, user:"Volunteer" });
                }
            }else{
                res.json({ success: false, check: true, message: 'Please sign in before login!' });
            }

        });
    } else {
        res.json({ success: false, message: 'Invalid username!' });
    }
});


module.exports = router;