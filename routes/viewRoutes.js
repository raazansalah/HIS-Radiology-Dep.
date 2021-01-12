const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get(['/', '/home'], viewsController.getHome);
router.get('/dashboard', viewsController.getDashboard);
router
  .get('/contactus', viewsController.getContactForm)
  .post('/contactus', viewsController.postContactForm);
router.get('/devices', viewsController.getDevices);
router.get('/patients', viewsController.getAllPatients);
router.get('/doctors', viewsController.getAllDoctors);
router.get('/techs', viewsController.getAllTechnicians);

// router.get('/signup', viewsController.signup);
router.post('/signup', authController.signup);
router.post('/addDevice', viewsController.addDevice);

module.exports = router;
