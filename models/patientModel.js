const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const patientSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'You must enter your name']
  },
  ssn: {
    type: Number,
    unique: true,
    required: [true, 'You must enter your SSN']
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
  passwordCreatedAt: {
    type: String,
    default: Date.now
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
  passwordResetToken: { type: String },
  passwordResetExpire: { type: Date },
  active: {
    type: Boolean,
    select: false,
    default: true
  }
});

patientSchema.virtual('complains', {
  ref: 'Complain',
  foreignField: 'patient',
  localField: '_id'
});
patientSchema.virtual('complains', {
  ref: 'Complain',
  foreignField: 'patient',
  localField: '_id'
});
patientSchema.virtual('complains', {
  ref: 'Complain',
  foreignField: 'patient',
  localField: '_id'
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

patientSchema.pre(/^find/, function() {
  this.find({ active: { $ne: false } });
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

patientSchema.methods.createResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex'); //random token
  //console.log(resetToken);

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex'); //hashing random token, save in DB
  //console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const Patient = mongoose.model('Complain', patientSchema);

module.exports = Patient;
