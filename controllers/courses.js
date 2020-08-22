const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");

// @desc   Get all courses
// @route   GET /api/v1/course
// @route   GET /api/v1/bootcamp/:bootcampId/courses
// access    public
exports.getCourses = asyncHandler(async (req, res, next) => {
  // Check if the bootcamp ID exist and return the courses else, return all courses without bootcamp
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });

    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc   Get single course
// @route   GET /api/v1/course
// access    public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });

  // Check if the course exist
  if (!course) {
    return next(
      new ErrorResponse(`No course with the id ${req.params.id}`),
      404
    );
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc   Create a new course
// @route   POST /api/v1/bootcamp/:bootcampId/course
// access    private
exports.addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  // Check if the course exist
  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp with the id ${req.params.bootcampId}`),
      404
    );
  }

  // Make sure user is the bookcamp owner before updating
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with the id ${req.user.id} is not authorized to add a course to bootcamp ${bootcamp._id}`,
        401
      )
    );
  }

  const course = await Course.create(req.body);

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc   Update a particular course
// @route   PUT /api/v1/course/:id
// access    private
exports.UpdateCourse = asyncHandler(async (req, res, next) => {
  // Find the course in the database
  let course = await Course.findById(req.params.id);

  // Check if the course exist
  if (!course) {
    return next(
      new ErrorResponse(`No course with the id ${req.params.id}`),
      404
    );
  }

  // Make sure user is the course owner before updating
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with the id ${req.user.id} is not authorized to update course ${course._id}`,
        401
      )
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc   Delete a particular course
// @route   DELETE /api/v1/course/:id
// access    private
exports.DeleteCourse = asyncHandler(async (req, res, next) => {
  // Find the course in the database
  const course = await Course.findById(req.params.id);

  // Check if the course exist
  if (!course) {
    return next(
      new ErrorResponse(`No course with the id ${req.params.id}`),
      404
    );
  }

  // Make sure user is the coures owner before deleting
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with the id ${req.user.id} is not authorized to delete a course ${course._id}`,
        401
      )
    );
  }
  await Course.remove(course);

  res.status(200).json({
    success: true,
    data: {},
  });
});
