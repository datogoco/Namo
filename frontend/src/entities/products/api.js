import api from '../../shared/api/client';
import { ensureCsrfToken } from '../../shared/utils/http';

export const fetchProducts = async () => {
  const res = await api.get("/products");
  return res.data?.data?.products || [];
};

export const fetchProductById = async productId => {
  const res = await api.get(`/products/${productId}`);
  return res.data?.data?.product;
};

export const calculatePrice = async (productId, quantity) => {
  await ensureCsrfToken();
  const res = await api.post("/products/calculate-price", {
    productId,
    quantity,
  });
  return res.data?.updatedPrice;
};
