import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../features/pages/Home';
import Login from '../features/pages/Login';
import Signup from '../features/pages/Signup';
import Dashboard from '../features/pages/Dashboard';
import CartPage from '../features/pages/CartPage';
import Checkout from '../features/pages/Checkout';
import About from '../features/pages/About';
import PrivacyTermsPage from '../features/pages/PrivacyTerms';
import Blog from '../features/pages/Blog';
import Careers from '../features/pages/Careers';
import HelpCenter from '../features/pages/HelpCenter';
import Header from '../features/components/Header';
import Footer from '../features/components/Footer';
import CartDrawer from '../features/components/CartDrawer';

function App() {
  return (
    <>
      <Header />
      <CartDrawer />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/privacy-terms" element={<PrivacyTermsPage />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/help-center" element={<HelpCenter />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
