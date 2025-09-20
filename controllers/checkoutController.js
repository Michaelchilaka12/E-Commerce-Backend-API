// checkoutController.js
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");

exports.getCheckout = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.redirect("/cart");
    }

    // Generate unique reference
    const reference = `ref-${Date.now()}`;

    // Create pending order in DB
    await Order.create({
      user: req.user.id,
      items: cart.items,
      totalPrice: cart.totalPrice,
      reference,
      status: "pending",
    });

    res.render("checkout", {
      PAYSTACK_PUBLIC_KEY: process.env.PAYSTACK_PUBLIC_KEY,
      email: req.user.email,
      amount: cart.totalPrice * 100, // Paystack requires Kobo
      reference,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).send("Error loading checkout");
  }
};
