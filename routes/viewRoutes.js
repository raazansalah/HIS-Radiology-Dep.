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

router.use(authController.protect);

router.post(
  '/upload',
  authController.restrictTo('Doctor', 'Technician'),
  uploadController.uploadFile,
  uploadController.userRedirect
);

router.get(
  '/getDoctor',
  authController.restrictTo('Doctor'),
  viewsController.getDoctor
);

router.get(
  '/getTech',
  authController.restrictTo('Technician'),
  viewsController.getTech
);
router.get(
  '/getPatient',
  authController.restrictTo('Patient'),
  viewsController.getPatient
);

router
  .get(
    '/contactus',
    authController.restrictTo('Patient'),
    viewsController.getContactForm
  )
  .post(
    '/contactus',
    authController.restrictTo('Patient'),
    viewsController.postContactForm
  );
router
  .get(
    '/appointments',
    authController.restrictTo('Patient'),
    viewsController.getAppointment
  )
  .post(
    '/appointments',
    authController.restrictTo('Patient'),
    viewsController.postAppointment
  );

router.use(authController.restrictTo('Admin'));
router.get('/adminHome', viewsController.getadminHome);
router.get('/complains', viewsController.getAllComplains);
router.get('/dashboard', viewsController.getDashboard);
router.get('/devices', viewsController.getDevices);
router.get('/patients', viewsController.getAllPatients);
router.get('/doctors', viewsController.getAllDoctors);
router.get('/techs', viewsController.getAllTechnicians);

module.exports = router;
