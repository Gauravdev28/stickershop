const { useState, useEffect, useRef } = React;
const { motion, AnimatePresence } = window.Motion;

// --- FIREBASE CONFIG (Shared) ---
const firebaseConfig = {
    apiKey: "AIzaSyCFMaEPIvkn1t9bs583Yy8tiBkWUMtr4t8",
    authDomain: "stickershop-gauravagl.firebaseapp.com",
    projectId: "stickershop-gauravagl",
    storageBucket: "stickershop-gauravagl.firebasestorage.app",
    messagingSenderId: "673473629818",
    appId: "1:673473629818:web:aa4a50bd510b391d2675c3"
};

let db;
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
} catch (e) {
    console.log("Firebase already initialized or error", e);
}

const inputStyle = {
    background: '#0F172A', border: '1px solid #334155', color: 'white',
    padding: '15px', borderRadius: '8px', fontSize: '1rem', width: '100%'
};

const Toast = ({ message, isVisible }) => (
    <AnimatePresence>
        {isVisible && (
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                style={{
                    position: 'fixed', bottom: '30px', right: '30px',
                    background: '#111', color: 'white', padding: '16px 24px',
                    borderRadius: '8px', zIndex: 10000,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    border: '1px solid #333', display: 'flex', alignItems: 'center', gap: '10px'
                }}
            >
                <span style={{ fontSize: '1.2rem' }}>✅</span> {message}
            </motion.div>
        )}
    </AnimatePresence>
);

