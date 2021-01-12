const mongoose = require('mongoose');
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
  const doctors = await Staff.find({ role: 'doctor' });
  const techs = await Staff.find({ role: 'technician' });

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
  const userID = await Patient.find({ email: req.body.email }).select('_id');
  const ID = mongoose.Types.ObjectId(userID._id);
  await Complain.create({
    patient: ID,
    complain: req.body.message,
    visitDate: req.body.date
  }); //.create returns a promise
  res.status(200).render('contact', { qs: req.body });
});

exports.getDevices = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const devices = await Device.find().populate('staffs');
  //console.log(devices);
  // 2) Build template
  // 3) Render that template using tour data from 1)
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
  const features = new APIFeatures(Staff.find({ role: 'doctor' }), req.query)
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
    Staff.find({ role: 'technician' }),
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

exports.renderAppointment = catchAsync(async (req, res, next) => {
  res.status(200).render('viewAppointments', { qs: req.body });
});

exports.postAppointment = catchAsync(async (req, res, next) => {
  const appointment = await Appointment.create(req.body);
  res.status(200).render('viewAppointments', { qs: req.body });
});

// exports.signup = (req, res) => {
//   //console.log(req.body);
//   res.status(200).render('signup', { qs: req.body });
// };
// app.post('/signup', (req, res, next) => {
//   console.log(req.body);
//   res.status(200).render('index', { qs: req.body });
// });

exports.addDevice = factory.createOne(Device);
