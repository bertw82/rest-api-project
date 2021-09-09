'use strict';

const express = require('express');
const router = express.Router();
const { User, Course } = require('./models');
const bcrypt = require('bcryptjs');

// Handler function to wrap each route.
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      // Forward error to the global error handler
      next(error);
    }
  }
}

// GET route to return all properties and values from an authenticated user 
router.get('/users', asyncHandler(async (req,res) => {
  let users = await User.findAll();
  res.json(users);
}));

// POST route to create a new user
router.post('/users', asyncHandler(async (req,res) => {
  try {
    const user = req.body;
    const errors = [];
    if (!user.firstName) {
      errors.push('Please provide a first name');
    }
    if (!user.lastName) {
      errors.push('Please provide a last name');
    }
    if (!user.emailAddress) {
      errors.push('Please provide an email address');
    }
    let password = user.password;
    if (!password) {
      errors.push('Please provide a password');
    } else if (password.length < 8 || password.length > 20) {
      errors.push('Your password should be between 8 and 20 characters')
    } else {
      user.password = bcrypt.hashSync(password, 10);
    }
    
    if (errors.length > 0) {
      res.status(400).json({ errors });
    } else {
      await User.create(user);
      res.location('/').status(201).end();
    }
  } catch (error) {
    console.log(error.name, error.stack);
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
        const errors = error.errors.map(err => err.message);
        res.status(400).json({ errors });   
      } else {
        throw error;
      }
  }
}));

// GET route that will return all courses including the user associated with each course 
router.get('/courses', asyncHandler(async (req,res) => {
  const courses = await Course.findAll({
    include: [{
      model: User,
      as: 'user',
    }]
  });
  res.status(200).json(courses.map(course => course.get({plain:true})));
}));

// GET route that will return a specific course including the user associated with that course
router.get('/courses/:id', asyncHandler(async (req,res) => {
  const course = await Course.findByPk(req.params.id);
  if (course) {
    res.status(200).json(course);
  } else {
    res.status(404).json({ "message": "Page not found" });
  }
}));

// POST route that will create a new course, set the Location header to the URI for the newly created course, and return a 201 HTTP status code and no content.
router.post('/courses', asyncHandler(async (req,res) => {
  try {
    const course = req.body;
    const errors = [];
    if (!course.title) {
      errors.push('Please provide a course title');
    }
    if (!course.description) {
      errors.push('Please provide a course description');
    } 
    if (errors.length > 0) {
      res.status(400).json({ errors });
    } else {
      await Course.create(req.body);
      res.location(`/courses/${req.body.params}`).status(201).end();
    }
  } catch (error) {
    console.log(error.name, error.stack);
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
        const errors = error.errors.map(err => err.message);
        res.status(400).json({ errors });   
      } else {
        throw error;
    }
  }
}));

// PUT route that will update a specific course 
router.put('/courses/:id', asyncHandler(async (req,res) => {
  const course = await Course.findByPk(req.params.id);
  // console.log(req.body);
  if (course) {
    const newCourse = req.body;
    const errors = [];
    if (!newCourse.title) {
      errors.push('Please provide a course title');
    }
    if (!newCourse.description) {
      errors.push('Please provide a course description')
    }
    if (errors.length > 0) {
      res.status(400).json({ errors });
    } else {
      course.title = newCourse.title;
      course.description = newCourse.description;
      course.estimatedTime = newCourse.estimatedTime;
      course.materialsNeeded = newCourse.materialsNeeded;
      await course.save();
      res.status(204).end();
    }
  } else {
    res.status(404).json({ "message": "Page not found" });
  }
}));

// DELETE route that will delete a specific course 
router.delete('/courses/:id', asyncHandler(async (req,res) => {
  const course = await Course.findByPk(req.params.id);
  if (course) {
    await course.destroy();
    res.status(204).end();
  } else {
    res.status(404).json({ "message": "Page not found" });
  }
}));

module.exports = router;