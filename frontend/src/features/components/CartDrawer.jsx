import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../../shared/utils/format';
import fallbackProductImage from '../../shared/assets/img/NAMO - front.jpg';

const CartDrawer = () => {
  const { 
    cartItems, 
    cartCount, 
    cartTotal, 
    isCartOpen, 
    closeCart, 
    updateQuantity, 
    removeFromCart 
  } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (isCartOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => document.body.classList.remove('no-scroll');
  }, [isCartOpen]);

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  const handleGoToCart = () => {
    closeCart();
    navigate('/cart');
  };

  return (
    <>
      <div className={`overlay ${isCartOpen ? 'overlay-active' : ''}`} onClick={closeCart}></div>
      <div className={`cart-tab ${isCartOpen ? 'cart-tab-visible' : ''}`}>
        <div className="cart-top-container">
          <div className="cart-drawer-header">
            <h1 className="cart-heading">CART</h1>
            <span className="cart-item-count">{cartCount} items</span>
          </div>
          <div className="cart-close-container">
            <button className="close-button" onClick={closeCart}>
              <ion-icon className="cart-close-icon" name="close-outline"></ion-icon>
            </button>
          </div>
        </div>

        <div className="list-cart">
          {cartItems.length === 0 ? (
            <p className="list-cart-empty">Your cart is empty</p>
          ) : (
            cartItems.map((item) => (
              <div className="item" key={item.productId || item.product?._id}>
                <div className="cart-item--img">
                  <img
                    src={item.product?.imageUrl || item.imageUrl || fallbackProductImage}
                    className="step-img"
                    alt={item.product?.name || item.name || "Product"}
                  />
                </div>
                <div className="cart-item--info">
                  <div className="cart-item--details">
                    <span className="cart-item--header">{item.product?.name || item.name}</span>
                    <div className="cart-item--size">Size - {item.product?.size || item.size || "60ml | 2.03 oz"}</div>
                    <button
                      type="button"
                      className="cart-item--trash"
                      aria-label="Remove item"
                      onClick={() => removeFromCart(item.productId || item.product?._id)}
                    >
                      <ion-icon
                        className="cart-trash--icon"
                        name="trash-outline"
                      ></ion-icon>
                    </button>
                  </div>
                  <div className="cart-item--cost">
                    <div className="cart-item--total">
                      <button
                        className="cart-item--quantity minus"
                        onClick={() => updateQuantity(item.productId || item.product?._id, Math.max(1, item.quantity - 1))}
                      >
                        <ion-icon className="icon-minus" name="remove-outline"></ion-icon>
                      </button>
                      <input
                        className="cart-item--input"
                        type="number"
                        min="1"
                        value={item.quantity}
                        readOnly
                      />
                      <button
                        className="cart-item--quantity plus"
                        onClick={() => updateQuantity(item.productId || item.product?._id, item.quantity + 1)}
                      >
                        <ion-icon className="icon-plus" name="add-outline"></ion-icon>
                      </button>
                    </div>
                    <div className="cart-item--price">{formatCurrency((item.product?.price || item.price || 0) * item.quantity)}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="subtotal-container">
          <h3 className="subtotal-heading">Total</h3>
          <div className="subtotal-price">{formatCurrency(cartTotal)}</div>
        </div>

        <div className="cart-main-buttons grid--2-cols">
          <button className="btn--go-to-cart" onClick={handleGoToCart}>Go to cart</button>
          <button className="btn--check-out" onClick={handleCheckout}>Check out</button>
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
