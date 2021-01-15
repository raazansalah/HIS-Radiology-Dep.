const path = require('path');
const AppError = require('./../utils/appError');
const Device = require('../models/deviceModel');
const Appointment = require('../models/appointmentModel');
const Staff = require('../models/staffModel');
const Patient = require('../models/patientModel');
const Complain = require('../models/complainModel');
const catchAsync = require('../utils/catchAsync');
const GoogleCalendar = require('../calendar');

exports.getHome = catchAsync(async (req, res, next) => {
  res.status(200).render('home');
});

exports.getadminHome = catchAsync(async (req, res, next) => {
  res.status(200).render('adminHome');
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
  });
  res.status(200).render('contact', { qs: req.body });
});

exports.getDevices = catchAsync(async (req, res, next) => {
  const query = Device.find().populate('staffs');
  const devices = await query;
  res.status(200).render('viewDevices', {
    devices
  });
});

exports.getAllPatients = catchAsync(async (req, res) => {
  const patient = await Patient.find().populate('scans');

  res.status(200).render('viewPatients', {
    patients: patient
  });
});

exports.getAllDoctors = catchAsync(async (req, res) => {
  const doctor = await Staff.find({ role: 'Doctor' });
  res.status(200).render('viewDoctors', {
    doctors: doctor
  });
});
exports.getAllTechnicians = catchAsync(async (req, res) => {
  const technician = await Staff.find({ role: 'Technician' });

  res.status(200).render('viewTechs', {
    technicians: technician
  });
});

exports.getAllComplains = catchAsync(async (req, res) => {
  const complain = await Complain.find();

  res.status(200).render('viewComplains', {
    complains: complain
  });
});

exports.getAppointment = catchAsync(async (req, res, next) => {
  res.status(200).render('viewAppointments', { qs: req.body });
});

exports.postAppointment = catchAsync(async (req, res, next) => {
  await Appointment.create({
    patientName: req.body.name,
    patientMail: req.body.email,
    addmissionDate: req.body.dvisit,
    addmissionTime: req.body.tvisit,
    scanType: req.body.scantype
  });
  const date = `${req.body.dvisit}T${req.body.tvisit}:00+02:00`;
  GoogleCalendar(req.body.email, date, req.body.scantype);
  res.status(200).render('viewAppointments', { qs: req.body });
});

exports.getDoctor = catchAsync(async (req, res, next) => {
  const doctor = await Staff.findById(req.user.id);
  const device = await Device.findById(doctor.device);
  if (!doctor) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.status(200).render('profileDoc', {
    doctor,
    device,
    qs: req.body
  });
});

exports.getPatient = catchAsync(async (req, res, next) => {
  const patient = await Patient.findById(req.user.id).populate('scans');

  if (!patient) {
    return next(new AppError('No document found with that ID', 404));
  }
  const fileNames = [];
  Object.keys(patient.scans).map(key =>
    fileNames.push(patient.scans[key].file)
  );

  const files = fileNames.map(name => {
    return {
      name: path.basename(name, '.pdf'),
      url: `/uploads/${name}`
    };
  });

  res.status(200).render('profilePatient', {
    patient,
    files
  });
});

exports.getTech = catchAsync(async (req, res, next) => {
  const tech = await Staff.findById(req.user.id);
  const device = await Device.findById(tech.device);
  res.status(200).render('profileTech', { tech, device, qs: req.body });
});

exports.addDevice = catchAsync(async (req, res, next) => {
  const newDoc = await Device.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      newDoc
    }
  });
});
