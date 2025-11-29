const mongoose = require("mongoose");
const slugify = require("slugify");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A product must have a name"],
    trim: true,
  },
  size: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: [true, "A product must have a price"],
  },
  slug: String,
  quantity: {
    type: Number,
    required: [true, "A product must have a quantity"],
    min: [0, "Quantity must be greater than 0"],
    max: [10000, "Quantity must be less than 10000"],
  },
  imageUrl: {
    type: String,
    required: [true, "A product must have an image URL"],
  },
  inventoryQuantity: {
    type: Number,
    required: [true, "A product must have an inventory quantity"],
    min: [0, "Inventory quantity must be greater than 0"],
    max: [10000, "Inventory quantity must be less than 10000"],
  },
});

productSchema
  .path("quantity")
  .validate(value => value >= 0 && value <= 1000000, "Invalid quantity");

productSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const Product = mongoose.model("Product", productSchema, "products");

module.exports = Product;
