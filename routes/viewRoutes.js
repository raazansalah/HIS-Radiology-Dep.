const express = require('express');
const viewsController = require('../controllers/viewsController');
//const authController = require('../controllers/authController');

const router = express.Router();

router.get('/devices', viewsController.getDevices);
router.get('/patients', viewsController.getAllPatients);
router.get('/doctors', viewsController.getAllDoctors);
router.get('/techs', viewsController.getAllTechnicians);
module.exports = router;