const AdminDashboard = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]); // Inventory State
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '' });
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'inventory'
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null); // Product being edited/added
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);

    const showToast = (msg) => {
        setToast({ show: true, message: msg });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    // Monitor Auth State
    useEffect(() => {
        const unsubscribe = firebase.auth().onAuthStateChanged((u) => {
            setUser(u);
            if (u) {
                fetchOrders();
                fetchProducts();
            }
        });
        return () => unsubscribe();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await firebase.auth().signInWithEmailAndPassword(email, password);
            showToast("✅ Welcome CleanStix Admin");
        } catch (error) {
            console.error(error);
            showToast("❌ Login Failed");
        }
    };

    const handleLogout = async () => {
        await firebase.auth().signOut();
        setOrders([]);
        setProducts([]);
        showToast("👋 Logged Out");
    };

    // --- ORDER MANAGEMENT ---
    const fetchOrders = async () => {
        setLoading(true);
        try {
            const snapshot = await db.collection('orders').limit(100).get();
            const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            fetchedOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
            setOrders(fetchedOrders);
        } catch (error) {
            console.error(error);
            showToast("Failed to load orders");
        }
        setLoading(false);
    };

    const updateStatus = async (orderId, newStatus) => {
        if (!confirm(`Mark order as ${newStatus}?`)) return;
        try {
            await db.collection('orders').doc(orderId).update({ status: newStatus });
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            showToast(`Order marked as ${newStatus}`);
        } catch (error) {
            console.error(error);
            showToast("Update failed");
        }
    };

    const deleteOrder = async (orderId) => {
        if (!confirm("⚠️ PERMANENTLY DELETE current order? This cannot be undone.")) return;
        try {
            await db.collection('orders').doc(orderId).delete();
            setOrders(prev => prev.filter(o => o.id !== orderId));
            showToast("🗑️ Order deleted forever.");
            if (selectedOrder?.id === orderId) setSelectedOrder(null);
        } catch (error) {
            console.error(error);
            showToast("Delete failed");
        }
    };

    // --- INVENTORY MANAGEMENT ---
    const fetchProducts = async () => {
        try {
            const snapshot = await db.collection('products').get();
            const fetchedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProducts(fetchedProducts);
        } catch (error) {
            console.error("Error fetching products", error);
        }
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const productData = {
            name: formData.get('name'),
            price: Number(formData.get('price')),
            image: formData.get('image'), // Emoji for now, URL if using storage
            category: formData.get('category'),
            badge: formData.get('badge') || null,
            size: formData.get('size') || "3 x 3 inches"
        };

        try {
            if (editingProduct) {
                await db.collection('products').doc(editingProduct.id).update(productData);
                setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...productData } : p));
                showToast("✨ Product updated!");
            } else {
                const docRef = await db.collection('products').add(productData);
                setProducts(prev => [...prev, { id: docRef.id, ...productData }]);
                showToast("✨ New product added!");
            }
            setIsProductModalOpen(false);
            setEditingProduct(null);
        } catch (error) {
            console.error(error);
            showToast("Failed to save product");
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!confirm("Delete this sticker? It will be gone from the shop.")) return;
        try {
            await db.collection('products').doc(productId).delete();
            setProducts(prev => prev.filter(p => p.id !== productId));
            showToast("🗑️ Product deleted.");
        } catch (error) {
            console.error(error);
            showToast("Failed to delete product");
        }
    };

    const migrateInitialProducts = async () => {
        if (!confirm("Import default stickers? Do this only once!")) return;
        const INITIAL_PRODUCTS = [
            { name: "ACID SMILEY", price: 20, category: "vinyl", image: "🥴", badge: "BESTSELLER", size: "3 x 3 inches" },
            { name: "CYBER SKULL", price: 20, category: "holo", image: "💀", size: "2.5 x 4 inches" },
            { name: "GLITCH GHOST", price: 20, category: "vinyl", image: "👻", size: "3 x 2.8 inches" },
            { name: "NEON ALIEN", price: 20, category: "glow", image: "👽", badge: "NEW", size: "3.5 x 4 inches" },
            { name: "RETRO CASSETTE", price: 20, category: "vinyl", image: "📼", size: "4 x 2.5 inches" },
            { name: "VAPORWAVE PALM", price: 20, category: "holo", image: "🌴", size: "3 x 3.5 inches" },
            { name: "ERROR 404", price: 20, category: "vinyl", image: "⚠️", size: "3 x 1.5 inches" },
            { name: "LASER EYES", price: 20, category: "holo", image: "👀", badge: "HOT", size: "4 x 1 inches" }
        ];

        try {
            const batch = db.batch();
            INITIAL_PRODUCTS.forEach(p => {
                const ref = db.collection('products').doc();
                batch.set(ref, p);
            });
            await batch.commit();
            fetchProducts();
            showToast("🚀 Migration Complete! 8 Products Added.");
        } catch (e) {
            console.error(e);
            showToast("Migration Failed");
        }
    };

    const printInvoice = (order) => {
        // GROUP ITEMS DYNAMICALLY FOR INVOICE
        const groupedItems = order.items.reduce((acc, item) => {
            const existing = acc.find(i => i.name === item.name); // Group by NAME to be safe across versions
            if (existing) {
                existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
            } else {
                acc.push({ ...item, quantity: item.quantity || 1 });
            }
            return acc;
        }, []);

        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write(`
            <html>
            <head>
                <title>INVOICE #${order.id.slice(0, 6)}</title>
                <style>
                    /* A5 Size equivalent styling for A4 Sheet (Approx half height) */
                    @page { size: A5 landscape; margin: 0; }
                    body { 
                        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
                        padding: 40px; 
                        max-width: 148mm; /* A5 Width */
                        margin: 0 auto;
                        color: #333;
                        font-size: 10px;
                    }
                    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    .logo { font-size: 1.5rem; font-weight: 900; letter-spacing: -1px; }
                    .invoice-meta { text-align: right; }
                    .invoice-meta h1 { margin: 0; font-size: 1.2rem; color: #666; }
                    
                    .info-grid { display: flex; justify-content: space-between; margin-bottom: 20px; }
                    .info-col h3 { margin: 0 0 5px 0; font-size: 0.7rem; color: #888; text-transform: uppercase; letter-spacing: 1px; }
                    .info-col p { margin: 0; line-height: 1.4; font-weight: 500; }
                    
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th { text-align: left; padding: 8px 0; border-bottom: 1px solid #ddd; font-size: 0.7rem; color: #888; text-transform: uppercase; }
                    td { padding: 8px 0; border-bottom: 1px solid #eee; }
                    .col-right { text-align: right; }
                    
                    .totals { float: right; width: 40%; }
                    .total-row { display: flex; justify-content: space-between; padding: 5px 0; }
                    .total-final { border-top: 2px solid #333; font-weight: bold; font-size: 1.1rem; padding-top: 10px; margin-top: 5px; }
                    
                    .footer { clear: both; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 0.6rem; color: #888; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo" style="display: flex; align-items: center; gap: 8px;">
                        <img src="logo.png" alt="Logo" style="width: 32px; height: 32px;">
                        <span style="font-weight: 900; font-size: 1.2rem;">X.</span>
                    </div>
                    <div class="invoice-meta">
                        <h1>INVOICE</h1>
                        <div>#${order.id.slice(0, 8).toUpperCase()}</div>
                        <div>${new Date(order.date).toLocaleString()}</div>
                    </div>
                </div>

                <div class="info-grid">
                    <div class="info-col">
                        <h3>Billed To</h3>
                        <p>
                            ${order.customer.name}<br/>
                            ${order.customer.phone || ''}<br/>
                            ${order.customer.email}
                        </p>
                    </div>
                    <div class="info-col" style="text-align: right;">
                        <h3>Shipped To</h3>
                        <p>
                            ${order.customer.address}<br/>
                            ${order.customer.city}, ${order.customer.zip}
                        </p>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style="width: 50%">Description</th>
                            <th class="col-right">Qty</th>
                            <th class="col-right">Price</th>
                            <th class="col-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${groupedItems.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td class="col-right">${item.quantity || 1}</td>
                                <td class="col-right">₹${item.price}</td>
                                <td class="col-right">₹${item.price * (item.quantity || 1)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="totals">
                    <div class="total-row">
                        <span>Subtotal</span>
                        <span>₹${order.subtotal}</span>
                    </div>
                    <div class="total-row">
                        <span>Shipping</span>
                        <span>₹${order.shipping}</span>
                    </div>
                    <div class="total-row total-final">
                        <span>Total</span>
                        <span>₹${order.total}</span>
                    </div>
                </div>

                <div class="footer">
                    Thank you for your business! | www.clearstix.com<br/>
                    For support, contact support@clearstix.com
                </div>
                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };


    return (
        <div style={{ minHeight: '100vh', padding: '40px', background: '#0F172A', color: 'white' }}>
            <Toast message={toast.message} isVisible={toast.show} />

            {/* PRODUCT MODAL */}
            <AnimatePresence>
                {isProductModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    >
                        <div style={{ background: '#1E293B', padding: '30px', borderRadius: '12px', width: '400px', border: '1px solid #334155' }}>
                            <h2 style={{ marginBottom: '20px' }}>{editingProduct ? 'EDIT STICKER' : 'NEW STICKER'}</h2>
                            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <input name="name" placeholder="Sticker Name (e.g. Acid Smiley)" defaultValue={editingProduct?.name} style={inputStyle} required />
                                <input name="image" placeholder="Emoji (e.g. 💀) or Image URL" defaultValue={editingProduct?.image} style={inputStyle} required />
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input name="price" type="number" placeholder="Price (₹)" defaultValue={editingProduct?.price || 20} style={inputStyle} required />
                                    <input name="category" placeholder="Category (vinyl/holo)" defaultValue={editingProduct?.category} style={inputStyle} required />
                                </div>
                                <input name="size" placeholder="Size (e.g. 3 x 3 inches)" defaultValue={editingProduct?.size} style={inputStyle} />
                                <input name="badge" placeholder="Badge (Optional: NEW, HOT)" defaultValue={editingProduct?.badge} style={inputStyle} />

                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <button type="button" onClick={() => setIsProductModalOpen(false)} style={{ flex: 1, padding: '12px', background: 'transparent', color: 'white', border: '1px solid #64748B', borderRadius: '8px', cursor: 'pointer' }}>CANCEL</button>
                                    <button type="submit" style={{ flex: 1, padding: '12px', background: '#A18CD1', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>SAVE</button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Order Details Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => setSelectedOrder(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{ background: '#1E293B', padding: '30px', borderRadius: '16px', maxWidth: '700px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <h2>ORDER DETAILS #{selectedOrder.id.slice(0, 6)}</h2>
                                <button onClick={() => setSelectedOrder(null)} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px', background: '#0F172A', padding: '20px', borderRadius: '8px' }}>
                                <div>
                                    <h4 style={{ color: '#94A3B8', marginBottom: '10px' }}>CUSTOMER</h4>
                                    <div>{selectedOrder.customer.name}</div>
                                    <div style={{ color: '#A18CD1' }}>{selectedOrder.customer.email}</div>
                                    <div>{selectedOrder.customer.phone}</div>
                                </div>
                                <div>
                                    <h4 style={{ color: '#94A3B8', marginBottom: '10px' }}>SHIPPING ADDRESS</h4>
                                    <div>{selectedOrder.customer.address}</div>
                                    <div>{selectedOrder.customer.city}, {selectedOrder.customer.zip}</div>
                                </div>
                            </div>

                            <h4 style={{ color: '#94A3B8', marginBottom: '10px' }}>ITEMS ({selectedOrder.items.length})</h4>
                            <div style={{ marginBottom: '20px', border: '1px solid #334155', borderRadius: '8px', overflow: 'hidden' }}>
                                {(() => {
                                    // GROUP ITEMS FOR DISPLAY
                                    const groupedDisplayItems = selectedOrder.items.reduce((acc, item) => {
                                        const existing = acc.find(i => i.name === item.name);
                                        if (existing) {
                                            existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
                                        } else {
                                            acc.push({ ...item, quantity: item.quantity || 1 });
                                        }
                                        return acc;
                                    }, []);

                                    return groupedDisplayItems.map((item, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid #334155', background: i % 2 === 0 ? '#1E293B' : '#0F172A' }}>
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <span style={{ fontSize: '1.2rem' }}>{item.image || '📦'}</span>
                                                <span>{item.name}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '20px' }}>
                                                <span>x{item.quantity || 1}</span>
                                                <span style={{ fontWeight: 'bold' }}>₹{item.price * (item.quantity || 1)}</span>
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '30px', borderTop: '1px solid #334155', paddingTop: '20px' }}>
                                <span>TOTAL AMOUNT</span>
                                <span>₹{selectedOrder.total}</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                <button
                                    onClick={() => printInvoice(selectedOrder)}
                                    style={{ background: '#3B82F6', color: 'white', border: 'none', padding: '15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    📄 BILL
                                </button>
                                {(() => {
                                    // PREPARE INVOICE TEXT for Email Body
                                    const groupedEmailItems = selectedOrder.items.reduce((acc, item) => {
                                        const existing = acc.find(i => i.name === item.name);
                                        if (existing) {
                                            existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
                                        } else {
                                            acc.push({ ...item, quantity: item.quantity || 1 });
                                        }
                                        return acc;
                                    }, []);

                                    const line = "----------------------------------------";
                                    let emailBody = `INVOICE #${selectedOrder.id.slice(0, 6)}\n`;
                                    emailBody += `Date: ${new Date(selectedOrder.date).toLocaleDateString()}\n\n`;
                                    emailBody += `BILLED TO:\n${selectedOrder.customer.name}\n${selectedOrder.customer.phone || ''}\n\n`;
                                    emailBody += `ITEMS:\n${line}\n`;

                                    groupedEmailItems.forEach(item => {
                                        emailBody += `${item.name} (x${item.quantity || 1}) - Rs. ${item.price * (item.quantity || 1)}\n`;
                                    });

                                    emailBody += `${line}\n`;
                                    emailBody += `Subtotal: Rs. ${selectedOrder.subtotal}\n`;
                                    emailBody += `Shipping: Rs. ${selectedOrder.shipping}\n`;
                                    emailBody += `TOTAL:    Rs. ${selectedOrder.total}\n${line}\n\n`;
                                    emailBody += `Thank you for shopping with ClearStix!\n`;
                                    emailBody += `Track your order at: https://stickershop-gauravagl.web.app/`;

                                    const mailtoLink = `mailto:${selectedOrder.customer.email}?subject=Your Invoice #${selectedOrder.id.slice(0, 6)} - CLEARSTIX&body=${encodeURIComponent(emailBody)}`;

                                    return (
                                        <a
                                            href={mailtoLink}
                                            style={{ background: '#10B981', color: 'white', border: 'none', padding: '15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}
                                        >
                                            ✉️ SEND INVOICE
                                        </a>
                                    );
                                })()}
                                <button
                                    onClick={() => deleteOrder(selectedOrder.id)}
                                    style={{ background: 'transparent', border: '1px solid #EF4444', color: '#EF4444', padding: '15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
                                >
                                    🗑️ DELETE
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <h1 style={{ marginBottom: '40px', color: '#A18CD1', textAlign: 'center', fontSize: '3rem' }}>COMMAND CENTER 🔒</h1>

                {!user ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ maxWidth: '400px', margin: '0 auto', background: '#1E293B', padding: '40px', borderRadius: '20px', border: '1px solid #334155' }}
                    >
                        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#94A3B8', fontSize: '0.9rem' }}>ADMIN EMAIL</label>
                                <input
                                    type="email"
                                    placeholder="admin@clearstix.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#94A3B8', fontSize: '0.9rem' }}>PASSWORD</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                            <button type="submit" className="cta-button" style={{ width: '100%', marginTop: '10px' }}>SECURE LOGIN</button>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1E293B', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <div style={{ background: '#10B981', width: '10px', height: '10px', borderRadius: '50%' }}></div>
                                <div>
                                    <h3 style={{ margin: 0, color: 'white' }}>SYSTEM ONLINE</h3>
                                    <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Logged in as {user.email}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => setActiveTab('orders')}
                                    style={{
                                        background: activeTab === 'orders' ? '#3B82F6' : 'transparent',
                                        color: 'white', border: activeTab === 'orders' ? 'none' : '1px solid #3B82F6',
                                        padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
                                    }}
                                >
                                    📦 ORDERS
                                </button>
                                <button
                                    onClick={() => setActiveTab('inventory')}
                                    style={{
                                        background: activeTab === 'inventory' ? '#A18CD1' : 'transparent',
                                        color: 'white', border: activeTab === 'inventory' ? 'none' : '1px solid #A18CD1',
                                        padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
                                    }}
                                >
                                    🏷️ INVENTORY
                                </button>
                                <button onClick={handleLogout} style={{ background: '#EF4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginLeft: '20px' }}>LOGOUT</button>
                            </div>
                        </div>

                        {activeTab === 'orders' ? (
                            loading ? <p style={{ color: '#94A3B8', textAlign: 'center' }}>Syncing orders...</p> : (
                                <div style={{ overflowX: 'auto', background: '#1E293B', borderRadius: '12px', border: '1px solid #334155' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white', fontSize: '0.9rem' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid #475569', textAlign: 'left', background: '#0F172A' }}>
                                                <th style={{ padding: '20px' }}>DATE</th>
                                                <th style={{ padding: '20px' }}>ORDER ID</th>
                                                <th style={{ padding: '20px' }}>CUSTOMER</th>
                                                <th style={{ padding: '20px' }}>TOTAL</th>
                                                <th style={{ padding: '20px' }}>STATUS</th>
                                                <th style={{ padding: '20px' }}>ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map(order => (
                                                <tr key={order.id} style={{ borderBottom: '1px solid #334155' }}>
                                                    <td style={{ padding: '20px', color: '#94A3B8' }}>{new Date(order.date).toLocaleDateString()}</td>
                                                    <td style={{ padding: '20px' }}>
                                                        <div
                                                            onClick={() => setSelectedOrder(order)}
                                                            style={{ fontWeight: 'bold', color: '#A18CD1', cursor: 'pointer', textDecoration: 'underline' }}
                                                        >
                                                            #{order.id.slice(0, 6)}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '20px' }}>
                                                        <div style={{ fontWeight: 'bold' }}>{order.customer.name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{order.customer.email}</div>
                                                    </td>
                                                    <td style={{ padding: '20px', fontWeight: 'bold', fontSize: '1.1rem' }}>₹{order.total}</td>
                                                    <td style={{ padding: '20px' }}>
                                                        <span style={{
                                                            background: order.status === 'paid' ? '#10B981' : (order.status === 'shipped' ? '#3B82F6' : (order.status === 'cancelled' ? '#EF4444' : '#F59E0B')),
                                                            color: order.status === 'cancelled' ? 'white' : '#000', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold'
                                                        }}>
                                                            {order.status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '20px' }}>
                                                        <div style={{ display: 'flex', gap: '10px' }}>
                                                            {order.status !== 'paid' && order.status !== 'shipped' && order.status !== 'cancelled' && (
                                                                <button
                                                                    onClick={() => updateStatus(order.id, 'paid')}
                                                                    style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10B981', color: '#10B981', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
                                                                >
                                                                    MARK PAID
                                                                </button>
                                                            )}
                                                            {order.status === 'paid' && (
                                                                <button
                                                                    onClick={() => updateStatus(order.id, 'shipped')}
                                                                    style={{ background: 'rgba(59, 130, 246, 0.2)', border: '1px solid #3B82F6', color: '#3B82F6', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
                                                                >
                                                                    SHIP IT
                                                                </button>
                                                            )}
                                                            {order.status !== 'cancelled' && order.status !== 'shipped' && (
                                                                <button
                                                                    onClick={() => updateStatus(order.id, 'cancelled')}
                                                                    style={{ background: 'transparent', border: '1px solid #EF4444', color: '#EF4444', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
                                                                    title="Cancel Order"
                                                                >
                                                                    ✕
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => deleteOrder(order.id)}
                                                                style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '1rem' }}
                                                                title="Delete Permanently"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        ) : (
                            /* INVENTORY TAB */
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                    <button
                                        onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
                                        style={{ background: '#10B981', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', gap: '8px', alignItems: 'center' }}
                                    >
                                        <span>+ ADD NEW STICKER</span>
                                    </button>

                                    {products.length === 0 && (
                                        <button
                                            onClick={migrateInitialProducts}
                                            style={{ background: '#334155', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            ⚠️ MIGRATE INITIAL DATA
                                        </button>
                                    )}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                                    {products.map(product => (
                                        <div key={product.id} style={{ background: '#1E293B', padding: '20px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <div style={{ fontSize: '3rem', textAlign: 'center', background: '#0F172A', padding: '20px', borderRadius: '8px' }}>
                                                {product.image}
                                            </div>
                                            <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{product.name}</div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
                                                <span>{product.category}</span>
                                                <span style={{ color: 'white', fontWeight: 'bold' }}>₹{product.price}</span>
                                            </div>
                                            {product.badge && <div style={{ alignSelf: 'start', background: '#A18CD1', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>{product.badge}</div>}

                                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                                <button
                                                    onClick={() => { setEditingProduct(product); setIsProductModalOpen(true); }}
                                                    style={{ flex: 1, background: '#3B82F6', color: 'white', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}
                                                >
                                                    EDIT
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                    style={{ flex: 1, background: '#EF4444', color: 'white', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}
                                                >
                                                    DELETE
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AdminDashboard />);
