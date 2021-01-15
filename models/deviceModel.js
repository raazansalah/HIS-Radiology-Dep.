const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema(
  {
    name: String,
    model: {
      type: String,
      required: [true, 'A device must have a name'],
      unique: true,
      trim: true,
      maxlength: [
        40,
        'A device name must have less or equal then 40 characters'
      ],
      minlength: [3, 'A device name must have more or equal then 10 characters']
    },
    subSection: String,
    arrivalDate: String
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual populate
deviceSchema.virtual('staffs', {
  ref: 'Staff',
  foreignField: 'device',
  localField: '_id'
});

const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;
