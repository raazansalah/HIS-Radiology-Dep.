const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/devices', viewsController.getDevices);
router.get('/patients', viewsController.getPatients);

module.exports = router;
