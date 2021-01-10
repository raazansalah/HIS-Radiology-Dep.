const crypto = require('crypto');
const { promisify } = require('util');
const JWT = require('jsonwebtoken');
//const Staff = require('./../models/staffModel');
const Patient = require('./../models/patientModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

const signInToken = id => {
  return JWT.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES
  });
};

const createSendToken = (user, status, res) => {
  const token = signInToken(user.id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  res.status(status).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  //const newPatient = await Patient.create(req.body); //Anyone can specify his/her role as admin. So, we should specify the data saved
  const newPatient = await Patient.create(req.body);
  //Now we can specify admins in the database ourselves

  //To make him login instantly, we'll send him a token
  createSendToken(newPatient, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body; //Object deconstructing

  //check if email and password exist
  if (!email || !password)
    return next(new AppError('Please enter email and password', 400));

  //check if user exist and password is correct
  const user = await Patient.findOne({ email }).select('+password');
  if (!user || !(await user.correctPass(password, user.password)))
    //Order is important here for .compare
    return next(new AppError('Invalid email or password', 400));

  //send a token
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  //Getting the token from the header
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  )
    token = req.headers.authorization.split(' ')[1]; //Bearer 21324ywdh728y4ufihewe24twtw3
  if (!token) return next(new AppError('You are not logged in', 401));

  //Verify the token
  const decoded = await promisify(JWT.verify)(token, process.env.JWT_SECRET);

  //Check if the user still exists
  const currentPatient = await Patient.findById(decoded.id);
  if (!currentPatient)
    return next(new AppError('Patient doesnt exist anymore', 401));

  //Check that password didn't change
  if (currentPatient.changedPass(decoded.iat))
    return next(new AppError('Password changed', 401));

  req.user = currentPatient;
  next();
});

exports.restrictTo = (...roles) => {
  //we can't add parameters to middleware so we wrapped the function in another
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError('You are not allowed to access this route', 403)
      );
    next();
  };
};

exports.forgotpass = catchAsync(async (req, res, next) => {
  //Find the user
  const user = await Patient.findOne({ email: req.body.email });
  if (!user) return next(new AppError('Cant find user', 404));

  //Set him a reset token and save a hashed one for it in his data
  const resetToken = user.createResetToken();
  await user.save({ validateBeforeSave: false });

  //Send him the reset token
  const resetURl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetpass/${resetToken}`;
  const message = `Forgot ur pass? submit a PATCH request with ur new pass and passConfirm to:${resetURl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'password reset token',
      message
    });

    res.status(200).json({
      status: 'success',
      message: 'email was sent'
    });
  } catch (err) {
    //undo what we did because of the error
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save({ validateBeforeSave: false });
    //console.log(err);
    return next(new AppError('An error happened', 500));
  }
});

exports.resetpass = catchAsync(async (req, res, next) => {
  //Hash the token sent in the parameter like what we did for the one saved in the database and then compare them
  const hashToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await Patient.findOne({
    passwordResetToken: hashToken,
    passwordResetExpire: { $gt: Date.now() }
  });
  if (!user) return next(new AppError('The token is invalid or expired', 400));

  //allow to change the password from the body
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;
  await user.save();

  //log the user in
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //get the user and check the password
  const user = await Patient.findById(req.user.id).select('+password');
  if (!(await user.correctPass(req.body.oldPassword, user.password)))
    return next(new AppError('Patient not found', 401));

  //Update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // //log the user in
  createSendToken(user, 200, res);
});
