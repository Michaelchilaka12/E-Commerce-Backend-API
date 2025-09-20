// controllers/paystackController.js
const axios = require("axios");
const Order = require("../models/orderModel");

exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.body;

    // Verify with Paystack
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paystackData = response.data; // avoid re-declaring "data"

    if (paystackData.status && paystackData.data.status === "success") {
      const amountPaid = paystackData.data.amount / 100; // convert kobo → naira

      // Find the latest pending order for this user
      const order = await Order.findOne({
        user: req.user.id,
        status: "pending",
      });

      if (!order) {
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      }

      // Ensure amounts match
      if (order.totalPrice !== amountPaid) {
        return res
          .status(400)
          .json({ success: false, message: "Amount mismatch" });
      }

      // ✅ Update order status
      order.status = "paid";
      await order.save();

      return res.json({
        success: true,
        message: "Payment verified successfully",
        order,
      });
    }

    res.status(400).json({ success: false, message: "Payment verification failed" });
  } catch (err) {
    console.error("Paystack verification error:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Server error verifying payment" });
  }
};
