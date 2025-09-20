const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const orderController = require("../controllers/orderController");
const authController = require("../controllers/authController");
const { protect } = require("../controllers/authController");
const productController = require("../controllers/productController");
const checkoutController = require("../controllers/checkoutController");

// Public pages
router.get("/",(req,res)=>{
    res.redirect("/signup")
})
router.get("/login", authController.renderLogin);
router.get("/signup", authController.renderSignup);

// Protected pages
// Product pages
router.get("/products", productController.renderProducts);
router.get("/products/:id", productController.renderProductDetail);
router.get("/cart", protect, cartController.renderCart);
router.get("/checkout", protect, checkoutController.getCheckout);
router.get("/orders", protect, orderController.renderOrders);
router.get("/products/:id/edit",protect,productController.getUpdateForm)



router.post("/products/new", productController.createOne1);
module.exports = router;
