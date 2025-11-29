const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    size: { type: String },
    imageUrl: { type: String },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    email: { type: String, required: true },
    phone: { type: String },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    address: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String },
    state: { type: String },
    postal: { type: String },
    smsUpdates: { type: Boolean, default: false },
    saveAddress: { type: Boolean, default: false },
    shippingMethod: { type: String, required: true },
    shippingCost: { type: Number, required: true },
    estimatedTaxRate: { type: Number, required: true },
    estimatedTax: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    currency: { type: String, default: "usd" },
    paymentProvider: { type: String, default: "BOG" },
    bogStatus: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    bogOrderId: { type: String },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    items: [orderItemSchema],
  },
  { timestamps: true },
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
