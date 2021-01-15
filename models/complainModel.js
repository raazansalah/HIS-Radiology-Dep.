const mongoose = require('mongoose');
const validator = require('validator');

const complainSchema = new mongoose.Schema({
  complain: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  patient: {
    type: String,
    ref: 'Patient',
    validate: [validator.isEmail, 'Not a valid email']
  }
});

// complainSchema.pre(/^find/, function(next) {
//   this.populate({
//     path: 'patient'
//   });
//   next();
// });

const Complain = mongoose.model('Complain', complainSchema);

module.exports = Complain;
