const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    brand: { type: String },
    stock: { type: Number, required: true, default: 0 },
    images: [{ type: String }],

    sku: { type: String, unique: true },
    variants: [
      {
        size: String,
        color: String,
        stock: Number
      }
    ],
    ratings: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name: String,
        rating: Number,
        comment: String
      }
    ],
    discountPrice: { type: Number },
    isFeatured: { type: Boolean, default: false },
    tags: [String],
  },
  { timestamps: true },
  {
    toJSON: {virtuals: true},
    toObject:  {virtuals: true}
}
);

module.exports = mongoose.model("Product", productSchema);
