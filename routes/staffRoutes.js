const express = require('express');
const staffController = require('./../controllers/staffController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/forgotpass').post(authController.forgotpass);
router.route('/resetpass/:token').patch(authController.resetpass);

router.use(authController.protect);
//All next routers will be protected

router.route('/updatepass').patch(authController.updatePassword);
router.route('/me').get(staffController.getMe, staffController.getStaff);
router.route('/updateMe').patch(staffController.updateMe);
router.route('/deleteMe').delete(staffController.deleteMe);

router.use(authController.restrictTo('admin'));

router.route('/').get(staffController.getAllStaff);

router
  .route('/:id')
  .get(staffController.getStaff)
  .patch(staffController.updateStaff)
  .delete(staffController.deleteStaff);

module.exports = router;
