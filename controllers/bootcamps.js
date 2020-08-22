const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const geocoder = require("../utils/geocoder");
const Bootcamp = require("../models/Bootcamp");
const { query } = require("express");

// @desc   Get all bootcamps
// @route   GET /api/v1/bootcamp
// access    public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc   Get a single bootcamp
// @route    GET /api/v1/bootcamp/:id
// access    public
exports.getSingleBootcamp = asyncHandler(async (req, res, next) => {
  const singleBootcamp = await Bootcamp.find({ _id: req.params.id });

  if (singleBootcamp <= 0) {
    return next(
      new ErrorResponse(`Bootcamp not found with the id ${req.params.id}`, 404)
    );
  }

  return res.status(200).json({
    success: true,
    data: singleBootcamp,
  });
});

// @desc   post a new bootcamps
// @route    POST /api/v1/bootcamp
// access    private
exports.postBootcamp = asyncHandler(async (req, res, next) => {
  // Add the user to the req.body
  req.body.user = req.user.id;

  // check for published bootcamp
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  if (publishedBootcamp && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `The user with the ID ${req.user.id} has already added a bootcamp`,
        400
      )
    );
  }
  const bootcamp = await Bootcamp.create(req.body);
  if (bootcamp === null) {
    console.log("enter details");
  }
  bootcamp.save();
  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

// @desc   Update a single bootcamp
// @route    PUT  /api/v1/bootcamp/:id
// access    private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with the id ${req.params.id}`, 404)
    );
  }

  // Make sure user is the bookcamp owner before updating
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with the id ${req.params.id} is not authorized to update the bootcamp`,
        401
      )
    );
  }

  // Find by ID and Update if it meets the previous condition
  bootcamp = await Bootcamp.findOneAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// @desc   Delete a single bootcamp
// @route    DELETE /api/v1/bootcamp/:id
// access    private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const bootcamp = await Bootcamp.findById(id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with the id ${req.params.id}`, 404)
    );
  }

  // Make sure user is the bookcamp owner before updating
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with the id ${req.params.id} is not authorized to delete the bootcamp`,
        401
      )
    );
  }

  bootcamp.remove();
  res.status(200).json({ success: true, message: `${id} deleted` });
});

// @desc   Get bootcampsby radius
// @route    GET /api/v1/bootcamp/radius/:zipcode/:distance
// access    private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Cal the radius
  // To get the radius, we divid the distance by the radius of the Earth - distance/earth+radius
  // The radius of the Earth is 3963 in miles and 6378 in km
  const radius = distance / 3963;

  const bootcamp = await Bootcamp.find({
    location: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] },
    },
  });

  res
    .status(200)
    .json({ success: true, count: bootcamp.length, data: bootcamp });
});

// @desc      Upload a photo to a  bootcamp
// @route    PUT /api/v1/bootcamp/:id/photo
// access    private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  // Check if a bootcamp exist
  const bootcamp = await Bootcamp.findById(id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with the id ${req.params.id}`, 404)
    );
  }

  // Make sure user is the bookcamp owner before updating
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with the id ${req.params.id} is not authorized to update the bootcamp`,
        401
      )
    );
  }

  // Check if a file was uploaded
  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  // Check if the file uploaded is an actual image
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check the file upload size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image file less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // Create a custom file to avoid photos with the same been replaced
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  // Upload the image to the server
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Sorry, photo upload problem`, 500));
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
