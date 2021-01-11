const Device = require('../models/deviceModel');
const Patient = require('../models/patientModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getDevices = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const devices = await Device.find();

  // 2) Build template
  // 3) Render that template using tour data from 1)
  res.status(200).render('devices', {
    devices
  });
});

exports.getPatients = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const Patients = await Patient.find();

  // 2) Build template
  // 3) Render that template using tour data from 1)
  res.status(200).render('patients', {
    Patients
  });
});
