const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../Controller/models/userModels');
const catchAsync = require('./../starter/utils/catchAsync');
const AppError = require('./../starter/utils/appError');
const Email = require('./../starter/utils/email');
const crypto = require('crypto');

const signToken = id => {
  return jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000 //90*One Day
    ),
    httpOnly: true,//the httpOnly flag is set to true, meaning the cookie cannot be accessed via JavaScript.
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  //Setting the secure option to true is a security measure because
  // it ensures that the cookie is only transmitted over a secure, 
  //encrypted connection (HTTPS). In a production environment,
  // it's crucial to use HTTPS to protect sensitive information from potential security threats.

  res.cookie('jwt', token, cookieOptions);

  //Removed the password from the output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    id: req.body._id,
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: Date.now(),
    role: req.body.role,
    active: req.body.active,
  });
  const url = `${req.protocol}://${req.get('host')}`;
  // console.log(url);
  await new Email(newUser, url).sendWelcome();
  createAndSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const {email, password} = req.body;

  //1)Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  //2)Check if the user exists && password is correct
  const user = await User.findOne({email}).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect Email or Password', 401));
  }

  // console.log(user, "user");

  //3)If everything is ok, send the token to client
  createAndSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  //1)Getting the Token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    // console.log(token);
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError('You are not Logged in!!! Please log in to get access.', 401)
    );
  }

  //2)Validate the Token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);

  //3)Check if the User Still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  //4)Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User Recently Changed Password! Please log in again.', 401)
    );
  }

  //GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;//We can se in all the Templates 
  next();
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
};
//Only for rendered pages , and there will be no error
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      //1)Verify the Token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      // console.log(decoded);

      //3)Check if the User Still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      //4)Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      //GThere is a Logged in User
      res.locals.user = currentUser;//We can se in all the Templates 
      return next();
    } catch (err) {
      return next();
    }
  }
  //If theres no Cookie then next MiddleWare will be Called
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles['admin','lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      ); //403 means Forbidden
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1)Get user based on Posted Email
  const user = await User.findOne({email: req.body.email});
  if (!user) {
    return next(new AppError('There is no User with the Email Address!.', 404));
  }
  //2)Generate the random token
  const resetToken = user.createPasswordResetToken();
  await user.save({validateBeforeSave: false}); //validateBeforeSave:false = Disables all the Validations

  //3)Send it to User's Email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you did'nt forget your password, please ignore this email!`;

  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Your Password reset Token (valid for 10 min)',
    //   message,
    // });
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    // console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({validateBeforeSave: false});

    return next(
      new AppError(
        'There was an error sending the email. Try again Later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1)Get User based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: {$gt: Date.now()},
  });
  //2)If the token has not expired and there is user, set the Password
  if (!user) {
    return next(new AppError('Token is Invalid or has Expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //3)Update changedPasswordAt property for the user

  //4)Log the user in, send the JWT

  //5)If everything is ok, send the token to client
  createAndSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1)Get user from the Collection
  const user = await User.findById(req.user.id).select('+password');
  //2)Check if the POSTed current Password is Correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }
  //3)If the Password is correct then Update the Password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //Very Important ,we could'nt  use findByIdAndUpdate because confirm Password will not work it supports only save and Create method
  //Even the pre('save') middleware also not works

  //4) Log User in and then send the JWT
  createAndSendToken(user, 200, res);
});
