import axios from "axios";

const SERVER_URL = "http://localhost:5000";

export const getStores = async () => {
  const res = await axios.get(`${SERVER_URL}/stores`);
  return res.data;
};

// Updated to accept clientName
export const addStore = async (clientName, storeName, message) => {
  const res = await axios.post(`${SERVER_URL}/add_store`, { 
    clientName, 
    storeName, 
    message 
  });
  return res.data;
};

export const toggleStatus = async (siteKey, status) => {
  const res = await axios.post(`${SERVER_URL}/toggle_status`, { key: siteKey, status });
  return res.data;
};