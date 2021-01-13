const express = require('express');
const viewsController = require('../controllers/viewsController');
//const authController = require('../controllers/authController');

const router = express.Router();

router.get(['/', '/home'], viewsController.getHome);
router.get('/complains', viewsController.getAllComplains);
router.get('/dashboard', viewsController.getDashboard);
router
  .get('/contactus', viewsController.getContactForm)
  .post('/contactus', viewsController.postContactForm);
router
  .get('/appointments', viewsController.renderAppointment)
  .post('/appointments', viewsController.postAppointment);
router.get('/devices', viewsController.getDevices);
router.get('/patients', viewsController.getAllPatients);
router.get('/doctors', viewsController.getAllDoctors);
router.get('/techs', viewsController.getAllTechnicians);

// router.get('/signup', viewsController.signup);
router
  .get('/signup', viewsController.getSignUp)
  .post('/signup', viewsController.postSignUp);
router.post('/addDevice', viewsController.addDevice);

router.use(viewsController.protect);

router.get(
  '/getDoctor',
  viewsController.restrictTo('Doctor'),
  viewsController.getDoctor
);

module.exports = router;
