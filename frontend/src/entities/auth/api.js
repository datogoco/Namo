import api from '../../shared/api/client';
import { ensureCsrfToken } from '../../shared/utils/http';

export const checkAuth = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/check-auth`, {
      credentials: "include",
    });
    const data = await res.json();
    return Boolean(data?.isAuthenticated);
  } catch {
    return false;
  }
};

export const fetchMe = async () => {
  try {
    const res = await api.get("/users/me");
    return res.data;
  } catch {
    return null;
  }
};

export const login = async (email, password) => {
  await ensureCsrfToken();
  const res = await api.post("/users/login", { email, password });
  return res.data;
};

export const signup = async payload => {
  await ensureCsrfToken();
  const res = await api.post("/users/signup", payload);
  return res.data;
};

export const logout = async () => {
  await ensureCsrfToken();
  await api.post("/users/logout");
};
