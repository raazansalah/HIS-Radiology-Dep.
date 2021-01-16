const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const staffSchema = new mongoose.Schema(
  {
    device: {
      type: mongoose.Schema.ObjectId,
      ref: 'Device'
    },
    name: {
      type: String,
      required: [true, 'You must enter your name']
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: [true, 'You must enter an email'],
      validate: [validator.isEmail, 'Not a valid email']
    },
    password: {
      type: String,
      minlength: [8, 'The password should be 8 characters minimum'],
      required: [true, 'You must enter a password']
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        validator: function(el) {
          return el === this.password;
        },
        message: "Passwords don't match"
      }
    },
    passwordCreatedAt: {
      type: Date,
      default: Date.now
    },
    sex: {
      type: String,
      enum: ['Male', 'Female']
    },
    birthdate: {
      type: Date
    },
    hoursWorked: {
      type: Number,
      default: 0
    },
    phoneNumber: {
      type: Number
    },
    address: {
      type: String
    },
    role: {
      type: String,
      enum: ['Doctor', 'Technician', 'Admin'],
      required: [true, 'You must specify your role']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

staffSchema.virtual('age').get(function() {
  return Math.trunc(
    Math.abs(Date.now() - this.birthdate) / (1000 * 60 * 60 * 24 * 365)
  );
});

staffSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'device'
  });
  next();
});

staffSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
});

staffSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now();
  return next();
});

staffSchema.methods.correctPass = async function(candidatePass, Pass) {
  return await bcrypt.compare(candidatePass, Pass);
};

const Staff = mongoose.model('Staff', staffSchema);

module.exports = Staff;
