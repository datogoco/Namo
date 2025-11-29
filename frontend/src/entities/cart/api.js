import api from '../../shared/api/client';
import { ensureCsrfToken } from '../../shared/utils/http';

export const fetchCart = async () => {
  const res = await api.get("/cart");
  return res.data;
};

export const addToCart = async (productId, quantity) => {
  await ensureCsrfToken();
  const res = await api.post("/cart/add", { productId, quantity });
  return res.data;
};

export const updateCartQuantity = async (productId, quantity) => {
  await ensureCsrfToken();
  const res = await api.post("/cart/update", { productId, quantity });
  return res.data;
};

export const removeFromCart = async productId => {
  await ensureCsrfToken();
  const res = await api.post("/cart/remove", { productId });
  return res.data;
};
