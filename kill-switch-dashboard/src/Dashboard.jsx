import React, { useEffect, useState } from "react";
import { getStores, addStore, toggleStatus } from "./api";

const Dashboard = () => {
  const [stores, setStores] = useState([]);
  
  // Form States
  const [clientName, setClientName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [message, setMessage] = useState("This site is temporarily unavailable due to maintenance.");

  // Fetch Logic
  const fetchStores = async () => {
    try {
      const data = await getStores();
      // Handle different API response structures just in case
      const resolved = Array.isArray(data) ? data : (data?.stores || []);
      setStores(resolved);
    } catch (err) {
      console.error("Error fetching stores:", err);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  // Handlers
  const handleAddStore = async () => {
    if (!clientName || !storeName) return alert("Please fill in Client Name and Store Name");

    try {
      await addStore(clientName, storeName, message);
      // Reset form
      setClientName("");
      setStoreName("");
      setMessage("This site is temporarily unavailable due to maintenance.");
      // Refresh list
      fetchStores();
    } catch (err) {
      alert("Failed to add store. Check console.");
    }
  };

  const handleToggle = async (siteKey, currentStatus) => {
    const newStatus = currentStatus === "ON" ? "OFF" : "ON";
    try {
      await toggleStatus(siteKey, newStatus);
      fetchStores();
    } catch (err) {
      alert("Failed to toggle status.");
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif", maxWidth: "1000px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", color: "#333" }}>🎛️ Kill Switch Control Center</h1>

      {/* --- ADD NEW CLIENT SECTION --- */}
      <div style={{ 
        backgroundColor: "#f4f6f8", 
        padding: "25px", 
        borderRadius: "10px", 
        marginBottom: "40px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
      }}>
        <h3 style={{ marginTop: 0 }}>➕ Onboard New Client</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "10px" }}>
          <input 
            placeholder="Client Name" 
            value={clientName} 
            onChange={e => setClientName(e.target.value)} 
            style={{ padding: "10px" }}
          />
          <input 
            placeholder="Store Name" 
            value={storeName} 
            onChange={e => setStoreName(e.target.value)} 
            style={{ padding: "10px" }}
          />
          <input 
            placeholder="Offline Message" 
            value={message} 
            onChange={e => setMessage(e.target.value)} 
            style={{ padding: "10px" }}
          />
          <button 
            onClick={handleAddStore}
            style={{ 
              backgroundColor: "#28a745", 
              color: "white", 
              border: "none", 
              padding: "0 20px", 
              cursor: "pointer",
              fontWeight: "bold",
              borderRadius: "4px"
            }}
          >
            Create
          </button>
        </div>
      </div>

      {/* --- DATABASE TABLE --- */}
      <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ddd" }}>
        <thead style={{ backgroundColor: "#333", color: "white" }}>
          <tr>
            <th style={{ padding: "12px" }}>Client</th>
            <th style={{ padding: "12px" }}>Store</th>
            <th style={{ padding: "12px" }}>Site Key (Auto-Generated)</th>
            <th style={{ padding: "12px" }}>Status</th>
            <th style={{ padding: "12px" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((store) => (
            <tr key={store.siteKey} style={{ borderBottom: "1px solid #eee", textAlign: "center" }}>
              <td style={{ padding: "12px" }}>{store.clientName}</td>
              <td style={{ padding: "12px" }}>{store.storeName}</td>
              <td style={{ padding: "12px", fontFamily: "monospace", color: "#d63384", background: "#fff0f6" }}>
                {store.siteKey}
              </td>
              <td style={{ 
                padding: "12px", 
                fontWeight: "bold", 
                color: store.status === "ON" ? "green" : "red" 
              }}>
                {store.status}
              </td>
              <td style={{ padding: "12px" }}>
                <button 
                  onClick={() => handleToggle(store.siteKey, store.status)}
                  style={{ 
                    padding: "8px 16px", 
                    cursor: "pointer",
                    backgroundColor: store.status === "ON" ? "#dc3545" : "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px"
                  }}
                >
                  {store.status === "ON" ? "KILL SWITCH" : "ACTIVATE"}
                </button>
              </td>
            </tr>
          ))}
          {stores.length === 0 && (
            <tr>
              <td colSpan="5" style={{ padding: "20px", textAlign: "center", color: "#888" }}>
                No stores found. Add one above!
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;