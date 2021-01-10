const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const staffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'You must enter your name']
  },
  ssn: {
    type: Number,
    unique: true,
    minlength: [14, 'Not valid'],
    maxlength: [14, 'Not valid'],
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
    enum: ['doctor', 'technician', 'admin'],
    required: [true, 'You must specify your role']
  },
  passwordResetToken: { type: String },
  passwordResetExpire: { type: Date },
  active: {
    type: Boolean,
    select: false,
    default: true
  },
  deviceManaged: {
    type: mongoose.Schema.ObjectId,
    ref: 'Device'
  }
});

staffSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'deviceManaged'
  });
});

staffSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next(); //So that we don't change it every time the staff updates his profile

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
});

staffSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now();
  return next();
});

staffSchema.pre(/^find/, function() {
  this.find({ active: { $ne: false } });
});

staffSchema.methods.correctPass = async function(candidatePass, Pass) {
  return await bcrypt.compare(candidatePass, Pass);
};

staffSchema.methods.changedPass = function(tokenDate) {
  if (this.passwordChangedAt) {
    const passMod = parseInt(this.passwordChangedAt.getTime() / 1000, 10); //10 for decimal
    return passMod > tokenDate;
  }
  return false;
};

staffSchema.methods.createResetToken = function() {
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

const Staff = mongoose.model('Staff', staffSchema);

module.exports = Staff;
