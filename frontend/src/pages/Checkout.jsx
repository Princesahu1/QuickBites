import React, { useMemo, useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const ORDER_TYPE = { DINE_IN: "dine_in", TAKEAWAY: "takeaway" };

function PhoneInput({ value, onChange }) {
  const handleChange = (e) => {
    let v = e.target.value.replace(/[^+\d]/g, "");
    if (!v.startsWith("+")) v = "+" + v.replace(/\+/g, "");
    else v = "+" + v.slice(1).replace(/\+/g, "");
    if (v.length > 16) v = v.slice(0, 16);
    onChange(v);
  };
  return (
    <input type="tel" value={value} onChange={handleChange}
      placeholder="+91 9876543210" className="qb-input" />
  );
}

export default function Checkout() {
  const { items, total, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orderType, setOrderType] = useState(ORDER_TYPE.DINE_IN);
  const [tableNo, setTableNo] = useState("");
  const [placing, setPlacing] = useState(false);
  const [readyInMin, setReadyInMin] = useState(20);
  const [tableStates, setTableStates] = useState({ pending: [], occupied: [] }); // pending=yellow, occupied=red
  const [confirmingTable, setConfirmingTable] = useState(null); // table number awaiting popup confirm
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "+91",
    note: "", payMethod: "Cash",
  });

  const pickupTime = new Date(Date.now() + readyInMin * 60 * 1000).toISOString();

  // Fetch table states when Dine-In selected, refresh every 15s
  useEffect(() => {
    if (orderType !== ORDER_TYPE.DINE_IN) return;
    const fetchOccupied = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/orders/occupied-tables`);
        const data = await res.json();
        if (data.success) setTableStates(data.data || { pending: [], occupied: [] });
      } catch { /* silent */ }
    };
    fetchOccupied();
    const interval = setInterval(fetchOccupied, 15_000);
    return () => clearInterval(interval);
  }, [orderType]);

  // Auto-deselect if selected table becomes pending/occupied by someone else
  useEffect(() => {
    const allBlocked = [...tableStates.pending, ...tableStates.occupied];
    if (tableNo && allBlocked.includes(tableNo)) setTableNo("");
  }, [tableStates, tableNo]);

  const itemCount = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const tax = +(total * 0.05).toFixed(2);
  const finalAmount = +(total + tax).toFixed(2);

  useEffect(() => {
    if (user) setFormData(p => ({
      ...p, name: user.name || "", email: user.email || "", phone: user.phone || "+91"
    }));
  }, [user]);

  const handle = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!items.length) return toast.error("Your cart is empty.");
    if (formData.name.trim().length < 2) return toast.error("Please enter your name.");
    if (!/^\+\d{7,15}$/.test(formData.phone)) return toast.error("Enter a valid phone number.");
    if (orderType === ORDER_TYPE.DINE_IN && !tableNo) return toast.error("Please select your table.");

    const payload = {
      items: items.map(i => ({ menuItem: { id: i.id }, name: i.name, price: i.price, quantity: i.qty, subtotal: i.price * i.qty })),
      totalAmount: total, discount: 0, finalAmount, orderType,
      tableNumber: orderType === ORDER_TYPE.DINE_IN ? tableNo : null,
      customerInfo: { name: formData.name, phone: formData.phone, email: formData.email },
      pickupTime: orderType === ORDER_TYPE.TAKEAWAY ? pickupTime : null,
      readyInMinutes: orderType === ORDER_TYPE.TAKEAWAY ? readyInMin : null,
      paymentMethod: formData.payMethod.toLowerCase(),
      paymentStatus: "pending", notes: formData.note || null, status: "pending",
    };

    try {
      setPlacing(true);
      const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (orderType === ORDER_TYPE.DINE_IN && tableNo) {
          setTableStates(prev => ({
            ...prev,
            pending: [...prev.pending.filter(t => t !== tableNo), tableNo],
          }));
        }
        toast.success("🎉 Order placed!");
        clear();
        navigate("/orders");
      }
      else toast.error(data.message || "Failed to place order.");
    } catch { toast.error("Network error."); }
    finally { setPlacing(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }

        /* ── Light mode defaults ── */
        .qb-page {
          --bg:       #f9fafb;
          --surface:  #ffffff;
          --surface2: #f3f4f6;
          --border:   #e5e7eb;
          --border2:  #f3f4f6;
          --text:     #111827;
          --muted:    #6b7280;
          --subtle:   #9ca3af;
          --accent:   #ff5c2b;
          --accent-glow: rgba(255,92,43,.25);
          --input-bg: #f3f4f6;
          --chip-dine-bg: rgba(34,197,94,.08);
          --chip-dine-border: rgba(34,197,94,.2);
          --chip-dine-text: #16a34a;
          --chip-take-bg: rgba(255,92,43,.08);
          --chip-take-border: rgba(255,92,43,.2);
          --chip-take-text: #e8420a;
        }

        /* ── Dark mode (follows site's html.dark or prefers-color-scheme) ── */
        html.dark .qb-page,
        .dark .qb-page,
        [data-theme="dark"] .qb-page {
          --bg:       #0f0f0f;
          --surface:  #161616;
          --surface2: #0f0f0f;
          --border:   #232323;
          --border2:  #1e1e1e;
          --text:     #f0f0f0;
          --muted:    #666666;
          --subtle:   #3a3a3a;
          --accent:   #ff5c2b;
          --accent-glow: rgba(255,92,43,.3);
          --input-bg: #111111;
          --chip-dine-bg: rgba(34,197,94,.08);
          --chip-dine-border: rgba(34,197,94,.18);
          --chip-dine-text: #4ade80;
          --chip-take-bg: rgba(255,92,43,.08);
          --chip-take-border: rgba(255,92,43,.18);
          --chip-take-text: #ff5c2b;
        }




        .qb-page {
          min-height: 100vh;
          background: var(--bg);
          padding: 88px 20px 60px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--text);
          transition: background .3s, color .3s;
        }

        .qb-inner { max-width: 1080px; margin: 0 auto; }

        /* Hero */
        .qb-hero {
          margin-bottom: 36px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .qb-hero h1 {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 800;
          color: var(--text);
          margin: 0;
          letter-spacing: -1.5px;
          line-height: 1;
        }

        .qb-hero h1 span { color: var(--accent); }

        .qb-live-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--muted);
          font-size: 13px;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 30px;
        }

        .qb-live-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: var(--accent);
          animation: blink 1.8s infinite;
        }

        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }

        /* Layout */
        .qb-layout {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 20px;
          align-items: start;
        }

        @media(max-width:860px){ .qb-layout{ grid-template-columns:1fr; } }

        /* Card */
        .qb-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 28px;
          margin-bottom: 16px;
        }

        .qb-card-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--muted);
          margin: 0 0 22px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .qb-card-title::after {
          content:''; flex:1; height:1px; background: var(--border);
        }

        /* Toggle */
        .qb-toggle {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: var(--input-bg);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 5px;
          gap: 5px;
        }

        .qb-tab {
          padding: 15px;
          border: none;
          border-radius: 10px;
          background: transparent;
          color: var(--muted);
          font-family: inherit;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all .2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .qb-tab.on {
          background: var(--accent);
          color: #fff;
          box-shadow: 0 4px 20px var(--accent-glow);
        }

        /* Tables */
        .tbl-grid {
          display: grid;
          grid-template-columns: repeat(5,1fr);
          gap: 8px;
          margin-top: 20px;
        }

        @media(max-width:480px){ .tbl-grid{ grid-template-columns:repeat(4,1fr); } }

        .tbl-btn {
          aspect-ratio:1;
          background: var(--input-bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          color: var(--muted);
          font-family: inherit;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all .15s;
          display:flex; align-items:center; justify-content:center;
        }

        .tbl-btn:hover { border-color: var(--accent); color: var(--accent); }

        .tbl-btn.on {
          background: var(--accent);
          border-color: var(--accent);
          color: #fff;
          box-shadow: 0 4px 16px var(--accent-glow);
        }

        .tbl-selected {
          margin-top: 14px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,92,43,.08);
          border: 1px solid rgba(255,92,43,.2);
          color: var(--accent);
          font-size: 13px;
          font-weight: 700;
          padding: 8px 14px;
          border-radius: 10px;
        }

        /* Inputs */
        .qb-input {
          width: 100%;
          padding: 13px 16px;
          background: var(--input-bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          color: var(--text);
          font-family: inherit;
          font-size: 15px;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
        }

        .qb-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(255,92,43,.1);
        }

        .qb-input::placeholder { color: var(--subtle); }
        .qb-input[readonly] { color: var(--subtle); cursor: not-allowed; }

        /* datetime-local icon in dark mode */
        .qb-input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          filter: var(--cal-icon-filter, none);
          cursor: pointer;
          opacity: .6;
        }

        html.dark .qb-input[type="datetime-local"]::-webkit-calendar-picker-indicator,
        .dark .qb-input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
        }

        .qb-lbl {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }

        .qb-field { margin-bottom: 16px; }
        .qb-2col { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        @media(max-width:500px){ .qb-2col{ grid-template-columns:1fr; } }

        /* Payment */
        .pay-row { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }

        .pay-opt {
          padding: 16px 8px;
          background: var(--input-bg);
          border: 1px solid var(--border);
          border-radius: 14px;
          text-align: center;
          cursor: pointer;
          font-family: inherit;
          transition: all .18s;
        }

        .pay-opt:hover:not(.pay-off) { border-color: var(--accent); }
        .pay-opt.pay-on { background: rgba(255,92,43,.08); border-color: var(--accent); }
        .pay-opt.pay-off { opacity:.35; cursor:not-allowed; }

        .pay-ico { font-size:26px; display:block; margin-bottom:6px; }
        .pay-lbl { font-size:13px; font-weight:700; color: var(--muted); }
        .pay-opt.pay-on .pay-lbl { color: var(--accent); }
        .pay-sub { font-size:10px; color: var(--subtle); margin-top:3px; font-weight:500; }

        textarea.qb-input { resize:vertical; min-height:88px; }

        /* Summary */
        .qb-summary {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 28px;
          position: sticky;
          top: 88px;
        }

        .qb-sum-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 22px;
        }

        .qb-sum-head h2 {
          font-size: 20px;
          font-weight: 800;
          color: var(--text);
          margin: 0;
        }

        .qb-cnt {
          background: var(--accent);
          color: #fff;
          font-size: 12px;
          font-weight: 800;
          padding: 3px 10px;
          border-radius: 20px;
        }

        .qb-items-list { max-height:250px; overflow-y:auto; margin-bottom:20px; }
        .qb-items-list::-webkit-scrollbar{ width:3px; }
        .qb-items-list::-webkit-scrollbar-thumb{ background: var(--border); border-radius:3px; }

        .qb-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid var(--border2);
        }

        .qb-row:last-child { border-bottom:none; }

        .qb-thumb {
          width:50px; height:50px;
          border-radius:10px;
          object-fit:cover;
          background: var(--input-bg);
          flex-shrink:0;
        }

        .qb-row-info { flex:1; min-width:0; }
        .qb-row-name { font-size:14px; font-weight:600; color: var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .qb-row-qty { font-size:12px; color: var(--muted); margin-top:3px; }
        .qb-row-price { font-size:15px; font-weight:700; color: var(--text); }

        hr.qb-hr { border:none; border-top:1px solid var(--border2); margin:16px 0; }

        .qb-sum-row {
          display:flex; justify-content:space-between;
          font-size:14px; color: var(--muted); font-weight:500; margin-bottom:8px;
        }

        .qb-sum-row.big {
          font-size:22px; font-weight:800; color: var(--text);
          margin-top:12px; margin-bottom:0;
        }

        .qb-chip {
          margin-top:16px;
          padding:11px 16px;
          border-radius:12px;
          font-size:13px;
          font-weight:700;
          display:flex;
          align-items:center;
          gap:8px;
        }

        .qb-chip.green {
          background: var(--chip-dine-bg);
          border: 1px solid var(--chip-dine-border);
          color: var(--chip-dine-text);
        }

        .qb-chip.orange {
          background: var(--chip-take-bg);
          border: 1px solid var(--chip-take-border);
          color: var(--chip-take-text);
        }

        /* CTA */
        .qb-btn {
          width:100%;
          margin-top:24px;
          padding:17px;
          background: var(--accent);
          color:#fff;
          border:none;
          border-radius:14px;
          font-family:inherit;
          font-size:16px;
          font-weight:800;
          cursor:pointer;
          transition:all .2s;
          box-shadow: 0 8px 30px var(--accent-glow);
          display:flex;
          align-items:center;
          justify-content:center;
          gap:8px;
          letter-spacing:.3px;
        }

        .qb-btn:hover:not(:disabled) {
          background:#ff3d0d;
          transform:translateY(-2px);
          box-shadow: 0 12px 36px var(--accent-glow);
        }

        .qb-btn:disabled { opacity:.55; cursor:not-allowed; transform:none; }

        .qb-back {
          display:block; text-align:center;
          margin-top:14px;
          font-size:13px; font-weight:600;
          color: var(--muted); text-decoration:none;
          transition:color .15s;
        }

        .qb-back:hover { color: var(--accent); }
      `}</style>

      <div className="qb-page">
        <div className="qb-inner">

          <div className="qb-hero">
            <h1>Check<span>out</span></h1>
            <div className="qb-live-badge">
              <span className="qb-live-dot" />
              {itemCount} item{itemCount !== 1 ? "s" : ""} · Quick Bite Canteen
            </div>
          </div>

          <div className="qb-layout">
            <div>

              {/* Dining type */}
              <div className="qb-card">
                <p className="qb-card-title">How are you dining</p>
                <div className="qb-toggle">
                  <button className={`qb-tab ${orderType === ORDER_TYPE.DINE_IN ? "on" : ""}`}
                    onClick={() => setOrderType(ORDER_TYPE.DINE_IN)}>
                    🪑 Dine In
                  </button>
                  <button className={`qb-tab ${orderType === ORDER_TYPE.TAKEAWAY ? "on" : ""}`}
                    onClick={() => setOrderType(ORDER_TYPE.TAKEAWAY)}>
                    🥡 Takeaway
                  </button>
                </div>

                {orderType === ORDER_TYPE.DINE_IN && (
                  <>
                    <p className="qb-lbl" style={{ marginTop: 22, marginBottom: 0 }}>Select your table</p>
                    <div className="tbl-grid">
                      {Array.from({ length: 20 }, (_, i) => i + 1).map(n => {
                        const key = String(n);
                        const isPending  = tableStates.pending.includes(key);
                        const isOccupied = tableStates.occupied.includes(key);
                        const isSelected = tableNo === key;
                        const isBlocked  = isPending || isOccupied;

                        let btnStyle = {};
                        if (isOccupied) btnStyle = { background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.35)", color: "#ef4444", cursor: "not-allowed" };
                        else if (isPending) btnStyle = { background: "rgba(245,158,11,0.10)", borderColor: "rgba(245,158,11,0.45)", color: "#d97706", cursor: "not-allowed" };

                        return (
                          <button key={n}
                            disabled={isBlocked}
                            className={`tbl-btn ${isSelected ? "on" : ""}`}
                            style={btnStyle}
                            title={isOccupied ? "Occupied" : isPending ? "Pending — awaiting confirmation" : `Table ${n}`}
                            onClick={() => !isBlocked && setConfirmingTable(key)}>
                            {isOccupied ? "✕" : isPending ? "⏳" : n}
                          </button>
                        );
                      })}
                    </div>

                    {/* Legend */}
                    <div style={{ display: "flex", gap: 14, marginTop: 12, fontSize: 12, color: "var(--muted)", flexWrap: "wrap" }}>
                      {[
                        { color: "var(--accent)",           label: "Available" },
                        { color: "rgba(245,158,11,0.45)",   label: "Pending" },
                        { color: "rgba(239,68,68,0.35)",    label: "Occupied" },
                      ].map(({ color, label }) => (
                        <span key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <span style={{ width: 12, height: 12, borderRadius: 3, background: color, display: "inline-block" }} />
                          {label}
                        </span>
                      ))}
                    </div>

                    {tableNo && <div className="tbl-selected">✓ Table {tableNo} selected</div>}
                  </>
                )}

                {/* ── Table Confirmation Modal ── */}
                {confirmingTable && (
                  <div style={{
                    position: "fixed", inset: 0, zIndex: 1000,
                    background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
                    display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
                  }} onClick={() => setConfirmingTable(null)}>
                    <div style={{
                      background: "var(--surface)", border: "1px solid var(--border)",
                      borderRadius: 20, padding: "32px 28px", maxWidth: 340, width: "100%",
                      textAlign: "center", boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
                    }} onClick={e => e.stopPropagation()}>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>🪑</div>
                      <h3 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: "var(--text)" }}>
                        Table {confirmingTable}
                      </h3>
                      <p style={{ color: "var(--muted)", fontSize: 14, margin: "0 0 24px" }}>
                        Confirm this table for your dine-in order?
                      </p>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button
                          onClick={() => setConfirmingTable(null)}
                          style={{
                            flex: 1, padding: "12px", borderRadius: 12,
                            border: "1px solid var(--border)", background: "var(--input-bg)",
                            color: "var(--muted)", fontFamily: "inherit", fontSize: 15,
                            fontWeight: 700, cursor: "pointer",
                          }}>
                          Cancel
                        </button>
                        <button
                          onClick={() => { setTableNo(confirmingTable); setConfirmingTable(null); }}
                          style={{
                            flex: 1, padding: "12px", borderRadius: 12,
                            border: "none", background: "var(--accent)",
                            color: "#fff", fontFamily: "inherit", fontSize: 15,
                            fontWeight: 700, cursor: "pointer",
                            boxShadow: "0 4px 20px rgba(255,92,43,0.35)",
                          }}>
                          ✓ Confirm
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {orderType === ORDER_TYPE.TAKEAWAY && (
                  <div style={{ marginTop: 20 }}>
                    <label className="qb-lbl">When do you need it?</label>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 16, marginTop: 8,
                      background: "var(--input-bg)", border: "1px solid var(--border)",
                      borderRadius: 14, padding: "14px 20px"
                    }}>
                      <button
                        onClick={() => setReadyInMin(m => Math.max(20, m - 5))}
                        style={{
                          width: 40, height: 40, borderRadius: 10, border: "1px solid var(--border)",
                          background: "var(--surface)", color: "var(--text)", fontSize: 20,
                          fontWeight: 700, cursor: "pointer", flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center"
                        }}>−</button>
                      <div style={{ flex: 1, textAlign: "center" }}>
                        <div style={{ fontSize: 32, fontWeight: 800, color: "var(--accent)", lineHeight: 1 }}>
                          {readyInMin} min
                        </div>
                        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                          Ready by {new Date(Date.now() + readyInMin * 60 * 1000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                      <button
                        onClick={() => setReadyInMin(m => Math.min(60, m + 5))}
                        style={{
                          width: 40, height: 40, borderRadius: 10, border: "1px solid var(--border)",
                          background: "var(--surface)", color: "var(--text)", fontSize: 20,
                          fontWeight: 700, cursor: "pointer", flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center"
                        }}>+</button>
                    </div>
                    <p style={{ fontSize: 11, color: "var(--subtle)", marginTop: 6 }}>
                      Adjust in 5-min steps · 10 – 60 min
                    </p>
                  </div>
                )}
              </div>

              {/* Contact */}
              <div className="qb-card">
                <p className="qb-card-title">Your details</p>
                <div className="qb-2col">
                  <div className="qb-field">
                    <label className="qb-lbl">Full Name</label>
                    <input name="name" value={formData.name} onChange={handle}
                      placeholder="Your name" className="qb-input" />
                  </div>
                  <div className="qb-field">
                    <label className="qb-lbl">Phone</label>
                    <PhoneInput value={formData.phone}
                      onChange={v => setFormData(p => ({ ...p, phone: v }))} />
                  </div>
                </div>
                <div className="qb-field">
                  <label className="qb-lbl">Email</label>
                  <input name="email" value={formData.email} readOnly className="qb-input" />
                </div>
              </div>

              {/* Payment */}
              <div className="qb-card">
                <p className="qb-card-title">Payment method</p>
                <div className="pay-row">
                  {[
                    { k: "Cash", icon: "💵" },
                    { k: "UPI", icon: "📱", off: true },
                    { k: "Card", icon: "💳", off: true },
                  ].map(({ k, icon, off }) => (
                    <button key={k}
                      className={`pay-opt ${formData.payMethod === k ? "pay-on" : ""} ${off ? "pay-off" : ""}`}
                      onClick={() => !off && setFormData(p => ({ ...p, payMethod: k }))}>
                      <span className="pay-ico">{icon}</span>
                      <div className="pay-lbl">{k}</div>
                      {off && <div className="pay-sub">Coming soon</div>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="qb-card">
                <p className="qb-card-title">Kitchen notes — optional</p>
                <textarea name="note" value={formData.note} onChange={handle}
                  placeholder="Allergies, no onions, extra spicy…" className="qb-input" />
              </div>

            </div>

            {/* Summary */}
            <div>
              <div className="qb-summary">
                <div className="qb-sum-head">
                  <h2>Order Summary</h2>
                  <span className="qb-cnt">{itemCount}</span>
                </div>

                <div className="qb-items-list">
                  {items.length === 0
                    ? <p style={{ color: "var(--subtle)", textAlign: "center", padding: "20px 0", fontSize: 14 }}>Cart is empty</p>
                    : items.map(item => (
                      <div key={item.id} className="qb-row">
                        <img src={item.img} alt={item.name} className="qb-thumb"
                          onError={e => e.target.style.display = "none"} />
                        <div className="qb-row-info">
                          <div className="qb-row-name">{item.name}</div>
                          <div className="qb-row-qty">{item.qty} × ₹{item.price}</div>
                        </div>
                        <div className="qb-row-price">₹{item.qty * item.price}</div>
                      </div>
                    ))
                  }
                </div>

                <hr className="qb-hr" />
                <div className="qb-sum-row"><span>Subtotal</span><span>₹{total.toFixed(2)}</span></div>
                <div className="qb-sum-row"><span>GST (5%)</span><span>₹{tax.toFixed(2)}</span></div>
                <div className="qb-sum-row big"><span>Total</span><span>₹{finalAmount.toFixed(2)}</span></div>

                {orderType === ORDER_TYPE.DINE_IN && tableNo
                  ? <div className="qb-chip green">🪑 Table {tableNo} · Dine In</div>
                  : orderType === ORDER_TYPE.TAKEAWAY
                  ? <div className="qb-chip orange">🥡 Takeaway · {formData.payMethod}</div>
                  : null
                }

                <button className="qb-btn" onClick={placeOrder} disabled={placing}>
                  {placing ? "Placing…" : "Place Order →"}
                </button>
                <Link to="/menu" className="qb-back">← Back to menu</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}