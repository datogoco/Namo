import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../shared/assets/img/NAMO.png';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="container grid grid--footer">
        <div className="logo-col">
          <Link to="/" className="footer-logo">
            <img className="logo" src={logo} alt="Namo logo" />
          </Link>

          <ul className="social-links">
            <li>
              <a className="footer-link" href="#">
                <ion-icon className="social-icon" name="logo-instagram"></ion-icon>
              </a>
            </li>
            <li>
              <a
                className="footer-link"
                href="https://www.facebook.com/profile.php?id=61552294950896"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ion-icon className="social-icon" name="logo-facebook"></ion-icon>
              </a>
            </li>
            <li>
              <a className="footer-link" href="#">
                <ion-icon className="social-icon" name="logo-twitter"></ion-icon>
              </a>
            </li>
          </ul>

          <p className="copyright">
            Copyright &copy; <span className="year">2024</span> by NAMO, Inc. All rights
            reserved.
          </p>
        </div>
        <div className="address-col">
          <p className="footer-heading">Contact us</p>
          <address className="contacts">
            <p className="address">
              623 Harrison St., 2nd Floor, San Francisco, CA 94107
            </p>
            <p>
              <a className="footer-link" href="tel:415-201-6370">316-301-3690</a><br />
              <a className="footer-link" href="mailto:support@namo.com"
                >support@namo.com</a
              >
            </p>
          </address>
        </div>
        <nav className="nav-col">
          <p className="footer-heading">Account</p>
          <ul className="footer-nav">
            <li><Link className="footer-link" to="/login">Sign in</Link></li>
            <li><Link className="footer-link" to="/signup">Create account</Link></li>
            <li><a className="footer-link" href="#">iOS app</a></li>
            <li><a className="footer-link" href="#">Android app</a></li>
          </ul>
        </nav>
        <nav className="nav-col">
          <p className="footer-heading">Company</p>
          <ul className="footer-nav">
            <li><Link className="footer-link" to="/about">About Namo</Link></li>
            <li><a className="footer-link" href="#">For Business</a></li>
            <li><a className="footer-link" href="#">Our partners</a></li>
            <li><Link className="footer-link" to="/careers">Careers</Link></li>
          </ul>
        </nav>

        <nav className="nav-col">
          <p className="footer-heading">Resources</p>
          <ul className="footer-nav">
            <li><Link className="footer-link" to="/help-center">Help center</Link></li>
            <li><Link className="footer-link" to="/privacy-terms">Privacy & terms</Link></li>
          </ul>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
