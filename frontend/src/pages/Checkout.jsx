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
    <main className="min-h-screen bg-gray-50 dark:bg-dark-bg pt-28 pb-20 px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[0%] left-[-10%] w-[50%] h-[50%] bg-coral-400/5 dark:bg-coral-900/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen -z-10" />

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <span className="text-coral-500 font-bold tracking-widest uppercase text-sm mb-2 block">Secure Checkout</span>
            <h1 className="text-4xl md:text-5xl font-extrabold font-display text-gray-900 dark:text-white tracking-tight">
              Complete your <span className="text-transparent bg-clip-text bg-gradient-to-r from-coral-400 to-coral-600">Order</span>
            </h1>
          </div>
          <div className="glass px-5 py-2.5 rounded-full flex items-center gap-3 backdrop-blur-md shadow-sm border border-coral-100 dark:border-dark-border">
            <span className="w-2.5 h-2.5 rounded-full bg-coral-500 animate-pulse"></span>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
              {itemCount} item{itemCount !== 1 ? "s" : ""} · Quick Bite
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Main Checkout Form */}
          <div className="lg:col-span-8 space-y-6">

            {/* Dining Type */}
            <div className="glass-card p-6 md:p-8">
              <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-coral-50 dark:bg-coral-900/30 text-coral-500 flex items-center justify-center text-sm">1</span>
                How are you dining?
              </h3>
              
              <div className="flex bg-gray-50 dark:bg-[#18181A] rounded-2xl p-1.5 border border-gray-100 dark:border-dark-border mb-8">
                <button 
                  className={`flex-1 py-3.5 rounded-xl font-bold transition-all shadow-sm ${orderType === ORDER_TYPE.DINE_IN ? "bg-white dark:bg-dark-card text-coral-500 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white shadow-none"}`}
                  onClick={() => setOrderType(ORDER_TYPE.DINE_IN)}
                >
                  🪑 Dine In
                </button>
                <button 
                  className={`flex-1 py-3.5 rounded-xl font-bold transition-all shadow-sm ${orderType === ORDER_TYPE.TAKEAWAY ? "bg-white dark:bg-dark-card text-coral-500 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white shadow-none"}`}
                  onClick={() => setOrderType(ORDER_TYPE.TAKEAWAY)}
                >
                  🥡 Takeaway
                </button>
              </div>

              {orderType === ORDER_TYPE.DINE_IN && (
                <div className="animate-fade-in">
                  <h4 className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-4">Select your table</h4>
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-5 xl:grid-cols-7 gap-3 mb-6">
                    {Array.from({ length: 20 }, (_, i) => i + 1).map(n => {
                      const key = String(n);
                      const isPending  = tableStates.pending.includes(key);
                      const isOccupied = tableStates.occupied.includes(key);
                      const isSelected = tableNo === key;
                      const isBlocked  = isPending || isOccupied;

                      return (
                        <button key={n}
                          disabled={isBlocked}
                          className={`aspect-square rounded-2xl font-bold text-lg transition-all border flex items-center justify-center
                            ${isOccupied ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 text-red-500 cursor-not-allowed opacity-50" : 
                              isPending ? "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30 text-amber-500 cursor-not-allowed opacity-70" : 
                              isSelected ? "bg-coral-500 border-coral-500 text-white shadow-lg shadow-coral-500/30 scale-105" : 
                              "bg-gray-50 dark:bg-[#18181A] border-gray-100 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:border-coral-300 dark:hover:border-coral-700 hover:text-coral-500"}`}
                          title={isOccupied ? "Occupied" : isPending ? "Pending — awaiting confirmation" : `Table ${n}`}
                          onClick={() => !isBlocked && setConfirmingTable(key)}>
                          {isOccupied ? "✕" : isPending ? "⏳" : n}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#18181A] p-4 rounded-2xl border border-gray-100 dark:border-dark-border">
                    <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-md bg-gray-200 dark:bg-gray-700"></div> Available</span>
                    <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-md bg-coral-500"></div> Selected</span>
                    <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-md bg-amber-400 opacity-70"></div> Pending</span>
                    <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-md bg-red-500 opacity-50"></div> Occupied</span>
                  </div>
                  
                  {tableNo && (
                    <div className="mt-4 px-4 py-3 bg-coral-50 dark:bg-coral-900/20 border border-coral-200 dark:border-coral-900/30 rounded-xl text-coral-600 dark:text-coral-400 font-bold flex items-center gap-2">
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                       Table {tableNo} Selected
                    </div>
                  )}
                </div>
              )}

              {/* Table Confirmation Modal */}
              {confirmingTable && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setConfirmingTable(null)}>
                  <div className="bg-white dark:bg-dark-card border border-white/20 dark:border-dark-border rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
                    <div className="text-6xl mb-4">🪑</div>
                    <h3 className="text-3xl font-display font-extrabold text-gray-900 dark:text-white mb-2">Table {confirmingTable}</h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">Confirm this table for your dine-in order?</p>
                    <div className="flex gap-4">
                      <button onClick={() => setConfirmingTable(null)} className="flex-1 py-3.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-[#18181A] hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                        Cancel
                      </button>
                      <button onClick={() => { setTableNo(confirmingTable); setConfirmingTable(null); }} className="flex-1 py-3.5 rounded-xl font-bold text-white bg-coral-500 shadow-lg shadow-coral-500/30 hover:bg-coral-600 transition-colors">
                        Confirm
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {orderType === ORDER_TYPE.TAKEAWAY && (
                <div className="animate-fade-in mt-6">
                  <h4 className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-4">When do you need it?</h4>
                  <div className="flex items-center gap-6 bg-gray-50 dark:bg-[#18181A] border border-gray-100 dark:border-dark-border rounded-2xl p-6">
                     <button
                        onClick={() => setReadyInMin(m => Math.max(20, m - 5))}
                        className="w-12 h-12 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card flex items-center justify-center text-gray-600 dark:text-gray-300 text-2xl font-bold hover:text-coral-500 hover:border-coral-300 transition-colors shadow-sm"
                     >−</button>
                     <div className="flex-1 text-center">
                        <div className="font-display font-extrabold text-4xl text-coral-500 mb-1">{readyInMin} <span className="text-xl">min</span></div>
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Ready by {new Date(Date.now() + readyInMin * 60 * 1000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                     </div>
                     <button
                        onClick={() => setReadyInMin(m => Math.min(60, m + 5))}
                        className="w-12 h-12 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card flex items-center justify-center text-gray-600 dark:text-gray-300 text-2xl font-bold hover:text-coral-500 hover:border-coral-300 transition-colors shadow-sm"
                     >+</button>
                  </div>
                  <p className="text-xs font-bold text-gray-400 mt-3 text-center">Adjust in 5-min steps (10 – 60 min)</p>
                </div>
              )}
            </div>

            {/* Contact */}
            <div className="glass-card p-6 md:p-8">
               <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-coral-50 dark:bg-coral-900/30 text-coral-500 flex items-center justify-center text-sm">2</span>
                Your details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-2 block">Full Name</label>
                  <input name="name" value={formData.name} onChange={handle} placeholder="John Doe" className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-2 block">Phone Number</label>
                  <PhoneInput value={formData.phone} onChange={v => setFormData(p => ({ ...p, phone: v }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-2 block">Email Address</label>
                  <input name="email" value={formData.email} readOnly className="input-field opacity-60 cursor-not-allowed" />
                </div>
              </div>
            </div>

            {/* Payment & Notes */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card p-6 md:p-8">
                 <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-coral-50 dark:bg-coral-900/30 text-coral-500 flex items-center justify-center text-sm">3</span>
                  Payment
                </h3>
                
                <div className="space-y-3">
                   {[
                    { k: "Cash", icon: "💵" },
                    { k: "UPI", icon: "📱", off: true },
                    { k: "Card", icon: "💳", off: true },
                  ].map(({ k, icon, off }) => (
                    <button key={k}
                      className={`w-full flex items-center p-4 rounded-2xl border transition-all ${off ? "opacity-40 cursor-not-allowed bg-gray-50 border-gray-100 dark:bg-[#18181A] dark:border-dark-border" : formData.payMethod === k ? "border-coral-500 bg-coral-50 dark:bg-coral-900/10 shadow-sm" : "border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card hover:border-coral-300"}`}
                      onClick={() => !off && setFormData(p => ({ ...p, payMethod: k }))}>
                      <span className="text-3xl mr-4">{icon}</span>
                      <div className="text-left flex-1">
                        <div className={`font-bold ${formData.payMethod === k ? "text-coral-600 dark:text-coral-400" : "text-gray-900 dark:text-white"}`}>{k}</div>
                        {off && <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Coming Soon</div>}
                      </div>
                      {!off && formData.payMethod === k && (
                        <div className="w-5 h-5 rounded-full bg-coral-500 text-white flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6 md:p-8 flex flex-col">
                 <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <span className="text-2xl">📝</span>
                  Kitchen Notes
                </h3>
                <textarea 
                  name="note" 
                  value={formData.note} 
                  onChange={handle}
                  placeholder="Any allergy? Less spicy? No onions? Let the chef know..." 
                  className="input-field flex-1 min-h-[140px] resize-none pb-4" 
                />
              </div>
            </div>

          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4">
            <div className="glass-card p-6 sticky top-28">
              <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-100 dark:border-dark-border flex justify-between items-center">
                Order Summary
                <span className="bg-coral-100 dark:bg-coral-900/30 text-coral-600 dark:text-coral-400 text-sm py-1 px-3 rounded-full">{itemCount} items</span>
              </h2>

              <div className="max-h-[300px] overflow-y-auto pr-2 mb-6 space-y-4 custom-scrollbar">
                {items.length === 0 ? (
                  <p className="text-gray-500 text-center py-4 font-medium">Your cart is empty</p>
                ) : (
                  items.map(item => (
                    <div key={item.id} className="flex items-center gap-4">
                      <img src={item.img} alt={item.name} className="w-14 h-14 rounded-xl object-cover bg-gray-100 dark:bg-dark-border" onError={e => e.target.style.display = "none"} />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 dark:text-white truncate">{item.name}</div>
                        <div className="text-sm text-gray-500 font-medium mt-0.5">{item.qty} × ₹{item.price}</div>
                      </div>
                      <div className="font-extrabold text-gray-900 dark:text-white">₹{item.qty * item.price}</div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-dark-border space-y-3 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400 font-medium">
                  <span>Subtotal</span><span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400 font-medium">
                  <span>GST (5%)</span><span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-extrabold text-gray-900 dark:text-white pt-3 mt-3 border-t border-gray-100 dark:border-dark-border">
                  <span>Total To Pay</span><span className="text-coral-500">₹{finalAmount.toFixed(2)}</span>
                </div>
              </div>

              <button 
                className={`w-full py-4 text-lg justify-center font-bold rounded-xl transition-all shadow-lg flex items-center gap-2 ${placing ? "bg-gray-400 cursor-wait shadow-none" : "btn-primary shadow-coral-500/40"}`} 
                onClick={placeOrder} 
                disabled={placing}
              >
                {placing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Placing Order...
                  </>
                ) : (
                  <>Confirm & Pay ₹{finalAmount.toFixed(2)} <span className="text-xl leading-none">→</span></>
                )}
              </button>
              
              <Link to="/cart" className="block text-center text-gray-500 font-bold hover:text-coral-500 transition-colors mt-6">
                ← Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}