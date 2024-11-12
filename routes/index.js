var express = require('express');
var path = require('path');
var router = express.Router();
var path = require('path');
var mysql = require('mysql');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { userInfo } = require('os');

// Middleware to check if user is logged in
function requireUserLogin(req, res, next) {
  console.log("is" + req.session.userid);
  if (req.session.userid) {
    next();
  } else {
    // If not authenticated, redirect to login page
    res.redirect('/login');
  }
}

// Protected route - /home.html
router.get('/home', requireUserLogin, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'home.html'));
});

//Protected route - On Demand Service form
router.get('/onDemandService', requireUserLogin, function (req, res, next) {
  var filePath = path.join(__dirname, '..', 'public', 'ondemandservice.html');
  res.sendFile(filePath);
});

//Protected route - Service Package Form
router.get('/package', requireUserLogin, function (req, res, next) {
  var filePath = path.join(__dirname, '..', 'public', 'servicepackage.html');
  res.sendFile(filePath);
});

// Protected route - Render form to get vaccination details while OAuth signin
router.get('/getVacDetails', (req, res) => {
  var filePath = path.join(__dirname, '..', 'public', 'VacDetailsForm.html'); // Form to obtain vaccination details
  res.sendFile(filePath);
});

// Protected route - Special General Service Form
router.get('/specialGeneralService', requireUserLogin, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'specialgeneralservice.html'));
});

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/list', function (req, res, next) {
  req.pool.getConnection(function (err, connection) {
    if (err) {
      res.sendStatus(500);
      return;
    }
    var query = 'select * from users;';
    connection.query(query, function (er, rows, fields) {
      connection.release();
      if (er) {
        res.sendStatus(500);
        return;
      }
      res.send(rows);
    });
  });
});


router.get('/login', function (req, res, next) {
  var filePath = path.join(__dirname, '..', 'public', 'Login.html'); // Form to obtain vaccination details
  res.sendFile(filePath);
});

router.get('/signup', function (req, res, next) {
  var filePath = path.join(__dirname, '..', 'public', 'Signup.html'); // Form to obtain vaccination details
  res.sendFile(filePath);
});

