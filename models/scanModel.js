const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.ObjectId,
      ref: 'Patient',
      required: [true, 'Scan must belong to a Patient']
    },
    device: {
      type: mongoose.Schema.ObjectId,
      ref: 'Device',
      required: [true, 'Scan must belong to a Device']
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    file: {
      type: String
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// scanSchema.pre(/^find/, function(next) {
//   this.populate('patient').populate({
//     path: 'device',
//     select: 'name'
//   });
//   next();
// });

const Scan = mongoose.model('Scan', scanSchema);

module.exports = Scan;
