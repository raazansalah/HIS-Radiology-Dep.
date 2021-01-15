const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const uploadController = require('../controllers/uploadController');

const router = express.Router();

router.get(['/', '/home'], viewsController.getHome);

router
  .get('/signup', authController.getSignUp)
  .post('/signup', authController.postSignUp);

router
  .get('/login', authController.getLogin)
  .post('/login', authController.postLogin);

router
  .get('/adminLogin', authController.getadminLogin)
  .post('/adminLogin', authController.postLogin);

router.get('/logout', authController.logout);

router.post('/addDevice', viewsController.addDevice);

router.use(viewsController.protect);

router.post(
  '/upload',
  viewsController.restrictTo('Doctor', 'Technician'),
  uploadController.uploadFile,
  uploadController.userRedirect
);

router.get(
  '/getDoctor',
  viewsController.restrictTo('Doctor'),
  viewsController.getDoctor
);

router.get(
  '/getTech',
  viewsController.restrictTo('Technician'),
  viewsController.getTech
);
router.get(
  '/getPatient',
  viewsController.restrictTo('Patient'),
  viewsController.getPatient
);

router
  .get(
    '/contactus',
    viewsController.restrictTo('Patient'),
    viewsController.getContactForm
  )
  .post(
    '/contactus',
    viewsController.restrictTo('Patient'),
    viewsController.postContactForm
  );
router
  .get(
    '/appointments',
    viewsController.restrictTo('Patient'),
    viewsController.getAppointment
  )
  .post(
    '/appointments',
    viewsController.restrictTo('Patient'),
    viewsController.postAppointment
  );

router.use(viewsController.restrictTo('Admin'));
router.get('/adminHome', viewsController.getadminHome);
router.get('/complains', viewsController.getAllComplains);
router.get('/dashboard', viewsController.getDashboard);
router.get('/devices', viewsController.getDevices);
router.get('/patients', viewsController.getAllPatients);
router.get('/doctors', viewsController.getAllDoctors);
router.get('/techs', viewsController.getAllTechnicians);

module.exports = router;
