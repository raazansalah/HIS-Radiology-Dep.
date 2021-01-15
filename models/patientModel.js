const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const patientSchema = new mongoose.Schema(
  {
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
      minLength: [8, 'The password should be 8 characters minimum'],
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
    passwordChangedAt: {
      type: Date,
      default: Date.now()
    },
    sex: {
      type: String,
      enum: ['Male', 'Female']
    },
    birthdate: {
      type: Date
    },
    phoneNumber: {
      type: Number
    },
    role: {
      type: String,
      default: 'user'
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

patientSchema.virtual('age').get(function() {
  return Math.trunc(
    Math.abs(Date.now() - this.birthdate) / (1000 * 60 * 60 * 24 * 365)
  );
});

patientSchema.virtual('scans', {
  ref: 'Scan',
  foreignField: 'patient',
  localField: '_id'
});
patientSchema.virtual('appointments', {
  ref: 'Appointment',
  foreignField: 'patient',
  localField: '_id'
});
patientSchema.virtual('complains', {
  ref: 'Complain',
  foreignField: 'patient',
  localField: 'email'
});

patientSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next(); //So that we don't change it every time the patient updates his profile

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
});

patientSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now();
  return next();
});

patientSchema.methods.correctPass = async function(candidatePass, Pass) {
  return await bcrypt.compare(candidatePass, Pass);
};

patientSchema.methods.changedPass = function(tokenDate) {
  if (this.passwordChangedAt) {
    const passMod = parseInt(this.passwordChangedAt.getTime() / 1000, 10); //10 for decimal
    return passMod > tokenDate;
  }
  return false;
};

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
