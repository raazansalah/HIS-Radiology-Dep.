const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Appointment = require('./models/appointmentModel');
const Scan = require('./models/scanModel');
const Staff = require('./models/staffModel');
const Patient = require('./models/patientModel');
const Device = require('./models/deviceModel');
const Complain = require('./models/complainModel');

dotenv.config({ path: './configure.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('DB connection successful!'));

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Appointment.deleteMany();
    await Device.deleteMany();
    await Patient.deleteMany();
    await Complain.deleteMany();
    await Staff.deleteMany();
    await Scan.deleteMany();

    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  // importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
