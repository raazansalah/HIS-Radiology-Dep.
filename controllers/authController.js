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
  const dateF = req.body.birthdate.split('/');
  const dateS = new Date(`${dateF[1]}-${dateF[0]}-${dateF[2]}`);
  req.body.birthdate = dateS;
  if (req.body.role === 'Patient') newUser = await Patient.create(req.body);
  else newUser = await Staff.create(req.body);
  createSendToken(newUser, 201, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  const { cookies } = req;
  let token;
  if (cookies.jwt) token = cookies.jwt;
  if (!token) return next(new AppError('You are not logged in', 401));

  const decoded = await promisify(JWT.verify)(token, process.env.JWT_SECRET);

  let current = await Patient.findById(decoded.id);
  if (!current) current = await Staff.findById(decoded.id);
  if (!current) return next(new AppError('Patient doesnt exist anymore', 401));

  req.user = current;
  next();
});

exports.restrictTo = (...roles) => {
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
  const { email, password, role } = req.body;

  if (!email || !password)
    return next(new AppError('Please enter email and password', 400));

  let user;
  if (role === 'Patient')
    user = await Patient.findOne({ email }).select('+password');
  else if (role === 'Doctor')
    user = await Staff.findOne({ email, role: 'Doctor' }).select('+password');
  else if (role === 'Technician')
    user = await Staff.findOne({ email, role: 'Technician' }).select(
      '+password'
    );
  else user = await Staff.findOne({ email, role: 'Admin' }).select('+password');
  if (!user || !(await user.correctPass(password, user.password)))
    return next(new AppError('Invalid email or password', 400));

  createSendToken(user, 200, res);
});
