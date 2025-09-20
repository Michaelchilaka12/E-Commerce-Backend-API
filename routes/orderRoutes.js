const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { protect,restrictTo } = require("../controllers/authController");

router.post("/checkout", protect, orderController.checkout);
router.get("/my-orderhistory", protect, orderController.getMyOrders);

router.post("/paypal/create", protect, orderController.createPayPalOrder);
router.get("/paypal/capture", orderController.capturePayPalOrder);
router.post("/:id/cancel", protect, orderController.cancelOrder);
// router.get("/analytics", protect, restrictTo("admin"), orderController.getAnalytics);
router.get("/analytics", protect, restrictTo("admin"), async (req, res) => {
  const analytics = await orderController.getAnalyticsData();
  res.render("analytics", { analytics });
});




module.exports = router;