// POST login
router.post('/Login', function (req, res, next) {
  var username = req.body.username;
  var password = req.body.password;

  if (username && password) {
    // Use parameterized queries to avoid SQL injection
    var query = 'SELECT * FROM users WHERE email = ?';
    req.pool.query(query, [username], function (error, data) {
      if (error) {
        console.error('Database query error:', error);
        return res.json({ success: false, errorMessage: 'Database error. Please try again later.' });
      }

      // Check if any user is returned from the database
      if (data.length > 0) {
        const user = data[0]; // Get the first user from the result set

        // Compare plain text password
        if (user.password === password) { // Ideally, hash and compare passwords
          req.session.userid = user.id; // Store user ID in session
          console.log(req.session.userid);
          return res.json({ success: true, id: req.session.userid });
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

//Sign Up
router.post('/registerUser', (req, res) => {
  const { first_name, last_name, dob, country, language, mobile, email, password, vaccinated } = req.body;

  req.pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }

    // Insert the new user
    const sql = 'INSERT INTO users (first_name, last_name, dob, country, language, mobile, email, password, vaccinated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    connection.query(sql, [first_name, last_name, dob, country, language, mobile, email, password, vaccinated], (err, results) => {
      if (err) {
        console.log(err);
        connection.release();
        res.status(500).json({ success: false, message: 'Database insertion error' });
        return;
      }

      const user_id = results.insertId;
      req.session.user_id = user_id;
      connection.release();
      res.status(200).json({ success: true, user_id: req.session.user_id, message: 'User registered successfully!' });
    });
  });
});

//Google OAuth Setup
const GOOGLE_CLIENT_ID = '877734274250-5ck044eq6fjdahku4hb87rsstikr0n6h.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';

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
  function (accessToken, refreshToken, profile, done) {
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
        user.first_name = profile.name.familyName && profile.name.familyName.length > 0 ? profile.name.givenName : null;
        user.last_name = profile.name.familyName && profile.name.familyName.length > 0 ? profile.name.familyName : null,
          user.email = profile.emails[0].value,
          user.dob = data.birthdays && data.birthdays.length > 0 && data.birthdays[0].date.year && data.birthdays[0].date.month && data.birthdays[0].date.day && data.birthdays[0].date.year > 0 && data.birthdays[0].date.month > 0 && data.birthdays[0].date.day > 0 ? data.birthdays[0].date.year + '-' + data.birthdays[0].date.month + '-' + data.birthdays[0].date.day : null;
        user.gender = data.genders && data.genders.length > 0 ? data.genders[0].value : null;
        //user.address = data.addresses && data.addresses.length > 0 ? data.addresses[0].formattedValue : null;
        user.phoneNumber = data.phoneNumbers && data.phoneNumbers.length > 0 ? data.phoneNumbers[0].value.replace(/ /g, '') : null;
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
  passport.authenticate('google', {
    scope: ['profile',
      'email',
      'https://www.googleapis.com/auth/user.birthday.read',
      'https://www.googleapis.com/auth/user.gender.read',
      'https://www.googleapis.com/auth/user.phonenumbers.read']
  })
);

router.get('/auth/google/login',
  passport.authenticate('google', {
    scope: ['profile', 'email']  //Only getting required fields for security (login)
  })
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

router.get('/auth/failure', function (req, res) {
  res.send(`
      <script>
        window.close();
        alert('You have not granted the required permissions. Please try again or sign up via the form!');
      </script>
    `);
});


//OAuth Signup
router.post('/registerUserGOauth', (req, res) => {
  const { first_name, last_name, dob, country, language, mobile, email, vaccinated } = req.body;

  req.pool.getConnection(function (err, connection) {
    if (err) {
      res.sendStatus(500);
      return;
    }

    // Check if user already exists
    const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
    connection.query(checkUserQuery, [email], function (error, data) {
      if (error) {
        connection.release();
        res.status(500).json({ success: false, message: 'Database query error' });
        return;
      }

      if (data.length > 0) {
        connection.release();
        res.status(200).json({ success: false, check: true, message: 'User already exists! Please login' });
      } else {
        // Insert the new user
        const password = generatePassword(12); // Set length as per OWASP 8 - minimum, 12 - improved security
        console.log(password);

        const insertUserQuery = 'INSERT INTO users (first_name, last_name, dob, country, language, mobile, email, password, vaccinated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        connection.query(insertUserQuery, [first_name, last_name, dob, country, language, mobile, email, password, vaccinated], (insertError) => {
          if (insertError) {
            connection.release();
            console.log(insertError);
            res.status(500).json({ success: false, message: 'Database insertion error' });
            return;
          }

          // Retrieve the newly inserted user's ID and store it in session
          connection.query(checkUserQuery, [email], function (selectError, newData) {
            connection.release();
            if (selectError) {
              res.status(500).json({ success: false, message: 'Database query error' });
              return;
            }

            if (newData.length > 0) {
              req.session.userid = newData[0].id;
              res.status(200).json({ success: true, id: req.session.userid, message: 'User registered successfully!' });
            } else {
              res.json({ success: false, message: 'Registration error. Please try authentication again!' });
            }
          });
        });
      }
    });
  });
});

// OAuth Login
router.post('/userLoginGOAuth', function (req, res, next) {

  console.log("abc");
  var username = req.body.user.email;
  console.log("user" + username);

  if (username) {
    var query = `SELECT * FROM users WHERE email = "${username}"`;
    req.pool.query(query, function (error, data) {
      if (error) {
        console.log(error);
        res.sendStatus(500);
        return;
      }

      if (data.length > 0) {
        req.session.userid = data[0].id;
        res.json({ success: true, user_id: req.session.userid });
      } else {
        res.json({ success: false, check: true, message: 'Please sign in before login!' });
      }
    });
  } else {
    res.json({ success: false, message: 'Invalid username!' });
  }
});

// Render form to get vaccination details while OAuth signin
router.get('/getVacDetails', (req, res) => {
  var filePath = path.join(__dirname, '..', 'public', 'VacDetailsForm.html'); // Form to obtain vaccination details
  res.sendFile(filePath);
});

router.post('/submitForm', function (req, res, next) {
  const {
    firstName,
    lastName,
    email,
    contact,
    servicetype,
    date,
    preferedCost,
    hours,
    street,
    suburb,
    state,
    country,
    pin,
    note
  } = req.body;

  // Basic Validation (check required fields)
  if (!firstName || !lastName || !email || !contact || !servicetype || !date) {
    return res.status(400).send({ message: 'Please fill all required fields.' });
  }

  const sql = `INSERT INTO general_special_service(firstName, lastName, email, contact, servicetype, dates, preferedCost, hours, street, suburb, state, country, pin, note)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    firstName,
    lastName,
    email,
    contact,
    servicetype,
    date,
    preferedCost,
    hours,
    street,
    suburb,
    state,
    country,
    pin,
    note
  ];

  req.pool.query(sql, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: 'Error inserting data', error: err });
    } else {

      const esql = "SELECT email FROM users WHERE id = ?"
      const user_id = req.session.userid;

      req.pool.query(esql, user_id, (err, result) => {
        console.log(result);
        if (err) {
          console.log(err);
          res.status(500).send({ message: 'Error fetching email!', error: err });
        } else {
          const recipientEmails = result.map(u => u.email);
          const subject = `[HomeCarePro] - Booking Recieved: ${servicetype}`;
          const message = `
          Hi,

          We have successfully recieved your booking! Please review the details below:

          ${servicetype}
          Date: ${date}
          Duration: ${hours}
          `;
          sendEmailNotification(recipientEmails, subject, message);
        }
      });

      res.status(200).send({ message: 'Form submitted successfully!' });
    }
  });
});

// Auto password generation for OAuth login - makes it easier for admins to handle issues with account
function generatePassword(length) {
  // Define character sets for a complex password
  const lowerCase = "abcdefghijklmnopqrstuvwxyz";
  const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const specialChars = "!@#$%^&*()_+{}[]|:;<>,.?/~`-=";

  // Concatenate all character sets
  const allChars = lowerCase + upperCase + numbers + specialChars;
  let password = "";

  // Ensure password has at least one character from each set
  password += lowerCase[Math.floor(Math.random() * lowerCase.length)];
  password += upperCase[Math.floor(Math.random() * upperCase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += specialChars[Math.floor(Math.random() * specialChars.length)];

  // Fill the rest of the password length with random characters from all sets
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password to ensure randomness
  password = password.split('').sort(() => Math.random() - 0.5).join('');

  return password;
}

//Password Hash (Using the crypto dependency)
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex'); // Generate a random salt
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex'); // Hash the password with the salt
  return { salt: salt, hash: hash };
}

// // Submit form for ondemand service
// router.post('/submitOnDemand', function(req, res, next) {
//   const {
//     serviceType,
//     serviceDay,
//     times,
//     preferedCost = 0,
//     servicePerson,
//     street,
//     suburb,
//     state,
//     country,
//     pin,
//     note
//   } = req.body;

//   const user_id = req.session.userid;
//   console.log(user_id);


//   const sql = `INSERT INTO on_demand_service (user_id, servicetype, serviceday, timeslot, preferedCost, serviceperson, street, suburb, state, country, pin, issue_desc)
//               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

//   const values = [
//     user_id,
//     serviceType,
//     serviceDay,
//     times,
//     preferedCost,
//     servicePerson,
//     street,
//     suburb,
//     state,
//     country,
//     pin,
//     note
//   ];

//   req.pool.query(sql, values, (err, result) => {
//     console.log(result);
//     if (err) {
//       console.log(err);
//       res.status(500).send({ message: 'Error inserting data', error: err });
//     } else {
//       res.status(200).send({ message: 'Form submitted successfully!' });
//     }
//   });
// });

// Submit form for ondemand service
router.post('/submitOnDemand', function (req, res, next) {
  const {
    serviceType,
    email,
    date,

    serviceday,
    times,
    preferedCost,

    servicePerson,
    street,
    suburb,
    state,
    country,
    pin,
    note
  } = req.body;

  const user_id = req.session.userid;
  console.log(servicetype);

  // If times is an array, we can store it as a JSON string in the database
  const timesFormatted = JSON.stringify(times);

  const sql = `INSERT INTO on_demand_service (servicetype,email, date, times, preferedCost, serviceperson, street, suburb, state, country, pin, issue_desc)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    serviceType,
    email,
    date,
    timesFormatted, // Save times as a JSON string
    preferedCost || 0, // Default to 0 if not provided
    user_id,

    serviceday,
    JSON.stringify(times),
    preferedCost,
    servicePerson,
    street,
    suburb,
    state,
    country,
    pin,
    note
  ];

  req.pool.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send({ message: 'Error inserting data into the database.', error: err });
    } else {
      console.log('Data inserted successfully:', result);
      const esql = "SELECT email FROM users WHERE id = ?"

      req.pool.query(esql, user_id, (err, result) => {
        let serviceDate = '';
        const date = new Date();
        let day = date.getDate();
        if (serviceday === 'same') {
          serviceDate = day + '-' + date.getMonth() + '-' + date.getFullYear();
        } else {
          day += 1;
          serviceDate = day + '-' + date.getMonth() + '-' + date.getFullYear();
        }
        console.log(result);
        if (err) {
          console.log(err);
          res.status(500).send({ message: 'Error fetching email!', error: err });
        } else {
          const recipientEmails = result.map(u => u.email);
          const subject = `[HomeCarePro] - Booking Recieved: ${servicetype}`;
          const message = `
          Hi,

          We have successfully recieved your booking! Please review the details below:

          ${servicetype}
          Date: ${serviceDate}
          Time: ${times}
          Preference: ${servicePerson}

          We will try and send a service person that is of your preference but please be informed that itis not always possible to satisfy that condition.`;
          sendEmailNotification(recipientEmails, subject, message);
        }
      });

      res.status(200).send({ message: 'Form submitted successfully! Please check your email for details.' });
    }
  });
});

// Ethereal Email setup
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'joel.olson@ethereal.email',
    pass: 'EJKT4jyV14nyrRRzWA'
  }
});

// Function to send emails
function sendEmailNotification(recipients, subject, message) {
  const mailOptions = {
    from: 'notification@homecarepro.com',
    to: recipients,
    subject: subject,
    text: message,
    html: `<p>${message}</p>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return;
    }
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  });
}

// Submit form for packages
router.post('/submitPackage', function (req, res, next) {
  const {
    package,
    servicePerson,
    date,
    time,
    additionalServices,
    safetyPreferences,
    street,
    suburb,
    state,
    country,
    pin,
    note,
    consent,
    symptoms
  } = req.body;

  const user_id = req.session.userid;

  const sql = `INSERT INTO package_service(user_id, package, servicePerson, date, time, additionalServices, safetyPreferences, street, suburb, state, country, pin, note, consent, symptoms)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    user_id,
    package,
    servicePerson,
    date,
    time,
    additionalServices,
    safetyPreferences,
    street,
    suburb,
    state,
    country,
    pin,
    note,
    consent,
    symptoms
  ];

  req.pool.query(sql, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: 'Error inserting data', error: err });
    } else {

      const esql = "SELECT email FROM users WHERE id = ?"
      const user_id = req.session.userid;

      req.pool.query(esql, user_id, (err, result) => {
        console.log(result);
        if (err) {
          console.log(err);
          res.status(500).send({ message: 'Error fetching email!', error: err });
        } else {
          const recipientEmails = result.map(u => u.email);
          const subject = `[HomeCarePro] - Booking Recieved: ${package} Package`;
          const message = `
          Hi,

          We have successfully recieved your booking! Please review the details below:

          ${package}
          Date: ${date}
          Time: ${time}
          Service Person Preference: ${servicePerson}

          We will try and send a service person that is of your preference but please be informed that itis not always possible to satisfy that condition.
          `;
          sendEmailNotification(recipientEmails, subject, message);
        }
      });

      res.status(200).send({ message: 'Form submitted successfully!' });
    }
  });
});


module.exports = router;
