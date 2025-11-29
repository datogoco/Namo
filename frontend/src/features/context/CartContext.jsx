import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import * as cartService from '../../entities/cart/api';
import { safeNumber } from '../../shared/utils/format';
import defaultProductImage from '../../shared/assets/img/NAMO - front.jpg';

const CartContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen(prev => !prev);

  const normalizeItem = item => {
    if (!item) return null;
    const product = item.product || item;
    const productId = item.productId || product._id || product.id;
    if (!productId) return null;
    return {
      productId,
      quantity: Number(item.quantity) || 1,
      product: {
        name: product.name || item.name || "Namo Herbal Ointment",
        price: safeNumber(product.price ?? item.price ?? item.unitPrice),
        size: product.size || item.size || "60ml | 2.03 oz",
        inventoryQuantity: product.inventoryQuantity ?? item.inventoryQuantity,
        imageUrl:
          product.imageUrl ||
          item.imageUrl ||
          defaultProductImage,
      },
    };
  };

  const updateItemQuantity = (items, productId, nextQty) =>
    items.map(item =>
      item.productId === productId ? { ...item, quantity: nextQty } : item,
    );

  const hydrateCart = useCallback(async () => {
    setLoading(true);
    try {
      if (user) {
        const data = await cartService.fetchCart();
        const items = Array.isArray(data?.items)
          ? data.items
              .map(normalizeItem)
              .filter(Boolean)
          : [];
        setCartItems(items);
      } else {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          setCartItems(
            Array.isArray(parsed)
              ? parsed.map(normalizeItem).filter(Boolean)
              : [],
          );
        } else {
          setCartItems([]);
        }
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      hydrateCart();
    }
  }, [user, authLoading, hydrateCart]);

  useEffect(() => {
    if (!user && !loading) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, user, loading]);

  const cartCount = useMemo(
    () =>
      cartItems.reduce(
        (acc, item) => acc + (Number(item.quantity) || 0),
        0,
      ),
    [cartItems],
  );

  const cartTotal = useMemo(
    () =>
      cartItems.reduce((acc, item) => {
        const price = safeNumber(item?.product?.price);
        return acc + price * (Number(item.quantity) || 0);
      }, 0),
    [cartItems],
  );

  const addToCart = async (product, quantity = 1) => {
    try {
      const productId = product._id || product.id || product.productId;
      if (!productId) return;
      if (user) {
        const existing = cartItems.find(
          item => item.productId === productId,
        );
        const nextQty = (existing?.quantity || 0) + quantity;
        await cartService.addToCart(productId, nextQty);
        await hydrateCart();
      } else {
        setCartItems(prev => {
          const existing = prev.find(item => item.productId === productId);
          if (existing) {
            return prev.map(item =>
              item.productId === productId
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            );
          }
          return [
            ...prev,
            normalizeItem({
              productId,
              quantity,
              product,
            }),
          ];
        });
      }
      setIsCartOpen(true);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!productId) return;
    const nextQty = Math.max(1, Number(quantity) || 1);

    setCartItems(prev => updateItemQuantity(prev, productId, nextQty));

    if (user) {
      try {
        await cartService.updateCartQuantity(productId, nextQty);
      } catch (error) {
        console.error("Error updating cart quantity:", error);
        await hydrateCart();
      }
    }
  };

  const removeFromCart = async productId => {
    if (!productId) return;

    setCartItems(prev => prev.filter(item => item.productId !== productId));

    if (user) {
      try {
        await cartService.removeFromCart(productId);
      } catch (error) {
        console.error("Error removing cart item:", error);
        await hydrateCart();
      }
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, cartCount, cartTotal, addToCart, updateQuantity, removeFromCart, loading, isCartOpen, openCart, closeCart, toggleCart }}>
      {children}
    </CartContext.Provider>
  );
};
