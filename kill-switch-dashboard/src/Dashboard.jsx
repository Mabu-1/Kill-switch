import React, { useEffect, useState } from "react";
import { getStores, addStore, toggleStatus, deleteStore } from "./api"; // Import deleteStore

// Keep your Vercel URL here
const SERVER_URL = "https://kill-switch-ivory.vercel.app"; 

const Dashboard = () => {
  const [stores, setStores] = useState([]);
  
  // Form Inputs
  const [clientName, setClientName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [message, setMessage] = useState("We are currently undergoing scheduled maintenance. Please check back later.");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedScript, setSelectedScript] = useState("");
  const [copySuccess, setCopySuccess] = useState("");

  const fetchStores = async () => {
    try {
      const data = await getStores();
      const resolved = Array.isArray(data) ? data : (data?.stores || []);
      setStores(resolved);
    } catch (err) {
      console.error("Error fetching stores:", err);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleAddStore = async () => {
    if (!clientName || !storeName) return alert("Please fill in Client Name and Store Name");
    try {
      await addStore(clientName, storeName, message);
      setClientName("");
      setStoreName("");
      setMessage("We are currently undergoing scheduled maintenance. Please check back later.");
      fetchStores();
    } catch (err) {
      alert("Failed to add store.");
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

  // --- DELETE HANDLER ---
  const handleDelete = async (siteKey) => {
    if (window.confirm("Are you sure you want to delete this store? This cannot be undone.")) {
      try {
        await deleteStore(siteKey);
        fetchStores(); // Refresh list
      } catch (err) {
        alert("Failed to delete store.");
      }
    }
  };

  const handleGenerateScript = (store) => {
    const scriptCode = `
<script>
  (function() {
    const SITE_KEY = "${store.siteKey}";
    const API_URL = "${SERVER_URL}";

    fetch(\`\${API_URL}/check_status/\${SITE_KEY}\`)
      .then(response => response.json())
      .then(data => {
        if (data.status === "OFF") {
          document.body.innerHTML = \`
            <div style="
              height: 100vh; 
              display: flex; 
              flex-direction: column; 
              justify-content: center; 
              align-items: center; 
              background-color: #f8f9fa; 
              color: #333; 
              font-family: Arial, sans-serif; 
              text-align: center;
              padding: 20px;
            ">
              <h1 style="font-size: 3rem; margin-bottom: 20px;">⚠️ Maintenance Mode</h1>
              <p style="font-size: 1.5rem; max-width: 600px;">\${data.message}</p>
            </div>
          \`;
        }
      })
      .catch(err => console.log("Kill Switch unreachable. Site remains active."));
  })();
</script>
    `;
    setSelectedScript(scriptCode.trim());
    setShowModal(true);
    setCopySuccess("");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(selectedScript);
    setCopySuccess("Copied! Ready to paste into Shopify.");
  };

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", color: "#111", marginBottom: "30px" }}>🎛️ Kill Switch Control Center</h1>

      {/* --- ADD NEW CLIENT --- */}
      <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", marginBottom: "40px", border: "1px solid #eaeaea" }}>
        <h3 style={{ marginTop: 0, color: "#444" }}>➕ Onboard New Client</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr auto", gap: "15px" }}>
          <input placeholder="Client Name" value={clientName} onChange={e => setClientName(e.target.value)} style={inputStyle} />
          <input placeholder="Store Name" value={storeName} onChange={e => setStoreName(e.target.value)} style={inputStyle} />
          <input placeholder="Custom Offline Message" value={message} onChange={e => setMessage(e.target.value)} style={inputStyle} />
          <button onClick={handleAddStore} style={createButtonStyle}>Create Client</button>
        </div>
      </div>

      {/* --- STORES TABLE --- */}
      <table style={{ width: "100%", borderCollapse: "collapse", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <thead style={{ backgroundColor: "#222", color: "white" }}>
          <tr>
            <th style={thStyle}>Client</th>
            <th style={thStyle}>Store</th>
            <th style={thStyle}>Message</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Installation</th>
            <th style={thStyle}>Action</th>
            <th style={thStyle}>Delete</th> {/* New Column */}
          </tr>
        </thead>
        <tbody>
          {stores.map((store) => (
            <tr key={store.siteKey} style={{ borderBottom: "1px solid #eee", textAlign: "center", backgroundColor: "white" }}>
              <td style={tdStyle}>{store.clientName}</td>
              <td style={tdStyle}>{store.storeName}</td>
              <td style={{...tdStyle, maxWidth: "200px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{store.message}</td>
              <td style={{ ...tdStyle, fontWeight: "bold", color: store.status === "ON" ? "#28a745" : "#dc3545" }}>
                {store.status === "ON" ? "● ONLINE" : "● OFFLINE"}
              </td>
              <td style={tdStyle}>
                <button onClick={() => handleGenerateScript(store)} style={codeButtonStyle}>&lt;/&gt; Get Script</button>
              </td>
              <td style={tdStyle}>
                <button 
                  onClick={() => handleToggle(store.siteKey, store.status)}
                  style={store.status === "ON" ? killButtonStyle : activateButtonStyle}
                >
                  {store.status === "ON" ? "KILL SITE" : "ACTIVATE"}
                </button>
              </td>
              <td style={tdStyle}>
                {/* DELETE BUTTON */}
                <button 
                  onClick={() => handleDelete(store.siteKey)}
                  style={deleteButtonStyle}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* --- SCRIPT MODAL --- */}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"15px"}}>
              <h3 style={{margin:0}}>📜 Installation Script</h3>
              <button onClick={() => setShowModal(false)} style={closeButtonStyle}>✕</button>
            </div>
            <p style={{color: "#666", fontSize: "0.9rem"}}>Copy this code and paste it inside <b>layout/theme.liquid</b> after the <code>&lt;body&gt;</code> tag.</p>
            <textarea readOnly value={selectedScript} style={textareaStyle} />
            <div style={{marginTop: "15px", textAlign: "right"}}>
              <span style={{color: "green", marginRight: "10px", fontWeight: "bold"}}>{copySuccess}</span>
              <button onClick={copyToClipboard} style={copyButtonStyle}>📋 Copy Code</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- STYLES ---
const inputStyle = { padding: "12px", border: "1px solid #ccc", borderRadius: "6px" };
const createButtonStyle = { backgroundColor: "#000", color: "white", border: "none", padding: "0 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" };
const thStyle = { padding: "15px", textAlign: "left" };
const tdStyle = { padding: "15px", textAlign: "left" };
const codeButtonStyle = { padding: "8px 12px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.9rem" };
const killButtonStyle = { padding: "8px 12px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" };
const activateButtonStyle = { padding: "8px 12px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" };
const deleteButtonStyle = { padding: "8px 12px", backgroundColor: "#666", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "1rem" }; // New Style

const modalOverlayStyle = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
const modalContentStyle = { backgroundColor: "white", padding: "25px", borderRadius: "10px", width: "600px", maxWidth: "90%", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" };
const textareaStyle = { width: "100%", height: "250px", fontFamily: "monospace", padding: "10px", backgroundColor: "#f4f4f4", border: "1px solid #ddd", borderRadius: "5px", fontSize: "0.85rem", resize: "none" };
const copyButtonStyle = { padding: "10px 20px", backgroundColor: "#0070f3", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" };
const closeButtonStyle = { background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#888" };

export default Dashboard;