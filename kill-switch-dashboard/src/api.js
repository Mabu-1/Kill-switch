import axios from "axios";

// Keep your existing Vercel URL here
const SERVER_URL = "https://kill-switch-ivory.vercel.app"; 

export const getStores = async () => {
  const res = await axios.get(`${SERVER_URL}/stores`);
  return res.data;
};

export const addStore = async (clientName, storeName, message) => {
  const res = await axios.post(`${SERVER_URL}/add_store`, { clientName, storeName, message });
  return res.data;
};

export const toggleStatus = async (siteKey, status) => {
  const res = await axios.post(`${SERVER_URL}/toggle_status`, { key: siteKey, status });
  return res.data;
};

// --- NEW FUNCTION ---
export const deleteStore = async (siteKey) => {
  const res = await axios.delete(`${SERVER_URL}/delete_store/${siteKey}`);
  return res.data;
};