const fs = require("fs");
const mongoose = require("mongoose");
const colors = require("colors");
const dotenv = require("dotenv");

// Load the model
const Bootcamp = require("./models/Bootcamp");
const Course = require("./models/Course");
const User = require("./models/User");
const Review = require("./models/Review");
const asyncHandler = require("./middleware/async");

// Load the env vars
dotenv.config({ path: "./config/config.env" });

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

// Read the Bootcamp JSON file
const bootcamp = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, `utf8`)
);

// Read the Course JSON file
const course = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/courses.json`, `utf8`)
);

// Read the Course JSON file
const user = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/users.json`, `utf8`)
);

// Read the Review JSON file
const review = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/reviews.json`, `utf8`)
);

// Import Data to DB function
const importData = async () => {
  try {
    await Bootcamp.create(bootcamp);
    await Course.create(course);
    await User.create(user);
    await Review.create(review);
    console.log("Data imported...".green.inverse);
    process.exit();
  } catch (error) {
    console.error(err);
  }
};

// Delete Data from DB
const deletetData = async () => {
  try {
    await Bootcamp.deleteMany();
    await Course.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log("Data deleted...".red.inverse);
    process.exit();
  } catch (error) {
    console.error(err);
  }
};

if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  deletetData();
}
