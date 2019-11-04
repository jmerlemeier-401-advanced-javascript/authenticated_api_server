'use strict';

// 3rd Party Resources
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const UserModel = require('../src/model/user');

// Esoteric Resources
const errorHandler = require( '../src/middleware/error.js');
const notFound = require( '../src/middleware/404.js' );


// Prepare the express app
const app = express();

// App Level MW
app.use(cors());
app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({extended:true}));

// Static Routes
// app.use('/docs', express.static('docs'));


//======= ROUTES ===========
// Basic Authentication
// 1. Define the route

app.post('/signup', (req, res, next) => {
  let user = new UserModel(req.body);
  user.save()
    .then(user => {
      req.token = user.generateToken();
      req.user = user;
      res.set('token', req.token);
      res.cookie('auth', req.token);
      res.send(req.token);
    }).catch(next);
});

app.post('/signin', (req, res) => {
  res.cookie('auth', req.token);
  res.send(req.token);
});



// 3) Creating Auth middlware that will handle any request data that relates to auth
//  Check for auth header
//  decide whether our requests are authorized.
function handleAuth(req, res, next) {
  // parse reqs for header values
  //  req.headers.authorization.split(' ');
  const [authType, authString] = req.headers.authorization.split(' ');

  switch (authType.toLowerCase()) {
    // decide whether we are using basic or bearer
    case 'basic':
      return _authBasic(authString);
    default:
      return _authError();
  }

  // attach encoding the authstring
  function _authBasic(authString) {
    let base64Buffer = Buffer.from(authString, 'base64'); // <Buffer 01 03 >
    let bufferString = base64Buffer.toString(); // jacob:mysuperpasswrd
    let [username, password] = bufferString.split(':');
    let auth = { username, password };

    return UserModel.authenticateBasic(auth)
      .then(user => _authenticate(user));
  }

  // send errors if issues occur
  function _authenticate(user) {
    if (user) {
      req.token = user.generateToken();
      req.user = user;
      next();
    } else {
      _authError();
    }

  }

  function _authError() {
    next('Auth error');
  }
}

// Catchalls
app.use(notFound);
app.use(errorHandler);

//================================
/**
 * Start Server on specified port
 * @param port {integer} (defaults to process.env.PORT)
 */
let start = (port = process.env.PORT) => {
  app.listen(port, () => {
    console.log(`Server Up on ${port}`);
  });
};

module.exports = {app,start};