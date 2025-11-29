const Cart = require("../../models/cartModel");

const mapCartItems = items =>
  items.map(item => ({
    id:
      item.product?._id?.toString() ||
      item.productId ||
      item._id ||
      "unknown",
    name: item.product?.name || item.name || "Product",
    quantity: Number(item.quantity) || 1,
    price: Number(item.product?.price ?? item.price ?? 0),
    size: item.product?.size || item.size || "Standard",
    imageUrl:
      item.product?.imageUrl ||
      item.imageUrl ||
      "/img/NAMO - front.jpg",
  }));

const buildSummary = items => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping = subtotal >= 100 ? 0 : 9.95;
  const estimatedTaxRate = 0.0725;
  const estimatedTax = Number(
    (subtotal + shipping) * estimatedTaxRate,
  );
  const total = subtotal + shipping + estimatedTax;

  return {
    subtotal,
    shipping,
    estimatedTax,
    total,
    estimatedTaxRate,
  };
};

exports.renderCheckoutPage = async (req, res, next) => {
  try {
    let checkoutItems = [];

    if (req.user) {
      const cart = await Cart.findOne({ user: req.user._id }).populate({
        path: "items.product",
        model: "Product",
      });
      checkoutItems = cart ? mapCartItems(cart.items) : [];
    } else if (Array.isArray(req.session.cart)) {
      checkoutItems = mapCartItems(req.session.cart);
    }

    const summary = buildSummary(checkoutItems);
    const cartCount = checkoutItems.reduce(
      (total, item) => total + (Number(item.quantity) || 0),
      0,
    );

    res.status(200).render("checkout", {
      csrfToken: req.csrfToken(),
      user: req.user,
      cartItems: checkoutItems,
      summary,
      cartCount,
    });
  } catch (error) {
    next(error);
  }
};
