const { promisify } = require('util');
const JWT = require('jsonwebtoken');
const Staff = require('./../models/staffModel');
const Patient = require('./../models/patientModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const signInToken = id => {
  return JWT.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES
  });
};

const createSendToken = (user, status, res) => {
  const token = signInToken(user.id);
  // const cookieOptions = {
  //   expires: new Date(
  //     Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
  //   ),
  //   httpOnly: true
  // };

  res.cookie('jwt', token, { httpOnly: true });
  user.password = undefined;
  if (user.role === 'Doctor') res.redirect('/getDoctor');
  if (user.role === 'Patient') res.redirect('/getPatient');
  if (user.role === 'Technician') res.redirect('/getTech');
  res.redirect('/adminHome');
};

exports.getSignUp = catchAsync(async (req, res, next) => {
  res.status(200).render('signup', { qs: req.body });
});

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie('jwt', ' ', { maxAge: 0 });
  res.redirect('/home');
});

exports.postSignUp = catchAsync(async (req, res, next) => {
  let newUser;
  if (req.body.role === 'Patient') newUser = await Patient.create(req.body);
  else newUser = await Staff.create(req.body);
  //To make him login instantly, we'll send him a token
  createSendToken(newUser, 201, res);
  //res.status(200).render('signup', { qs: req.body });
});

exports.protect = catchAsync(async (req, res, next) => {
  //Getting the token from the header
  const { cookies } = req;
  let token;
  if (cookies.jwt) token = cookies.jwt; //Bearer 21324ywdh728y4ufihewe24twtw3
  if (!token) return next(new AppError('You are not logged in', 401));

  //Verify the token
  const decoded = await promisify(JWT.verify)(token, process.env.JWT_SECRET);

  //Check if the user still exists
  let current = await Patient.findById(decoded.id);
  if (!current) current = await Staff.findById(decoded.id);
  if (!current) return next(new AppError('Patient doesnt exist anymore', 401));

  //Check that password didn't change
  if (current.changedPass(decoded.iat))
    return next(new AppError('Password changed', 401));

  req.user = current;
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

exports.getLogin = catchAsync(async (req, res, next) => {
  res.status(200).render('login', { qs: req.body });
});
exports.getadminLogin = catchAsync(async (req, res, next) => {
  res.status(200).render('adminLogin', { qs: req.body });
});

exports.postLogin = catchAsync(async (req, res, next) => {
  const { email, password, role } = req.body; //Object deconstructing

  //check if email and password exist
  if (!email || !password)
    return next(new AppError('Please enter email and password', 400));

  //check if user exist and password is correct
  let user;
  if (role === 'Patient')
    user = await Patient.findOne({ email }).select('+password');
  else user = await Staff.findOne({ email }).select('+password');
  if (!user || !(await user.correctPass(password, user.password)))
    //Order is important here for .compare
    return next(new AppError('Invalid email or password', 400));

  //send a token
  createSendToken(user, 200, res);
});
