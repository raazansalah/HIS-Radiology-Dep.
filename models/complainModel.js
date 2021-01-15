const mongoose = require('mongoose');

const complainSchema = new mongoose.Schema({
  complain: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  patient: {
    type: mongoose.Schema.ObjectId,
    ref: 'Patient',
    required: [true, 'Scan must belong to a Patient']
  }
});

complainSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'patient'
  });
  next();
});

const Complain = mongoose.model('Complain', complainSchema);

module.exports = Complain;
