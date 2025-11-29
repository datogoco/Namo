import api from "../api/client";

let cachedCsrfToken = "";
let inFlightPromise = null;

export const ensureCsrfToken = async () => {
  if (cachedCsrfToken) return cachedCsrfToken;
  if (inFlightPromise) return inFlightPromise;

  inFlightPromise = fetch(`${import.meta.env.VITE_BACKEND_URL}/get-csrf-token`, { credentials: "include" })
    .then(res => res.json())
    .then(({ csrfToken }) => {
      cachedCsrfToken = csrfToken;
      api.defaults.headers["CSRF-Token"] = csrfToken;
      return csrfToken;
    })
    .finally(() => {
      inFlightPromise = null;
    });

  return inFlightPromise;
};

export const withCsrf = async () => {
  await ensureCsrfToken();
  return api;
};
