const asyncHandler = (requestHandler) => {
  return async (req, res, next) => {
    try {
      // Await the request handler execution directly
      await requestHandler(req, res, next);
    } catch (error) {
      // Pass any errors to the next middleware (i.e., Express error handler)
      res.status(error.statusCode || 500).json({
        message: error.message,
        statusCode: error.statusCode || 500,
      });
      next(error);
    }
  };
};
export { asyncHandler };
