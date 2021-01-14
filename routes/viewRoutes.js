const express = require('express');
const viewsController = require('../controllers/viewsController');
//const authController = require('../controllers/authController');

const router = express.Router();

router.get(['/', '/home'], viewsController.getHome);
router.get('/complains', viewsController.getAllComplains);
router.get('/dashboard', viewsController.getDashboard);
router
  .get('/appointments', viewsController.getAppointment)
  .post('/appointments', viewsController.postAppointment);
router.get('/devices', viewsController.getDevices);
router.get('/patients', viewsController.getAllPatients);
router.get('/doctors', viewsController.getAllDoctors);
router.get('/techs', viewsController.getAllTechnicians);

router
  .get('/signup', viewsController.getSignUp)
  .post('/signup', viewsController.postSignUp);

router
  .get('/login', viewsController.getLogin)
  .post('/login', viewsController.postLogin);
router.post('/addDevice', viewsController.addDevice);

router.use(viewsController.protect);

router.post('/upload', viewsController.uploadFile);

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

module.exports = router;
