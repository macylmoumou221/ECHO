// Centralized backend URL config
// Use Vite env variable VITE_API_URL if set, otherwise fall back to localhost
export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
