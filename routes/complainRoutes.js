const express = require('express');
const complainController = require('./../controllers/complainController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router
  .route('/')
  .get(complainController.getAllComplains)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    complainController.createComplain
  );

router
  .route('/:id')
  .get(complainController.getComplain)
  .patch(
    authController.restrictTo('user', 'admin'),
    complainController.updateComplain
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    complainController.deleteComplain
  );

module.exports = router;
