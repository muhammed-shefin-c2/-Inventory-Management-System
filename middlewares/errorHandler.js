export const errorHandler = (error, req, res, next) => {
  console.log(error);
  res.status(error.statusCode || 500).json({
    message: error.message || 'Server error'
  })
}