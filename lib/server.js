'use strict';

// 3rd Party Resources
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const UserModel = require('../src/model/user');
const ImageModel = require('../src/model/image');

// Esoteric Resources
const errorHandler = require( '../src/middleware/error.js');
const notFound = require( '../src/middleware/404.js' );

// Prepare the express app
const app = express();

// Docs
// Add the swagger /api-docs route to the server
const swagger = require('../docs/swagger');
swagger(app);

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

/**
 * @typedef User
 * @property {string} username.required
 * @property {string} password.required
 * @property {string} email
 */

/**
 * Returns a token when a json object with username, password,
 * and email is sent in the request body.
 * 
 * @route POST /signup
 * @param {User.model} user.body.required
 * @returns {string} 200 the generated token
 * @produces application/json
 */
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

/**
 * Returns a token in exchange for a username and password encoded
 * into a base64 string in an authorization header.
 * 
 * @route POST /signin
 * @returns {string} 200 a token for the user and session
 * @produces application/json
 * @security basicAuth
 */
app.post('/signin', handleAuth, (req, res) => {
  res.cookie('auth', req.token);
  res.send(req.token);
});

/**
 * @typedef Image
 * @property {string} title.required
 * @property {string} user_id.required
 * @property {string} description
 * @property {string} url.required
 * @property {Date} created_at
 */

/**
 * Returns all images in the DB
 * 
 * @route GET /images
 * @returns {array.<Image>} 200 image record
 * @produces application/json
 * @security JWT
 */
app.get('/images', handleAuth, (req, res, next) => {
  ImageModel.get()
    .then(results => {
      res.json(results);
    })
    .catch(next);
});

/**
 * Returns ONE image from the database with a matching _id passed
 * as id in a request parameter.
 * 
 * @route GET /image/{id}
 * @param {string} id.path.required - id of the image to return
 * @returns {Image.model} 200 image record
 * @produces application/json
 * @security JWT
 */
app.get('/image/:id', handleAuth, (req, res, next) => {
  ImageModel.get(req.params.id)
    .then(records => res.json(records[0]))
    .catch(next);
});

/**
 * Create a new `image` that is saved to the database.
 * 
 * @route POST /images
 * @param {Image.model} image.body.required - the new image
 * @returns {Array.<Image>} 200 Array of image records
 * @consumes application/json
 * @produces application/json
 * @security JWT
 */
app.post('/images', handleAuth, (req, res, next) => {
  ImageModel.post(req.body)
    .then(result => res.json(result))
    .catch(next);
});

// 3) Creating Auth middleware that will handle any request data that relates to auth
//  Check for auth header
//  decide whether our requests are authorized.

/**
 * Auth middleware that handles request data relating to 
 * auth.  This handles both basic and bearer auth.
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
function handleAuth(req, res, next) {
  // parse reqs for header values
  //  req.headers.authorization.split(' ');
  if (!req.headers.authorization) {
    return _authError();
  }
  const [authType, authString] = req.headers.authorization.split(' ');

  switch (authType.toLowerCase()) {
  // decide whether we are using basic or bearer
  case 'basic':
    return _authBasic(authString);
  case 'bearer':
    return _authBearer(authString);
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

  function _authBearer(authString) {
    return UserModel.authenticateToken(authString)
      .then(user => _authenticate(user))
      .catch(next);
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
 *
 * @param {integer} [port=process.env.PORT]
 */
let start = (port = process.env.PORT) => {
  app.listen(port, () => {
    console.log(`Server Up on ${port}`);
  });
};

module.exports = {app,start};