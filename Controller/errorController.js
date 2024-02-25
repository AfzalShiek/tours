const AppError = require('./../starter/utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const key = Object.keys(err.keyValue).join('');
  const message = `The key '${key}' has duplicate value of '${err.keyValue[key]}'`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid Token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your Token has Expired ! Please Login again ', 401);

const sendErrorDev = (err, req, res) => {
  //A)Api
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      err: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    //B)Rendered Website
    // console.error('Error *', err);

    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  //A)Api
  if (req.originalUrl.startsWith('/api')) {
    //A)Operational , trusted error: send message to Client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      //B)Programming or Other UnKnown Error: don't leak error details
      //1)Log err
      // console.error('Error *', err);
      //2)Send generic message
      return res.status(500).json({
        status: 'error',
        message: 'Something went Very Wrong',
      });
    }
  } else {
    //B)Rendered Website
    //A)Operational , trusted error: send message to Client
    if (err.isOperational) {
      // res.status(err.statusCode).json({
      //   status: err.status,
      //   message: err.message,
      // });

      return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message,
      });
    } else {
      //1)Log err
      // console.error('Error *', err);
      //2)Send generic message
      // res.status(500).json({
      //   status: 'error',
      //   message: 'Something went Very Wrong',
      // });

      //B)Programming or Other UnKnown Error: don't leak error details
      return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: 'Something went wrong ! Please try again later',
      });
    }
  }
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  err.message = err.message || 'Something went wrong ! Please try again later ';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = {...err};
    error.message =
      err.message || 'Something went wrong ! Please try again later ';
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(error, req, res);
  }
};
