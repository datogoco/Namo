import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../../shared/utils/format";
import fallbackProductImage from "../../shared/assets/img/NAMO - front.jpg";

const CartPage = () => {
  const { cartItems, cartCount, cartTotal, updateQuantity, removeFromCart } =
    useCart();
  const navigate = useNavigate();

  return (
    <main>
      <section className="section-cart">
        <div className="cart-container">
          <div className="cart-items--header">
            <h5 className="cart-items--header-title">Cart</h5>
            <span className="cart-items--header-pcount">
              {cartCount > 0
                ? `${cartCount} Item${cartCount > 1 ? "s" : ""}`
                : "No items in the cart"}
            </span>
          </div>

          <div className="cart-items--params">
            <div className="cart-items--left-params">
              <div className="cart-items--params-text">Product</div>
            </div>
            <div className="cart-items--right-params">
              <div className="cart-items--params-text">Quantity</div>
              <div className="cart-items--params-text">Total</div>
            </div>
          </div>

          <div className="cart-items-list">
            {cartItems.length === 0 && (
              <div className="cart-empty">
                <p>Your cart is empty.</p>
                <div className="cart-empty-actions">
                  <button
                    type="button"
                    className="btn btn--full"
                    onClick={() => navigate('/')}
                  >
                    Continue shopping
                  </button>
                </div>
              </div>
            )}
            {cartItems.map((item) => (
              <div className="cart-item--body" key={item.productId}>
                <div className="cart-item--grid">
                  <div className="cart-item--details">
                    <div className="cart-item--img">
                      <img
                        src={item.product?.imageUrl || fallbackProductImage}
                        className="step-img"
                        alt={item.product?.name}
                      />
                    </div>
                    <div className="cart-item--info">
                      <span className="cart-item--name">
                        {item.product?.name}
                      </span>
                      <div className="cart-item--size">
                        Size: {item.product?.size}
                      </div>
                      {item.product?.inventoryQuantity != null && (
                        <div className="cart-item--inventory">
                          In Stock: {item.product.inventoryQuantity}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="cart-item--cost-wrap">
                    <div className="cart-item--total">
                      <button
                        type="button"
                        className="cart-item--quantity minus"
                        name="minus"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                      >
                        <ion-icon
                          className="icon-minus"
                          name="remove-outline"
                        ></ion-icon>
                      </button>
                      <input
                        className="cart-item--input"
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        readOnly
                      />
                      <button
                        type="button"
                        className="cart-item--quantity plus"
                        name="plus"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                      >
                        <ion-icon
                          className="icon-plus"
                          name="add-outline"
                        ></ion-icon>
                      </button>
                    </div>
                    <div
                      className="cart-item--price"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                      }}
                    >
                      <span>
                        {formatCurrency(item.product.price * item.quantity)}
                      </span>
                      <button
                        type="button"
                        className="cart-item--trash"
                        aria-label="Remove item"
                        onClick={() => removeFromCart(item.productId)}
                      >
                        <ion-icon
                          className="cart-trash--icon"
                          name="trash-outline"
                          style={{ color: "var(--color-ink-dark)" }}
                        ></ion-icon>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {cartItems.length > 0 && (
            <div className="cart-actions">
              <button
                type="button"
                className="btn btn--full cart-checkout-button"
                onClick={() => navigate("/checkout")}
              >
                Proceed to checkout
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default CartPage;
