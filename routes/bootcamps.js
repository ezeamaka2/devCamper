const express = require("express");
const router = express.Router();
const {
  getBootcamps,
  getSingleBootcamp,
  postBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload,
} = require("../controllers/bootcamps");
const Bootcamp = require("../models/Bootcamp");
const advancedResults = require("../middleware/advancedResults");

// Include other resources routes
const courseRoute = require("./courses");
const reviewRoute = require("./reviews");

const { protect, authorize } = require("../middleware/auth");

// Re-route into other resource
router.use("/:bootcampId/courses", courseRoute);
router.use("/:bootcampId/reviews", reviewRoute);

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);
router
  .route("/:id/photo")
  .put(protect, authorize("publisher", "admin"), bootcampPhotoUpload);

router
  .route("/")
  .get(advancedResults(Bootcamp, "courses"), getBootcamps)
  .post(protect, authorize("publisher", "admin"), postBootcamp);

router
  .route("/:id")
  .get(getSingleBootcamp)
  .put(protect, authorize("publisher", "admin"), updateBootcamp)
  .delete(protect, authorize("publisher", "admin"), deleteBootcamp);

module.exports = router;
