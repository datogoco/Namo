import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../../shared/utils/format';
import { withCsrf } from '../../shared/utils/http';
import '../../styles/checkout.css';

const shippingMethods = [
  { id: 'standard', title: 'Standard', description: 'Delivers in 4-6 business days', cost: 9.95 },
  { id: 'express', title: 'Express', description: 'Delivers in 2 business days', cost: 19.95 },
  { id: 'priority', title: 'Priority', description: 'Complimentary for orders over $100', cost: 0 },
];

const Checkout = () => {
  const { cartItems, cartTotal } = useCart();
  const navigate = useNavigate();
  const [selectedShipping, setSelectedShipping] = useState('standard');
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formState, setFormState] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    addressLine2: '',
    city: '',
    state: '',
    postal: '',
    smsUpdates: false,
    saveAddress: false,
    saveCard: false,
    cardPostal: '',
  });

  const summary = useMemo(() => {
    const shippingCost =
      selectedShipping === 'priority' && cartTotal >= 100
        ? 0
        : shippingMethods.find(method => method.id === selectedShipping)?.cost || 0;
    const estimatedTaxRate = 0.0725;
    const estimatedTax = (cartTotal + shippingCost) * estimatedTaxRate;
    const total = cartTotal + shippingCost + estimatedTax;
    return {
      subtotal: cartTotal,
      shipping: shippingCost,
      estimatedTax,
      total,
      estimatedTaxRate,
    };
  }, [cartTotal, selectedShipping]);

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const api = await withCsrf();
      const { data } = await api.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/payment/bog/create`, {
        items: cartItems.map(item => ({
          productId: item.productId || item.product?._id,
          quantity: item.quantity,
        })),
        shippingMethod: selectedShipping,
        ...formState,
      });

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
      navigate('/dashboard');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const totalItems = cartItems.reduce((total, item) => total + (Number(item.quantity) || 0), 0);

  return (
    <main className="checkout-shell">
      <section className="checkout-layout">
        <div className="checkout-grid">
          <div className="checkout-titles">
            <p className="checkout-meta--eyebrow">Secure checkout</p>
          </div>
          <div className="checkout-titles">
            <p className="checkout-order--summary">ORDER SUMMARY</p>
          </div>
          <section className="checkout-panel">
            <form id="checkout-form" onSubmit={handleSubmit} noValidate>
              <fieldset className="checkout-fieldset">
                <legend>Contact information</legend>
                <div className="form-grid">
                  <label className="checkout--form-control">
                    <span>Email address</span>
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={formState.email}
                      onChange={e => setFormState(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </label>
                  <label className="checkout--form-control">
                    <span>Phone number</span>
                    <input
                      type="tel"
                      name="phone"
                      autoComplete="tel"
                      placeholder="+1 555 000 0000"
                      value={formState.phone}
                      onChange={e => setFormState(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </label>
                </div>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    name="smsUpdates"
                    checked={formState.smsUpdates}
                    onChange={e => setFormState(prev => ({ ...prev, smsUpdates: e.target.checked }))}
                  />
                  <span>Send me order updates over SMS</span>
                </label>
              </fieldset>

              <fieldset className="checkout-fieldset">
                <legend>Shipping address</legend>
                <div className="form-grid">
                  <label className="checkout--form-control">
                    <span>First name</span>
                    <input
                      type="text"
                      name="firstName"
                      autoComplete="given-name"
                      required
                      value={formState.firstName}
                      onChange={e => setFormState(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </label>
                  <label className="checkout--form-control">
                    <span>Last name</span>
                    <input
                      type="text"
                      name="lastName"
                      autoComplete="family-name"
                      required
                      value={formState.lastName}
                      onChange={e => setFormState(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </label>
                </div>
                <label className="checkout--form-control">
                  <span>Street address</span>
                  <input
                    type="text"
                    name="address"
                    autoComplete="address-line1"
                    placeholder="123 Serenity Ave"
                    required
                    value={formState.address}
                    onChange={e => setFormState(prev => ({ ...prev, address: e.target.value }))}
                  />
                </label>
                <label className="checkout--form-control">
                  <span>Apartment, suite, etc. (Optional)</span>
                  <input
                    type="text"
                    name="addressLine2"
                    autoComplete="address-line2"
                    value={formState.addressLine2}
                    onChange={e => setFormState(prev => ({ ...prev, addressLine2: e.target.value }))}
                  />
                </label>
                <div className="form-grid">
                  <label className="checkout--form-control">
                    <span>City</span>
                    <input
                      type="text"
                      name="city"
                      autoComplete="address-level2"
                      value={formState.city}
                      onChange={e => setFormState(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </label>
                  <label className="checkout--form-control">
                    <span>State</span>
                    <input
                      type="text"
                      name="state"
                      autoComplete="address-level1"
                      value={formState.state}
                      onChange={e => setFormState(prev => ({ ...prev, state: e.target.value }))}
                    />
                  </label>
                  <label className="checkout--form-control">
                    <span>Postal code</span>
                    <input
                      type="text"
                      name="postal"
                      autoComplete="postal-code"
                      value={formState.postal}
                      onChange={e => setFormState(prev => ({ ...prev, postal: e.target.value }))}
                    />
                  </label>
                </div>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    name="saveAddress"
                    checked={formState.saveAddress}
                    onChange={e => setFormState(prev => ({ ...prev, saveAddress: e.target.checked }))}
                  />
                  <span>Save this address to my profile</span>
                </label>
              </fieldset>

              <fieldset className="checkout-fieldset">
                <legend>Shipping method</legend>
                <div className="shipping-options">
                  {shippingMethods.map(method => (
                    <label className="shipping-option" key={method.id}>
                      <input
                        type="radio"
                        name="shippingMethod"
                        value={method.id}
                        data-cost={method.cost}
                        checked={selectedShipping === method.id}
                        onChange={() => setSelectedShipping(method.id)}
                      />
                      <div>
                        <span className="shipping-option__title">{method.title}</span>
                        <p>{method.description}</p>
                      </div>
                      <strong>{method.id === 'priority' && cartTotal >= 100 ? 'Free' : formatCurrency(method.cost)}</strong>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="checkout-fieldset">
                <legend>Payment</legend>
                <p className="fieldset-helper">
                  You will be redirected to Bank of Georgia to complete payment securely.
                </p>
              </fieldset>

              <button className="btn btn--place-order" type="submit" disabled={submitting}>
                {submitting ? 'Redirecting…' : 'Pay now'}
              </button>
            </form>
          </section>

          <aside
            className="checkout-summary"
            data-checkout-summary
            data-subtotal={summary.subtotal}
            data-tax-rate={summary.estimatedTaxRate}
            data-initial-shipping={summary.shipping}
          >
            <button
              className="summary-toggle"
              type="button"
              aria-expanded={mobileSummaryOpen}
              aria-controls="mobile-summary"
              onClick={() => setMobileSummaryOpen(open => !open)}
            >
              <span>Order summary</span>
              <span className="summary-toggle__total">
                {formatCurrency(summary.total)}
              </span>
            </button>

            <div
              className={`summary-panel ${mobileSummaryOpen ? 'open' : ''}`}
              id="mobile-summary"
              data-total-items={totalItems}
            >
              <ul className="summary-items">
                {totalItems === 0 && (
                  <li className="summary-empty">
                    <p>Your cart is empty. Add items to complete checkout.</p>
                    <button className="btn btn--ghost" onClick={() => navigate('/cart')}>
                      Return to cart
                    </button>
                  </li>
                )}
                {cartItems.map(item => (
                  <li className="summary-item" key={item.productId}>
                    <div className="summary-item__media">
                      <img src={item.product?.imageUrl} alt={item.product?.name} />
                      <span className="summary-item__qty">{item.quantity}</span>
                    </div>
                    <div className="summary-item__meta">
                      <p className="summary-item__name">{item.product?.name}</p>
                      <p className="summary-item__detail">Size: {item.product?.size}</p>
                    </div>
                    <div className="summary-item__price">
                      <strong>{formatCurrency(item.product.price * item.quantity)}</strong>
                    </div>
                  </li>
                ))}
              </ul>

              <dl className="summary-breakdown">
                <div className="summary-row">
                  <dt>Subtotal</dt>
                  <dd>{formatCurrency(summary.subtotal)}</dd>
                </div>
                <div className="summary-row">
                  <dt>Shipping</dt>
                  <dd>{summary.shipping === 0 ? 'Free' : formatCurrency(summary.shipping)}</dd>
                </div>
                <div className="summary-row">
                  <dt>Est. taxes</dt>
                  <dd>{formatCurrency(summary.estimatedTax)}</dd>
                </div>
                <div className="summary-row summary-row--total">
                  <dt>Total</dt>
                  <dd>{formatCurrency(summary.total)}</dd>
                </div>
              </dl>

              <div className="summary-note">
                <p>Need to make a change?</p>
                <button className="btn--return-to-cart" onClick={() => navigate('/cart')}>
                  Return to cart
                </button>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default Checkout;
