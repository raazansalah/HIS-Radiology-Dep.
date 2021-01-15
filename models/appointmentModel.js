const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.ObjectId,
    ref: 'Patient'
    //required: [true, 'Appointment must belong to a Patient']
  },
  device: {
    type: mongoose.Schema.ObjectId,
    ref: 'Device'
    //required: [true, 'Appointment must belong to a Device']
  },
  scanType: String,
  patientName: String,
  patientMail: String,
  addmissionDate: String,
  addmissionTime: String,
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

appointmentSchema.pre(/^find/, function(next) {
  this.populate('patient').populate({
    path: 'device',
    select: 'name'
  });
  next();
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
