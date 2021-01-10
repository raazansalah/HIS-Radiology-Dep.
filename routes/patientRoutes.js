const express = require('express');
const patientController = require('./../controllers/patientController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/forgotpass').post(authController.forgotpass);
router.route('/resetpass/:token').patch(authController.resetpass);

router.use(authController.protect);
//All next routers will be protected

router.route('/updatepass').patch(authController.updatePassword);
router.route('/me').get(patientController.getMe, patientController.getPatient);
router.route('/updateMe').patch(patientController.updateMe);
router.route('/deleteMe').delete(patientController.deleteMe);

router.use(authController.restrictTo('admin'));

router.route('/').get(patientController.getAllPatients);

router
  .route('/:id')
  .get(patientController.getPatient)
  .patch(patientController.updatePatient)
  .delete(patientController.deletePatient);

module.exports = router;
