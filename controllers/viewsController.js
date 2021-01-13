//const mongoose = require('mongoose');
const multer = require('multer');
const JWT = require('jsonwebtoken');
const { promisify } = require('util');
const AppError = require('./../utils/appError');
const factory = require('./handleController');
const Device = require('../models/deviceModel');
const Appointment = require('../models/appointmentModel');
const Staff = require('../models/staffModel');
const Patient = require('../models/patientModel');
const Complain = require('../models/complainModel');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apifeatures');

exports.getHome = catchAsync(async (req, res, next) => {
  res.status(200).render('home');
});

exports.getDashboard = catchAsync(async (req, res, next) => {
  const devices = await Device.find();
  const patients = await Patient.find();
  const doctors = await Staff.find({ role: 'Doctor' });
  const techs = await Staff.find({ role: 'Technician' });

  res.status(200).render('dashboard', {
    devices: devices.length,
    doctors: doctors.length,
    techs: techs.length,
    patients: patients.length
  });
});

exports.getContactForm = catchAsync(async (req, res, next) => {
  res.status(200).render('contact', { qs: req.body });
});

exports.postContactForm = catchAsync(async (req, res, next) => {
  await Complain.create({
    patient: req.body.email,
    complain: req.body.message,
    visitDate: req.body.date
  }); //.create returns a promise
  res.status(200).render('contact', { qs: req.body });
});

exports.getDevices = catchAsync(async (req, res, next) => {
  const devices = await Device.find();
  //console.log(devices);
  res.status(200).render('viewDevices', {
    devices
  });
});

exports.getAllPatients = catchAsync(async (req, res) => {
  const features = new APIFeatures(Patient.find(), req.query)
    //.find({duration: 5, difficulty: 'easy'})
    //.find().where('duration').equals("5")
    //find is like SELECT in SQL, returns an array of objects
    .filter()
    .sort()
    .limitFields()
    .pagination();

  //const docs = await features.query.explain();
  const patient = await features.query;

  //SEND RESPONSE
  res.status(200).render('viewPatients', {
    patients: patient
  });
  // res.status(200).json({
  //   patients: patient
  // });
});

exports.getAllDoctors = catchAsync(async (req, res) => {
  const features = new APIFeatures(Staff.find({ role: 'Doctor' }), req.query)
    //.find({duration: 5, difficulty: 'easy'})
    //.find().where('duration').equals("5")
    //find is like SELECT in SQL, returns an array of objects
    .filter()
    .sort()
    .limitFields()
    .pagination();

  //const docs = await features.query.explain();
  const doctor = await features.query;

  //SEND RESPONSE
  res.status(200).render('viewDoctors', {
    doctors: doctor
  });
  // res.status(200).json({
  //   staffs: doctor
  // });
});
exports.getAllTechnicians = catchAsync(async (req, res) => {
  const features = new APIFeatures(
    Staff.find({ role: 'Technician' }),
    req.query
  )
    //.find({duration: 5, difficulty: 'easy'})
    //.find().where('duration').equals("5")
    //find is like SELECT in SQL, returns an array of objects
    .filter()
    .sort()
    .limitFields()
    .pagination();

  //const docs = await features.query.explain();
  const technician = await features.query;

  //SEND RESPONSE
  res.status(200).render('viewTechs', {
    technicians: technician
  });
});

exports.getAllComplains = catchAsync(async (req, res) => {
  const features = new APIFeatures(Complain.find(), req.query)
    //.find({duration: 5, difficulty: 'easy'})
    //.find().where('duration').equals("5")
    //find is like SELECT in SQL, returns an array of objects
    .filter()
    .sort()
    .limitFields()
    .pagination();

  //const docs = await features.query.explain();
  const complain = await features.query;
  const user = await Patient.find({ email: complain.patient }).select('name');
  //console.log(complain, user.name);
  //SEND RESPONSE
  res.status(200).render('viewComplains', {
    complains: complain,
    name: user.name,
    email: complain.patient
  });
  // res.status(200).json({
  //   patients: patient
  // });
});

exports.renderAppointment = catchAsync(async (req, res, next) => {
  res.status(200).render('viewAppointments', { qs: req.body });
});

exports.postAppointment = catchAsync(async (req, res, next) => {
  //console.log(req.body);
  await Appointment.create({
    patientName: req.body.name,
    patientMail: req.body.email,
    addmissionDate: req.body.dvisit,
    addmissionTime: req.body.tvisit,
    scanType: req.body.scantype
  });
  res.status(200).render('viewAppointments', { qs: req.body });
});

exports.renderTechProfile = catchAsync(async (req, res, next) => {
  res
    .status(200)
    .render('profileTech', { Technicians: req.body, devices: req.body });
});

//=================================================================AUTH
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
  res.redirect('/home');
};

exports.getSignUp = catchAsync(async (req, res, next) => {
  res.status(200).render('signup', { qs: req.body });
});

exports.postSignUp = catchAsync(async (req, res, next) => {
  let newUser;
  //console.log(req.body);
  if (req.body.role === 'Patient') newUser = await Patient.create(req.body);
  else newUser = await Staff.create(req.body);
  //To make him login instantly, we'll send him a token
  createSendToken(newUser, 201, res);
  //res.status(200).render('signup', { qs: req.body });
});

exports.protect = catchAsync(async (req, res, next) => {
  //Getting the token from the header
  const { cookies } = req.cookies;
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
//=================================================================AUTH

// ======================================UPLOADS
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `patient-${req.user.id}-${Date.now()}.${ext}`);
  }
});

// const multerFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith('image')) {
//     cb(null, true);
//   } else {
//     cb(new AppError('Not an image! Please upload only images.', 400), false);
//   }
// };

const upload = multer({
  storage: multerStorage
});

exports.uploadFile = upload.single('file');
// ======================================UPLOADS

exports.addDevice = factory.createOne(Device);
