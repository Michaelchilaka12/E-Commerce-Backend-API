const Order = require('../models/orderModel');
const Product = require('../models/productModel');

exports.getAnalytics = async (req, res, next) => {
  try {
    // 1. Total sales (sum of all order amounts)
    const totalSales = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    // 2. Most sold items (sum of product quantities)
    const mostSoldItems = await Order.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.product",
          totalSold: { $sum: "$products.quantity" }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }, // top 5 products
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" }
    ]);

    res.render("adminAnalytics", {
      totalSales: totalSales[0]?.total || 0,
      mostSoldItems
    });
  } catch (err) {
    next(err);
  }
};
