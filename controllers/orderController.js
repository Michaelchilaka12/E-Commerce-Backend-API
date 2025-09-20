const { client } = require("../config/paypal");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const paypal = require("@paypal/checkout-server-sdk");



// Create PayPal order
exports.createPayPalOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Create order in DB with pending status
    const order = await Order.create({
      user: req.user.id,
      items: cart.items,
      totalPrice: cart.totalPrice,
      status: "pending"
    });

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: order._id.toString(),
          amount: {
            currency_code: "USD",
            value: cart.totalPrice.toFixed(2) // ensure string with 2 decimals
          }
        }
      ],
      application_context: {
        return_url: `${process.env.BASE_URL}/api/v1/orders/paypal/capture`,
        cancel_url: `${process.env.BASE_URL}/api/v1/orders/paypal/cancel`
      }
    });

    const response = await client().execute(request);
    res.json({ id: response.result.id, links: response.result.links });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Capture PayPal order after approval
exports.capturePayPalOrder = async (req, res) => {
  try {
    const { token } = req.query; // PayPal sends ?token=ORDER_ID

    const request = new paypal.orders.OrdersCaptureRequest(token);
    request.requestBody({});

    const capture = await client().execute(request);

    const orderId = capture.result.purchase_units[0].reference_id;
    const order = await Order.findById(orderId);

    if (order) {
      order.status = "paid";
      await order.save();
    }

    res.json({ message: "Payment successful", order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};









exports.checkout = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // create order from cart
    const order = await Order.create({
      user: req.user.id,
      items: cart.items,
      totalPrice: cart.totalPrice
    });

    // clear cart
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(201).json({
      message: "Order placed successfully",
      order
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get all orders for the logged-in user
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("items.product", "name price") // show product details
      .sort({ createdAt: -1 }); // newest first

    if (!orders || orders.length === 0) {
      return res.json({ message: "No orders found" });
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};






// Render checkout page
exports.renderCheckout = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.redirect("/cart"); // send back if empty
    }
    res.render("checkout", { title: "Checkout", cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Render order history
exports.renderOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("items.product", "name price")
      .sort({ createdAt: -1 });

    res.render("orders", { title: "My Orders", orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (["shipped", "completed"].includes(order.status)) {
      return res.status(400).json({ message: "This order cannot be cancelled" });
    }

    order.status = "cancelled";
    await order.save();

    // Redirect for web flow
    if (req.headers.accept && req.headers.accept.includes("html")) {
      return res.redirect("/orders");
    }

    res.json({ status: "success", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Handle PayPal cancel redirect
exports.cancelPayPalOrder = async (req, res) => {
  try {
    const { token } = req.query; // PayPal sends ?token=ORDER_ID
    if (!token) return res.redirect("/orders");

    // Find order using reference_id stored earlier
    const order = await Order.findById(token); // token == our DB order._id (we passed it in reference_id)

    if (order && order.status === "pending") {
      order.status = "cancelled";
      await order.save();
    }

    res.redirect("/orders"); // back to order history page
  } catch (err) {
    console.error("cancelPayPalOrder error:", err);
    res.status(500).json({ message: err.message });
  }
};


// Basic analytics: total sales, most sold items
exports.getAnalytics = async (req, res) => {
  try {
    // ✅ Total sales (only for paid/completed orders)
    const totalSales = await Order.aggregate([
      { $match: { status: { $in: ["paid", "completed"] } } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);

    // ✅ Most sold items
    const topProducts = await Order.aggregate([
  { $unwind: "$items" },
  { $match: { status: { $in: ["paid", "completed"] } } },
  { $group: {
      _id: "$items.product",
      totalSold: { $sum: "$items.quantity" }
    }
  },
  { $sort: { totalSold: -1 } },
  { $limit: 5 },
  {
    $lookup: {
      from: "products", // must match your collection name
      localField: "_id",
      foreignField: "_id",
      as: "product"
    }
  },
  { $unwind: "$product" },
  { $project: { name: "$product.name", totalSold: 1 } }
]);

    res.json({
      totalSales: totalSales[0]?.total || 0,
      topProducts
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};