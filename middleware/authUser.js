'use strict';

const authenticate = require('basic-auth');
const { User } = require('../models');
const bcrypt = require('bcryptjs');

exports.authenticateUser = async (req, res, next) => {
  let message;
  const credentials = authenticate(req);

  if (credentials) {
    const user = await User.findOne({
      where: {
        emailAddress: credentials.name
      }
    });
    if (user) {
      const authenticated = bcrypt.compareSync(credentials.pass, user.password);
      if (authenticated) {
        req.currentUser = user;
      } else {
        message = 'Authentication failure';
      }
    } else {
      message = 'User not found';
    }
  } else {
    message = 'Authorization header not found';
  }

  if (message) {
    console.log(message);
    res.status(401).json({ message: 'Access Denied'});
  } else {
    next();
  }
}