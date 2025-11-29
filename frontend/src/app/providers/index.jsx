import React from 'react';
import { AuthProvider } from '../../features/context/AuthContext';
import { CartProvider } from '../../features/context/CartContext';

const Providers = ({ children }) => (
  <AuthProvider>
    <CartProvider>{children}</CartProvider>
  </AuthProvider>
);

export default Providers;
