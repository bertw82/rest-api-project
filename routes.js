'use strict';

const express = require('express');
const router = express.Router();
const { User, Course } = require('./models');

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

// GET route to return all properties and values from an authenticated User along with a 200 HTTP status code
router.get('/users', asyncHandler(async (req,res) => {
  let users = await User.findAll();
  res.json(users);
}));

// Post route to create a new user, set location header to "/" and return a 201 HTTP status code and no content
router.post('/users', asyncHandler(async (req,res) => {
  try {
    await User.create(req.body);
    res.location('/').status(201).end();
    // res.status(201).json({ "message": "Account successfully created!" });
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

// A /api/courses GET route that will return all courses including the User associated with each course and a 200 HTTP status code.
router.get('/courses', asyncHandler(async (req,res) => {
  const courses = await Course.findAll({
    include: [{
      model: User,
      as: 'user',
    }]
  });
  res.status(200).json(courses.map(course => course.get({plain:true})));
}));

// A /api/courses/:id GET route that will return the corresponding course including the User associated with that course and a 200 HTTP status code.
router.get('/courses/:id', asyncHandler(async (req,res) => {
  const course = await Course.findByPk(req.params.id);
  if (course) {
    res.status(200).json(course);
  } else {
    res.status(404).json({ "message": "Page not found" });
  }
}));

// A /api/courses POST route that will create a new course, set the Location header to the URI for the newly created course, and return a 201 HTTP status code and no content.
router.post('/courses', asyncHandler(async (req,res) => {
  try {
    await Course.create(req.body);
        res.location('/').status(201).end();
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

// A /api/courses/:id PUT route that will update the corresponding course and return a 204 HTTP status code and no content.
router.put('/courses/:id', asyncHandler(async (req,res) => {
  const course = await Course.findByPk(req.params.id);
  // console.log(req.body);
  if (course) {
    course.title = req.body.title;
    course.description = req.body.description;
    course.estimatedTime = req.body.estimatedTime;
    course.materialsNeeded = req.body.materialsNeeded;
    await course.save();
    res.status(204).end();
  } else {
    res.status(404).json({ "message": "Page not found" });
  }
}));

// A /api/courses/:id DELETE route that will delete the corresponding course and return a 204 HTTP status code and no content.
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