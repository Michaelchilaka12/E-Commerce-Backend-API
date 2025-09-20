// routes/paystackRoutes.js
const express = require('express');
const router = express.Router();
const paystackController = require('../controllers/paystackController');
const authController = require('../controllers/authController');

router.post('/verify-payment', authController.protect, paystackController.verifyPayment);

module.exports = router;
