const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const fileUpload = require("express-fileupload");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const bootcampRoute = require("./routes/bootcamps");
const courseRoute = require("./routes/courses");
const userRoute = require("./routes/users");
const reviewRoute = require("./routes/reviews");
const authRoute = require("./routes/auth");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");

dotenv.config({ path: "./config/config.env" });
const app = express();

// Express body parser middlewear
app.use(express.json());

// Cookier parser
app.use(cookieParser());

// connect to database
connectDB();

// Setting middlewares
if (process.env.NODE_ENV === "developement") {
  app.use(morgan("dev"));
}

// File upload
app.use(fileUpload());

// Sanitise the database
app.use(mongoSanitize());

// Helmet
app.use(helmet());

// Prevent XSS attach
app.use(xss());

// Rate limiter
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
});

app.use(limiter);

//Prevent HTTP Param Polution
app.use(hpp());

// Prevent cross origin error
app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/v1/bootcamps", bootcampRoute);
app.use("/api/v1/courses", courseRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/auth/users", userRoute);
app.use("/api/v1/reviews", reviewRoute);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `Server running on port ${process.env.PORT} in ${process.env.NODE_ENV} mode`
      .yellow.bold
  );
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  // server.close(() => process.exit(1));
});
