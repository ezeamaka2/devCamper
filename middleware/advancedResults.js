const advancedResults = (model, populate) => async (req, res, next) => {
  let query;
  // Make a copy of req.query
  const reqQuery = { ...req.query };

  // Filed to remove from params
  const removeField = ["select", "sort", "page", "limit"];

  // Loop over the removeField and remove them from the query
  removeField.forEach((param) => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);

  // Create operators greater than as gt, greater than or equal to as gte, less than as lt,lts (less than or equal)
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  // Find resource
  query = model.find(JSON.parse(queryStr));

  // Select fields
  if (req.query.select) {
    const field = req.query.select.split(",").join(" ");
    query = query.select(field);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query.sort("-createdAt");
  }

  // Pagenation
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  if (populate) {
    query = query.populate(populate);
  }

  // Executing the query
  const results = await query;

  // Pagination results
  const pagination = {};

  // Check if you are not at the end and add a next to see more
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  // Check if you are not at the beginning and add a previous
  if (startIndex > 0) {
    pagination.previous = {
      page: page - 1,
      limit,
    };
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  };

  next();
};

module.exports = advancedResults;
