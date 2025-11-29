import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { logout, user } = useAuth();
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

  const handleLogout = async e => {
    e.preventDefault();
    await logout();
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main>
      <section className="customer-section">
        <div className="account-section">
          <div className="account-container">
            <div className="account-menu">
              <div className="account-menu--title">MY ACCOUNT</div>
              <button className="btn btn--outline account-menu--btn" aria-label="Order history">Order history</button>
              <button className="btn btn--outline account-menu--btn" aria-label="Addresses">Addresses</button>
              <form onSubmit={handleLogout}>
                <button
                  type="submit"
                  className="btn btn--outline account-menu--btn"
                >
                  Logout
                </button>
              </form>
            </div>
            <div className="account-content">
              <div className="order-history--header">
                <h5 className="order-header--text">Order history</h5>
              </div>
              <div className="table">
                <div className="table-row table-row--header">
                  <div className="order-table--heading">Order</div>
                  <div className="order-table--heading">Date</div>
                  <div className="order-table--heading">Payment status</div>
                  <div className="order-table--heading">Fulfillment status</div>
                  <div className="order-table--heading">Total</div>
                </div>
                <div className="table-row table-row--order">
                  <div className="order-table--column">#34845</div>
                  <div className="order-table--column">
                    <time dateTime={currentDate}>{currentDate}</time>
                  </div>
                  <div className="order-table--column">Paid</div>
                  <div className="order-table--column">Fulfilled</div>
                  <div className="order-table--column">29.37$</div>
                </div>
              </div>
            </div>
            <button className="btn--add-to-cart" hidden>Add to cart</button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
