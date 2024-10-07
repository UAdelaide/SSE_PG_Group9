var express = require('express');
var session = require('express-session');
var router = express.Router();
var path = require('path');
var mysql = require('mysql');
var passport = require('passport');
const { route } = require('express/lib/router');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const { google } = require('googleapis');

const GOOGLE_CLIENT_ID = '834084915754-oal2q2b0nfn521ekhvlo9ark0at3ri1e.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';

router.get('/user/signup', function(req, res, next) {
    var filePath = path.join(__dirname, '..', '..', 'public', 'SignUp', 'VolunteerSignUp.html');
    res.sendFile(filePath);
});

router.get('/manager/signup', function(req, res, next) {
    var filePath = path.join(__dirname, '..', '..', 'public', 'SignUp', 'ManagerSignUp.html');
    res.sendFile(filePath);
});

router.get('/getbranch', function(req, res, next) {
  var filePath = path.join(__dirname, '..', '..', 'public', 'SignUp', 'BranchForm.html');
  res.sendFile(filePath);
});

router.get('/getbranchManager', function(req, res, next) {
  var filePath = path.join(__dirname, '..', '..', 'public', 'SignUp', 'BranchFormManager.html');
  res.sendFile(filePath);
});

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8080/auth/google/callback",
    scope: ['profile',
            'email',
            'https://www.googleapis.com/auth/user.birthday.read',
            'https://www.googleapis.com/auth/user.gender.read',
            'https://www.googleapis.com/auth/user.phonenumbers.read']
  },
  function(accessToken, refreshToken, profile, done) {
    // Initialize OAuth2 client with the access token
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    // Google People API
    const service = google.people({ version: 'v1', auth: oauth2Client });

    // Fetch user details from Google People API
    service.people.get({
      resourceName: 'people/me',
      personFields: 'birthdays,genders,addresses,phoneNumbers',
    }, (err, response) => {
      if (err) {
        console.error('Error fetching user details:', err);
        return done(err);
      }

      var user = {};

      // Extract additional user details if available
      if (response && response.data) {
        const data = response.data;
        user.first_name = profile.name.familyName && profile.name.familyName.length > 0? profile.name.givenName : null;
        user.last_name = profile.name.familyName && profile.name.familyName.length > 0 ? profile.name.familyName : null,
        user.email = profile.emails[0].value,
        user.dob = data.birthdays && data.birthdays.length > 0 && data.birthdays[0].date.year && data.birthdays[0].date.month && data.birthdays[0].date.day && data.birthdays[0].date.year > 0 && data.birthdays[0].date.month > 0 && data.birthdays[0].date.day > 0 ? data.birthdays[0].date.year+'-'+data.birthdays[0].date.month+'-'+data.birthdays[0].date.day : null;
        user.gender = data.genders && data.genders.length > 0 ? data.genders[0].value : null;
        //user.address = data.addresses && data.addresses.length > 0 ? data.addresses[0].formattedValue : null;
        user.phoneNumber = data.phoneNumbers && data.phoneNumbers.length > 0 ? data.phoneNumbers[0].value.replace(/ /g , '') : null;
      }
      return done(null, user);
    });
  }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

router.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile',
                                            'email',
                                            'https://www.googleapis.com/auth/user.birthday.read',
                                            'https://www.googleapis.com/auth/user.gender.read',
                                            'https://www.googleapis.com/auth/user.phonenumbers.read'] })
);

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/failure' }),
  (req, res) => {
    res.send(`
      <script>
        window.opener.postMessage({ type: 'success', user: ${JSON.stringify(req.user)} }, '*');
        window.close();
      </script>
    `);
  }
);

router.get('/auth/failure', function(req, res){
  res.send(`
      <script>
        window.close();
        alert('You have not granted the required permissions. Please try again or sign up via the form!');
      </script>
    `);
});

