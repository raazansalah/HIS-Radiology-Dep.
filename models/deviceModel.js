const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  model: {
    type: String,
    required: [true, 'A device must have a name'],
    unique: true,
    trim: true,
    maxlength: [40, 'A device name must have less or equal then 40 characters'],
    minlength: [10, 'A device name must have more or equal then 10 characters']
  },
  subSection: String,
  arrivalDate: String,
  serviceDate: String
});

// deviceSchema.pre(/^find/, function(next) {
//   this.populate('patient').populate({
//     path: 'device',
//     select: 'name'
//   });
//   next();
// });

const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;
