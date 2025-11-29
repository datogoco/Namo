import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import logo from '../../shared/assets/img/NAMO.png';
import './Header.css';

const Header = () => {
  const { cartCount, toggleCart } = useCart();
  const { user } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <header className="header-container">
      <Link to="/" className="logo-link">
        <img className="logo" src={logo} alt="NAMO logo" />
      </Link>
      <nav className="nav-links">
        <ul className="main-nav-list">
          <li>
            <Link className="main-nav-link underline" to="/">Home</Link>
          </li>
          <li>
            <Link className="main-nav-link underline" to="/about">About Us</Link>
          </li>
          <li>
            <Link className="main-nav-link underline" to="/blog">Blog</Link>
          </li>
          <li onClick={toggleCart}>
            <button className="main-nav-link nav-button" type="button">
              <i className="fa-solid fa-cart-shopping" aria-hidden="true"></i>
              <span className="cart-number">{cartCount}</span>
              <span className="sr-only">Cart</span>
            </button>
          </li>
          <li
            id="account-icon-container"
            onClick={() => navigate(user ? '/dashboard' : '/login')}
          >
            <button
              id="account-icon"
              className="main-nav-link nav-button"
              type="button"
              role="button"
              tabIndex={0}
            >
              <ion-icon
                name="person"
                className="profile-icon"
                aria-hidden="true"
              ></ion-icon>
              <span className="sr-only">Account</span>
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