router.post('/registerVolunteerGOauth', (req, res) => {
  const { first_name, last_name, contact, dob, gender, email, street, suburb, state, country, pin, branch_id, update_notification, event_notification } = req.body;

  req.pool.getConnection(function(err, connection) {
    if (err) {
      res.sendStatus(500);
      return;
    }

    // Check if user already exists
    const checkUserQuery = 'SELECT * FROM Volunteers WHERE email = ?';
    connection.query(checkUserQuery, [email], function(error, data) {
      if (error) {
        connection.release();
        res.status(500).json({ success: false, message: 'Database query error' });
        return;
      }

      if (data.length > 0) {
        connection.release();
        res.status(200).json({ success: false, check: true, message: 'Volunteer already exists! Please login' });
      } else {
        // Fetch manager_id from the branch_id
        const getManagerIdQuery = 'SELECT manager_id FROM Managers WHERE branch_id = ?';
        connection.query(getManagerIdQuery, [branch_id], (err, result) => {
          if(err) {
            connection.release();
            res.status(500).json({ success: false, message: 'Database query error' });
            return;
          }

          if(result.length === 0) {
            connection.release();
            res.status(400).json({ success: false, message: 'No manager found for this branch' });
            return;
          }

          const manager_id = result[0].manager_id;
          var temp_dob = dob ? dob : null;


          // Insert the new volunteer
          const insertUserQuery = 'INSERT INTO Volunteers (first_name, last_name, contact, dob, gender, email, street, suburb, state, country, pin, update_notification, event_notification, manager_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
          connection.query(insertUserQuery, [first_name, last_name, contact, temp_dob, gender, email, street, suburb, state, country, pin, update_notification, event_notification, manager_id], (insertError) => {
            if (insertError) {
              connection.release();
              console.log(insertError);
              res.status(500).json({ success: false, message: 'Database insertion error' });
              return;
            }

            // Retrieve the newly inserted user's ID and store it in session
            connection.query(checkUserQuery, [email], function(selectError, newData) {
              connection.release();
              if (selectError) {
                res.status(500).json({ success: false, message: 'Database query error' });
                return;
              }

              if (newData.length > 0) {
                var volunteer_id = newData[0].volunteer_id;

                const insertBranchAssociationQuery = 'INSERT INTO Volunteer_Branch_Association (role, volunteer_id, branch_id) VALUES (?, ?, ?);';
                connection.query(insertBranchAssociationQuery, ['Member', volunteer_id, branch_id], (err)=>{
                  if(err){
                    connection.release();
                    res.status(500).json({ success: false, message: 'Database (Branch) insertion error' });
                    return;
                  }
                });

                req.session.volunteer_id = newData[0].volunteer_id;
                res.status(200).json({ success: true, volunteer_id:req.session.volunteer_id, message: 'Volunteer registered successfully!' });
              } else {
                res.json({ success: false, message: 'Registration error. Please try authentication again!' });
              }
            });
          });
        });
      }
    });
  });
});


router.post('/registerManagerGOauth', (req, res) => {
  const { branch_id, first_name, last_name, secret_key, contact, street, suburb, state, country, pin, email  } = req.body;

  req.pool.getConnection(function(err, connection) {
    if (err) {
      res.sendStatus(500);
      return;
    }

    // Check if manager already exists
    const checkManagerQuery = 'SELECT * FROM Managers WHERE email = ?';
    connection.query(checkManagerQuery, [email], function(error, data) {
      if (error) {
        connection.release();
        res.status(500).json({ success: false, message: 'Database query error' });
        return;
      }

      if (data.length > 0) {
        connection.release();
        res.status(200).json({ success: false, check: true, message: 'Manager already exists! Please login' });
      } else {
        // Fetch secret key for the branch
        const getSecretKeyQuery = 'SELECT secret_key FROM Branch WHERE branch_id = ?';
        connection.query(getSecretKeyQuery, [branch_id], function(error, results, fields) {
          if (error) {
            connection.release();
            res.sendStatus(500);
            return;
          }

          if (results.length === 0) {
            connection.release(); // Release connection if branch ID is invalid
            res.status(400).json({ success: false, message: 'Invalid branch ID' });
            return;
          }

          const branchSecretKey = results[0].secret_key;

          // Validate the secret key
          if (branchSecretKey !== secret_key) {
            connection.release(); // Release connection if secret key is invalid
            res.status(400).json({ success: false, message: 'Invalid secret key' });
            return;
          }

          // Insert the manager data into the database
          var insertManagerQuery = 'INSERT INTO Managers (branch_id, first_name, last_name, contact, street, suburb, state, country, pin, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
          connection.query(insertManagerQuery, [branch_id, first_name, last_name, contact, street, suburb, state, country, pin, email], function(insertError, insertResults, insertFields) {
            if (insertError) {
              connection.release();
              console.log(insertError);
              res.status(500).json({ success: false, message: 'Database insertion error' });
              return;
            }

            // Retrieve the newly inserted manager's ID and store it in session
            const newManagerId = insertResults.insertId;
            // Update the Branch table with the new manager's ID
            const updateBranchQuery = 'UPDATE Branch SET manager_id = ? WHERE branch_id = ?';
            connection.query(updateBranchQuery, [newManagerId, branch_id], function(updateError, updateResults) {
              connection.release();
              if (updateError) {
                console.log(updateError);
                res.status(500).json({ success: false, message: 'Error updating branch with manager ID' });
                return;
              }

              res.status(200).json({ success: true, manager_id: newManagerId, message: 'Manager registered and branch updated successfully!' });
            });
          });
        });
      }
    });
  });
});




module.exports = router;