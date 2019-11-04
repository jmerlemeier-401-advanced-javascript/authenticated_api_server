'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const users = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  email: {type: String, unique: true },
  // role: {type: String, required: true, default:'user', enum:['admin','editor','user'] },
});

users.pre('save', async function() {
  console.log('about to save');
  if (this.isModified('password'))
  {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

/**
 * @returns {Boolean}
 */
users.statics.authenticateBasic = function(auth) {
  let query = {username:auth.username};
  return this.findOne(query)
    .then(user => user.comparePassword(auth.password))
    .catch(console.error);
};

users.statics.authenticateToken = function (token) {
  let parsedToken = jwt.verify(token, process.env.SECRET);
  let query = {
    _id: parsedToken.id,
  };
  return this.findOne(query);
};

// Compare a plain text password against the hashed one we have saved
/**
 * @returns {object} - {username, password, email}
 */
users.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password)
    .then(isValid => isValid ? this : null);
};


// Generate a JWT from the user id and a secret
users.methods.generateToken = function() {
  let tokenData = {
    id:this._id,
    capabilities: (this.acl && this.acl.capabilities) || [],
  };
  return jwt.sign(tokenData, process.env.SECRET || 'changeit' );
};

const UserModel = mongoose.model('users', users);

module.exports = UserModel;