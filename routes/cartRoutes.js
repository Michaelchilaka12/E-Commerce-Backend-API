// routes/cartRoutes.js
const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { protect } = require("../controllers/authController");

router.get("/", protect, cartController.getCart);
router.post("/add",protect, cartController.addToCart);
router.post("/remove/:productId", protect, cartController.removeFromCart);
router.post("/update/:productId", protect, cartController.updateCartItem);


module.exports = router;
