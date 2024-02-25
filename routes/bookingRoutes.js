const express = require('express');
const bookingController = require('./../Controller/bookingController');
const authController = require('./../Controller/authController');
const router = express.Router();

router.get(
  '/checkout-session/:tourID',
  authController.protect,
  bookingController.getCheckoutSession
);

router.get('/my-tours',authController.protect,bookingController.getMyTours)
module.exports = router;
 