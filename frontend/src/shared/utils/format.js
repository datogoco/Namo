export const safeNumber = value => {
  const numeric = Number(value);
  if (Number.isFinite(numeric)) return numeric;
  const cleaned = Number(String(value || "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(cleaned) ? cleaned : 0;
};

export const formatCurrency = value =>
  Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(safeNumber(value));

export const debounce = (fn, delay = 300) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};
