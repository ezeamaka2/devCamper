const NodeGeocoder = require("node-geocoder");

const options = {
  provider: "mapquest",

  // Optional depending on the providers
  apiKey: "PYS9NAH6u7Owc1HnPp6t8k2y8BUmYrNF", // for Mapquest, OpenCage, Google Premier
  formatter: null, // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
