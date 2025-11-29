const axios = require("axios");
const Product = require("../../models/productModel");
const Order = require("../../models/orderModel");

const SHIPPING_METHODS = [
  { id: "standard", cost: 9.95 },
  { id: "express", cost: 19.95 },
  { id: "priority", cost: 0 },
];

const TAX_RATE = 0.0725;

const calculateSummary = (items, shippingMethod) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const method = SHIPPING_METHODS.find(m => m.id === shippingMethod) || SHIPPING_METHODS[0];
  const shipping = method.id === "priority" && subtotal >= 100 ? 0 : method.cost;
  const estimatedTax = (subtotal + shipping) * TAX_RATE;
  const total = subtotal + shipping + estimatedTax;

  return {
    subtotal,
    shipping,
    estimatedTax,
    total,
    estimatedTaxRate: TAX_RATE,
  };
};

exports.createBogOrder = async (req, res, next) => {
  try {
    const {
      items = [],
      email,
      phone,
      firstName,
      lastName,
      address,
      addressLine2,
      city,
      state,
      postal,
      smsUpdates = false,
      saveAddress = false,
      shippingMethod = "standard",
    } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty." });
    }
    if (!email || !firstName || !lastName || !address) {
      return res.status(400).json({ message: "Contact and address information are required." });
    }

    const clientId = process.env.BOG_CLIENT_ID;
    const clientSecret = process.env.BOG_CLIENT_SECRET;
    const merchantId = process.env.BOG_MERCHANT_ID;
    const terminalId = process.env.BOG_TERMINAL_ID;
    const apiBase = process.env.BOG_API_BASE || "https://gateway.bog.ge/payment/api/v1";
    const checkoutUrl = process.env.BOG_CHECKOUT_URL || "https://gateway.bog.ge/payment/checkout";

    if (!clientId || !clientSecret || !merchantId || !terminalId) {
      return res.status(500).json({ message: "BOG credentials are not configured on the server." });
    }

    const productIds = items.map(item => item.productId).filter(Boolean);
    const dbProducts = await Product.find({ _id: { $in: productIds } });
    const dbMap = new Map(dbProducts.map(p => [p._id.toString(), p]));

    const normalizedItems = items.map(item => {
      const product = dbMap.get(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      const quantity = Number(item.quantity) || 1;
      return {
        product: product._id,
        name: product.name,
        price: Number(product.price) || 0,
        quantity,
        size: product.size || item.size || "Standard",
        imageUrl: product.imageUrl,
      };
    });

    const summary = calculateSummary(normalizedItems, shippingMethod);

    const order = await Order.create({
      user: req.user ? req.user._id : undefined,
      email,
      phone,
      firstName,
      lastName,
      address,
      addressLine2,
      city,
      state,
      postal,
      smsUpdates,
      saveAddress,
      shippingMethod,
      shippingCost: summary.shipping,
      estimatedTaxRate: summary.estimatedTaxRate,
      estimatedTax: summary.estimatedTax,
      subtotal: summary.subtotal,
      total: summary.total,
      items: normalizedItems,
      paymentProvider: "BOG",
      bogStatus: "pending",
      bogOrderId: undefined,
      status: "pending",
    });

    const callbackUrl = `${process.env.APP_BASE_URL || "https://mydomain.com"}/api/v1/payment/bog/callback`;
    const returnUrl = `${process.env.FRONTEND_BASE_URL || "https://mydomain.com"}/payment-success`;
    const failUrl = `${process.env.FRONTEND_BASE_URL || "https://mydomain.com"}/payment-failed`;

    const bogOrderId = order._id.toString();

    const payload = {
      amount: Number(summary.total.toFixed(2)),
      currency: "GEL",
      orderId: bogOrderId,
      callbackUrl,
      returnUrl,
      failUrl,
      merchantId,
      terminalId,
    };

    const response = await axios.post(`${apiBase}/orders`, payload, {
      auth: {
        username: clientId,
        password: clientSecret,
      },
    });

    const remoteOrderId = response.data?.id || bogOrderId;
    const redirectUrl = response.data?.redirectUrl || `${checkoutUrl}/${remoteOrderId}`;

    order.bogOrderId = remoteOrderId;
    await order.save();

    res.status(201).json({ orderId: order._id, redirectUrl });
  } catch (err) {
    console.error("[BOG] createBogOrder error", err?.response?.data || err.message || err);
    res
      .status(400)
      .json({
        message:
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err.message ||
          "Failed to create payment.",
      });
  }
};

exports.bogCallback = async (req, res, next) => {
  try {
    const { orderId, status } = req.body || {};
    if (!orderId) {
      return res.status(400).json({ message: "Missing orderId" });
    }

    const isSuccess = String(status).toLowerCase() === "success";
    await Order.findByIdAndUpdate(orderId, {
      bogStatus: isSuccess ? "success" : "failed",
      status: isSuccess ? "paid" : "failed",
    });

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("[BOG] callback error", err);
    res.status(500).json({ message: "Callback handling failed" });
  }
};
