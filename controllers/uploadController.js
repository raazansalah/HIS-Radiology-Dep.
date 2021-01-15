const multer = require('multer');
const Scan = require('../models/scanModel');
const catchAsync = require('../utils/catchAsync');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `patient-${req.user.id}-${Date.now()}.${ext}`);
  }
});

const upload = multer({
  storage: multerStorage
});

exports.uploadFile = upload.single('myImage');
exports.userRedirect = catchAsync(async (req, res, next) => {
  console.log(req.user);
  await Scan.create({
    patient: req.body.id,
    device: req.user.device,
    file: req.file.filename
  });
  if (req.user.role === 'Doctor') res.redirect('/getDoctor');
  if (req.user.role === 'Technician') res.redirect('/getTech');
});
