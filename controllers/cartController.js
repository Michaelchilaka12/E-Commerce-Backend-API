// controllers/cartController.js
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const qty = Number(quantity);
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [{ product: productId, quantity: qty, price: product.price }],
        totalPrice: product.price * qty
      });
    } else {
      // find by either populated or raw id
      const itemIndex = cart.items.findIndex(item => {
        const id = item.product && item.product._id ? item.product._id.toString()
                  : item.product ? item.product.toString() : null;
        return id === productId;
      });

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += qty;
      } else {
        cart.items.push({ product: productId, quantity: qty, price: product.price });
      }

      cart.totalPrice = cart.items.reduce((acc, item) => {
        const unit = item.price ?? (item.product && item.product.price) ?? 0;
        return acc + item.quantity * unit;
      }, 0);

      await cart.save();
    }

    // browser flow: redirect to cart page
    if (req.headers.accept && req.headers.accept.includes("html")) {
      return res.redirect("/cart");
    }

    res.json({ status: "success", cart });
  } catch (err) {
    console.error("addToCart error:", err);
    res.status(500).json({ message: err.message });
  }
};



exports.getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
  if (!cart) return res.json({ message: "Cart is empty" });
  res.json(cart);
};
// controllers/cartController.js
exports.removeFromCart = async (req, res) => {
  try {
    const productId = req.params.productId || req.params.id;
    if (!productId) return res.status(400).json({ message: "Missing product id" });

    // populate product so we can show names/prices if needed
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const beforeCount = cart.items.length;

    cart.items = cart.items.filter(item => {
      // handle both populated and non-populated item.product
      const itemProductId =
        item.product && item.product._id
          ? item.product._id.toString()
          : item.product
          ? item.product.toString()
          : null;
      return itemProductId !== productId;
    });

    if (cart.items.length === beforeCount) {
      // nothing was removed
      // If you prefer a redirect with flash message, change this.
      return res.status(404).json({ message: "Product not found in cart" });
    }

    // recalc total using the stored price on each cart item (safe fallback to populated product.price)
    cart.totalPrice = cart.items.reduce((acc, item) => {
      const unitPrice = item.price ?? (item.product && item.product.price) ?? 0;
      return acc + item.quantity * unitPrice;
    }, 0);

    await cart.save();

    // If request came from browser form, redirect back to cart page
    if (req.headers.accept && req.headers.accept.includes("html")) {
      return res.redirect("/cart");
    }

    // default: return updated cart JSON (useful for AJAX/Postman)
    return res.json({ status: "success", cart });
  } catch (err) {
    console.error("removeFromCart error:", err);
    return res.status(500).json({ message: err.message });
  }
};



// Render cart page
exports.renderCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
    res.render("cart", { title: "Your Cart", cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { action } = req.body; // "increase" or "decrease"

    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      i => (i.product._id ? i.product._id.toString() : i.product.toString()) === productId
    );
    if (!item) return res.status(404).json({ message: "Item not found in cart" });

    if (action === "increase") {
      item.quantity += 1;
    } else if (action === "decrease") {
      item.quantity = Math.max(1, item.quantity - 1); // prevent going below 1
    }

    cart.totalPrice = cart.items.reduce(
      (acc, i) => acc + i.quantity * (i.price ?? (i.product?.price || 0)),
      0
    );

    await cart.save();

    // redirect for browser
    if (req.headers.accept && req.headers.accept.includes("html")) {
      return res.redirect("/cart");
    }

    res.json({ status: "success", cart });
  } catch (err) {
    console.error("updateCartItem error:", err);
    res.status(500).json({ message: err.message });
  }
};
