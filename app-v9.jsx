const { useState, useEffect, useRef, useMemo } = React;
const { motion, AnimatePresence, useMotionValue, useSpring, useTransform } = window.Motion;

// --- FIREBASE CONFIG ---
const firebaseConfig = {
    apiKey: "AIzaSyCFMaEPIvkn1t9bs583Yy8tiBkWUMtr4t8",
    authDomain: "stickershop-gauravagl.firebaseapp.com",
    projectId: "stickershop-gauravagl",
    storageBucket: "stickershop-gauravagl.firebasestorage.app",
    messagingSenderId: "673473629818",
    appId: "1:673473629818:web:aa4a50bd510b391d2675c3"
};

// Initialize Firebase
let db;
try {
    if (window.firebase) {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        db = firebase.firestore();
    }
} catch (e) {
    console.log("Firebase init error", e);
}

// --- HARDCODED PRODUCTS (STABLE RESTORE) ---
const PRODUCTS = [
    { id: 1, name: "ACID SMILEY", price: 20, category: "vinyl", image: "🥴", badge: "BESTSELLER", size: "3 x 3 inches" },
    { id: 2, name: "CYBER SKULL", price: 20, category: "holo", image: "💀", size: "2.5 x 4 inches" },
    { id: 3, name: "GLITCH GHOST", price: 20, category: "vinyl", image: "👻", size: "3 x 2.8 inches" },
    { id: 4, name: "NEON ALIEN", price: 20, category: "glow", image: "👽", badge: "NEW", size: "3.5 x 4 inches" },
    { id: 5, name: "RETRO CASSETTE", price: 20, category: "vinyl", image: "📼", size: "4 x 2.5 inches" },
    { id: 6, name: "VAPORWAVE PALM", price: 20, category: "holo", image: "🌴", size: "3 x 3.5 inches" },
    { id: 7, name: "ERROR 404", price: 20, category: "vinyl", image: "⚠️", size: "3 x 1.5 inches" },
    { id: 8, name: "LASER EYES", price: 20, category: "holo", image: "👀", badge: "HOT", size: "4 x 1 inches" }
];

const inputStyle = {
    background: '#0F172A', border: '1px solid #334155', color: 'white',
    padding: '15px', borderRadius: '8px', fontSize: '1rem', width: '100%'
};

// --- Components ---

const Navbar = ({ cartCount, cartTotal, onOpenCart, onOpenTracker }) => (
    <nav className="navbar">
        <div className="logo-container">
            <a href="/"><img src="logo.png" alt="Logo" className="logo-icon" /></a>
            <div className="logo">CLEARSTIX<span className="dot">.</span></div>
        </div>
        <div className="nav-links desktop-only">
            <button onClick={onOpenTracker} style={{
                marginRight: '20px', background: 'transparent', border: 'none',
                color: '#94A3B8', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer'
            }}>
                TRACE ORDER
            </button>
            <a href="#shop">SHOP</a>
            <a href="/about.html">ABOUT</a>
        </div>
        <div className="nav-actions">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="cart-btn"
                onClick={onOpenCart}
            >
                <span className="cart-text-desktop">CART ({cartCount}) • ₹{cartTotal}</span>
                <span className="cart-text-mobile">🛒 {cartCount}</span>
            </motion.button>
        </div>
    </nav>
);

const Marquee = () => (
    <div className="marquee-container">
        <div className="marquee-content">
            {Array(4).fill("FRESH DROPS ✸ FREE SHIPPING ON ORDERS OVER ₹999 ✸ LIMITED EDITION ✸ CLEARSTIX ✸ ").map((text, i) => (
                <span key={i}>{text}</span>
            ))}
        </div>
    </div>
);

const Hero = () => (
    <header className="hero">
        <div className="hero-content">
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="hero-title"
            >
                MAKE IT<br />STICK.
            </motion.h1>
            <p className="hero-subtitle">The loud, proud, and slightly chaotic sticker shop for your laptop, bottle, and face.</p>
            <a href="#shop" className="cta-button">DROP THE SHOP</a>
        </div>
        <div className="hero-visual">
            <motion.div animate={{ rotate: -10, y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 6 }} className="floating-sticker s1">🥴</motion.div>
            <motion.div animate={{ rotate: 15, y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 5, delay: 1 }} className="floating-sticker s2">💀</motion.div>
            <motion.div animate={{ rotate: -5, y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 7, delay: 2 }} className="floating-sticker s3">🚀</motion.div>
            <motion.div animate={{ rotate: 20, y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 4, delay: 0.5 }} className="floating-sticker s4">💊</motion.div>
        </div>
    </header>
);

const ProductCard = ({ product, onOpenDetail, onAddToCart }) => {
    const cardVariants = {
        rest: { y: 0, boxShadow: "0 4px 6px rgba(0,0,0,0.1)", zIndex: 1 },
        hover: { y: -5, boxShadow: "10px 10px 0px #111", zIndex: 10, transition: { duration: 0.3 } }
    };

    const stickerVariants = {
        rest: { scale: 1, rotate: 0 },
        hover: { scale: 1.3, rotate: [0, -10, 10, -5, 5, 0], transition: { type: "spring", stiffness: 400, damping: 10, mass: 0.8 } }
    };

    return (
        <motion.div
            layout
            initial="rest"
            whileHover="hover"
            animate="rest"
            variants={cardVariants}
            viewport={{ once: true, margin: "-50px" }}
            className="product-card"
            onClick={() => onOpenDetail(product)}
        >
            {product.badge && <span className="product-badge" style={{
                position: 'absolute', top: '10px', left: '10px',
                background: 'var(--color-accent-2)', color: 'white',
                padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', zIndex: 10
            }}>{product.badge}</span>}

            <div className="card-image">
                <motion.div variants={stickerVariants}>
                    {product.image}
                </motion.div>
            </div>

            <div className="card-info">
                <h3 className="card-title">{product.name}</h3>
                <div className="card-price">
                    {product.originalPrice && <span style={{ textDecoration: 'line-through', color: '#64748B', marginRight: '10px', fontSize: '0.9rem' }}>₹{product.originalPrice}</span>}
                    ₹{product.price}
                </div>
                <button
                    className="add-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        // Reset hover state on click to prevent getting stuck? 
                        const rect = e.target.getBoundingClientRect();
                        const startPos = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
                        onAddToCart(product, startPos);
                    }}
                >
                    ADD TO CART
                </button>
            </div>
        </motion.div>
    );
};

const Shop = ({ products, onOpenDetail, onAddToCart }) => {
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProducts = products.filter(p => {
        const matchesCategory = filter === 'all' || p.category === filter;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <section id="shop" className="shop-section">
            <div className="section-header">
                <h2>THE STASH</h2>
                <div className="shop-controls" style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="SEARCH STICKERS..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            padding: '10px 15px', borderRadius: '8px', border: '1px solid #ccc',
                            fontFamily: 'inherit', maxWidth: '200px'
                        }}
                    />
                    <div className="filter-btns">
                        {['all', 'holo', 'vinyl', 'glow'].map(cat => (
                            <button
                                key={cat}
                                className={`filter-btn ${filter === cat ? 'active' : ''}`}
                                onClick={() => setFilter(cat)}
                            >
                                {cat.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <motion.div layout className="product-grid">
                <AnimatePresence>
                    {filteredProducts.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onOpenDetail={onOpenDetail}
                            onAddToCart={onAddToCart}
                        />
                    ))}
                </AnimatePresence>
            </motion.div>
        </section>
    );
};

const ProductModal = ({ product, isOpen, onClose, onAddToCart, onBuyNow }) => {
    const [activeImage, setActiveImage] = useState(null);
    useEffect(() => { if (isOpen) setActiveImage(product.image); }, [isOpen, product]);

    if (!isOpen || !product) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="product-modal active"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="modal-content"
                        onClick={e => e.stopPropagation()}
                    >
                        <button className="close-modal" onClick={onClose}>&times;</button>
                        <div className="modal-grid">
                            <div className="modal-gallery">
                                <div className="main-image">{activeImage}</div>
                            </div>
                            <div className="modal-info">
                                <h2 className="modal-title">{product.name}</h2>
                                <div className="modal-price">
                                    {product.originalPrice && <span style={{ textDecoration: 'line-through', color: '#64748B', marginRight: '15px', fontSize: '1.5rem' }}>₹{product.originalPrice}</span>}
                                    ₹{product.price}
                                </div>
                                <p className="modal-desc">
                                    Premium quality {product.category} sticker. Water-resistant, UV protected, and ready to slap on your laptop, skateboard, or forehead.
                                </p>

                                <div style={{ background: '#1E293B', padding: '15px', borderRadius: '8px', marginBottom: '25px', display: 'flex', gap: '20px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>DIMENSIONS</div>
                                        <div style={{ fontWeight: 'bold', color: 'white' }}>{product.size}</div>
                                    </div>
                                    <div style={{ width: '1px', background: '#334155' }}></div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>MATERIAL</div>
                                        <div style={{ fontWeight: 'bold', color: 'white' }}>High-Gloss Vinyl</div>
                                    </div>
                                </div>

                                <div className="modal-actions">
                                    <button className="modal-btn add-cart" onClick={(e) => {
                                        const rect = e.target.getBoundingClientRect();
                                        const startPos = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
                                        onAddToCart(product, startPos);
                                    }}>ADD TO CART</button>
                                    <button className="modal-btn buy-now" onClick={() => onBuyNow(product)}>BUY NOW</button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const CartDrawer = ({ isOpen, onClose, cart, onRemove, onRemoveAll, onCheckout, onAdd }) => {

    // Group items by ID to handle quantity
    const groupedCart = cart.reduce((acc, item) => {
        const existing = acc.find(i => i.id === item.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            acc.push({ ...item, quantity: 1 });
        }
        return acc;
    }, []);

    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    // FREE DELIVERY if > 149, else 40
    const shipping = subtotal > 149 ? 0 : (subtotal > 0 ? 40 : 0);
    const total = subtotal + shipping;

    return (
        <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
            <div className="cart-panel" onClick={e => e.stopPropagation()}>
                <div className="cart-header">
                    <h3>YOUR HAUL</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="cart-items">
                    {cart.length === 0 ? (
                        <div className="empty-cart-msg">Your stash is empty. Fix that.</div>
                    ) : (
                        groupedCart.map((item, index) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="cart-item"
                                key={item.id}
                            >
                                <div className="cart-item-img">{item.image}</div>
                                <div className="cart-item-details">
                                    <div className="cart-item-title">{item.name}</div>
                                    <div className="cart-item-price">
                                        ₹{item.price}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                                        <button
                                            onClick={() => onRemove(cart.findIndex(c => c.id === item.id))}
                                            style={{ background: '#334155', color: 'white', width: '30px', height: '30px', borderRadius: '50%', fontWeight: 'bold' }}
                                        >-</button>
                                        <span style={{ fontWeight: 'bold' }}>{item.quantity}</span>
                                        <button
                                            onClick={() => onAdd && onAdd(item)}
                                            style={{ background: '#A18CD1', color: 'white', width: '30px', height: '30px', borderRadius: '50%', fontWeight: 'bold' }}
                                        >+</button>
                                        <button
                                            onClick={() => onRemoveAll(item.id)}
                                            style={{ background: 'transparent', color: '#EF4444', border: '1px solid #EF4444', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', marginLeft: 'auto' }}
                                        >DELETE</button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="cart-footer" style={{ background: '#0F172A', padding: '20px' }}>

                        {/* Bill Details */}
                        <div style={{ borderTop: '1px solid #334155', paddingTop: '15px', color: '#94A3B8', fontSize: '0.9rem', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span>Item Total</span>
                                <span>₹{subtotal}</span>
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Delivery Fee</span>
                                    <span>{shipping === 0 ? <span style={{ color: '#4ADE80' }}>FREE</span> : `₹${shipping}`}</span>
                                </div>
                                {shipping > 0 && (
                                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px', fontStyle: 'italic' }}>
                                        Free delivery above ₹149
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', fontSize: '1.4rem', color: 'white', fontWeight: 'bold' }}>
                                <span>TOTAL</span>
                                <span>₹{total}</span>
                            </div>
                        </div>

                        <button className="checkout-btn" onClick={() => onCheckout(total)}>SECURE THE BAG (₹{total})</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const Footer = ({ onOpenTracker }) => (
    <footer className="footer">
        <div className="footer-container">
            <div className="footer-brand">
                <div className="footer-logo-container">
                    <img src="logo.png" alt="Logo" className="footer-logo-icon" />
                    <div className="footer-logo">CLEARSTIX.</div>
                </div>
                <p>
                    CLEARSTIX is a premium sticker boutique dedicated to digital culture and physical art.
                    Founded in 2025, our mission is to provide the highest quality vinyl and holographic slaps
                    that transform everyday gear into personal statements.
                </p>
                <div className="founder-info">
                    <span className="founder-name">Gaurav Agarwal</span>
                    <span className="founder-title">Founder & CEO</span>
                </div>
                <div className="social-links" style={{ marginTop: '20px' }}>
                    <a href="https://instagram.com" className="social-icon">📸</a>
                    <a href="https://twitter.com" className="social-icon">🐦</a>
                    <a href="https://linkedin.com" className="social-icon">💼</a>
                </div>
            </div>

            <div className="footer-column">
                <h4 className="footer-heading">THE SHOP</h4>
                <div className="footer-links">
                    <a href="#shop" className="footer-link">All Stickers</a>
                    <a href="#shop" className="footer-link">Holographic</a>
                    <a href="#shop" className="footer-link">Vinyl Drops</a>
                    <a href="#shop" className="footer-link">Glow-in-the-Dark</a>
                </div>
            </div>

            <div className="footer-column">
                <h4 className="footer-heading">PROJECT</h4>
                <div className="footer-links">
                    <a href="/about.html" className="footer-link">Our Story</a>
                    <button onClick={onOpenTracker} className="footer-link">Trace Order 🕵️‍♂️</button>
                    <a href="/contact.html" className="footer-link">Support</a>
                    <a href="/shipping.html" className="footer-link">Shipping</a>
                    <a href="/cancellation.html" className="footer-link">Refunds</a>
                </div>
            </div>

            <div className="footer-newsletter">
                <h4 className="footer-heading">THE INNER CIRCLE</h4>
                <p>Join for secret drops and community-only editions.</p>
                <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); alert("Welcome to the secret society! 🤘"); }}>
                    <input type="email" placeholder="YOUR EMAIL" required />
                    <button type="submit" className="newsletter-btn">JOIN</button>
                </form>
                <div className="payment-methods">
                    <span className="payment-icon" title="UPI Payment">📱</span>
                    <span className="payment-icon" title="Secure Cards">💳</span>
                    <span className="payment-icon" title="Bank Transfer">🏦</span>
                </div>
            </div>
        </div>

        <div className="footer-bottom">
            <div className="footer-copyright">
                &copy; 2025 CLEARSTIX INC. BY GAURAV AGARWAL.
            </div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.6rem', color: '#1E293B' }}>EST. 2025 // DELHI, INDIA</span>
            </div>
        </div>
    </footer>
);

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

const OrderTrackerModal = ({ isOpen, onClose, showToast }) => {
    const [orderId, setOrderId] = useState('');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSearched(false);
        setOrders([]);

        const targetId = orderId.trim().toUpperCase();

        try {
            if (!db) throw new Error("DB not init");
            const docRef = db.collection('orders').doc(targetId);
            const doc = await docRef.get();

            if (doc.exists) {
                setOrders([{ id: doc.id, ...doc.data() }]);
            } else {
                showToast("❌ Order ID not found.");
            }
        } catch (error) {
            console.error(error);
            showToast("❌ Error looking up order.");
        }
        setLoading(false);
        setSearched(true);
    };

    if (!isOpen) return null;

    return (
        <div className="product-modal active" style={{ zIndex: 3000 }}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="modal-content"
                style={{ maxWidth: '600px', padding: '30px', maxHeight: '85vh', overflowY: 'auto' }}
            >
                <button className="close-modal" onClick={onClose}>&times;</button>
                <h2 style={{ marginBottom: '20px', color: '#F8FAFC' }}>TRACE YOUR STASH 🕵️‍♂️</h2>

                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                    <input
                        type="text"
                        placeholder="ENTER ORDER ID"
                        required
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        style={{ flex: 1, padding: '15px', borderRadius: '8px', border: '1px solid #334155', background: '#0F172A', color: 'white' }}
                    />
                    <button type="submit" className="cta-button" style={{ padding: '0 30px' }}>
                        {loading ? '...' : 'TRACE'}
                    </button>
                </form>

                {searched && orders.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', color: '#94A3B8', padding: '20px' }}>
                        No signal detected.
                    </div>
                )}

                <div className="orders-list">
                    {orders.map(order => (
                        <div key={order.id} style={{ background: '#1E293B', padding: '20px', borderRadius: '12px', marginBottom: '15px', border: '1px solid #334155' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
                                <span style={{ fontWeight: 'bold', color: '#A18CD1' }}>#{order.id}</span>
                                <span style={{
                                    background: order.status === 'paid' ? '#10B981' : (order.status === 'shipped' ? '#3B82F6' : '#F59E0B'),
                                    color: '#000', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'
                                }}>
                                    {order.status.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

const CheckoutModal = ({ isOpen, onClose, cart, onSuccess, showToast }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '', email: '', address: '', city: '', zip: '', phone: ''
    });
    const [policyAgreed, setPolicyAgreed] = useState(false);
    const qrRef = useRef(null);

    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const shipping = subtotal > 149 ? 0 : (subtotal > 0 ? 40 : 0);
    const finalTotal = subtotal + shipping;

    const upiLink = useMemo(() => {
        return `upi://pay?pa=gauravv@indie&pn=CLEARSTIX&am=${finalTotal}&tn=Order-${Date.now()}&cu=INR`;
    }, [finalTotal, isOpen]);

    useEffect(() => {
        if (isOpen && qrRef.current && window.QRCode) {
            window.QRCode.toCanvas(qrRef.current, upiLink, { width: 160, margin: 1 }, (error) => {
                if (error) console.error("QR Gen Error:", error);
            });
        }
    }, [isOpen, upiLink]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const copyUPI = () => {
        navigator.clipboard.writeText("gauravv@indie");
        showToast("UPI ID Copied! 📋");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!policyAgreed) {
            showToast("⚠️ You must agree to the Refund Policy.");
            return;
        }

        setLoading(true);

        try {
            if (!db) throw new Error("DB Error");

            // GENERATE CUSTOM ORDER ID: 2 LETTERS + 4 DIGITS
            const namePart = formData.name.substring(0, 2).toUpperCase();
            const phonePart = formData.phone.length >= 4 ? formData.phone.substring(formData.phone.length - 4) : formData.phone.padEnd(4, '0');
            const customOrderId = `${namePart}${phonePart}`;

            // GROUP ITEMS FOR CLEAN BILLING
            const groupedItems = cart.reduce((acc, item) => {
                const existing = acc.find(i => i.id === item.id);
                if (existing) {
                    existing.quantity += 1;
                } else {
                    acc.push({ ...item, quantity: 1 });
                }
                return acc;
            }, []);

            await db.collection("orders").doc(customOrderId).set({
                customer: {
                    ...formData,
                    email: formData.email.toLowerCase().trim()
                },
                items: groupedItems,
                subtotal: subtotal,
                discount: 0,
                shipping: shipping,
                total: finalTotal,
                paymentMethod: "UPI_QR",
                coupon: null,
                date: new Date().toISOString(),
                status: "pending_verification"
            });

            setLoading(false);

            // Trigger Success Modal in Parent
            onSuccess({
                id: customOrderId,
                name: formData.name,
                phone: formData.phone,
                total: finalTotal
            });

            if (window.confetti) {
                window.confetti({ particleCount: 300, spread: 200, origin: { y: 0.6 } });
            }

            // --- AUTOMATED EMAIL SENDING ---
            // NOTE: You must replace these with your actual keys from https://emailjs.com
            // Create a free account -> Create Service (Gmail) -> Create Template
            const EMAIL_SERVICE_ID = "service_315tuu8";
            const EMAIL_TEMPLATE_ID = "template_t7tz2ep";
            const EMAIL_PUBLIC_KEY = "VUdCmTIWkIJmdOBSn";

            console.log("Checking EmailJS SDK...", {
                sdkPresent: !!window.emailjs,
                keyPresent: EMAIL_PUBLIC_KEY !== "key_placeholder"
            });

            if (window.emailjs && EMAIL_PUBLIC_KEY !== "key_placeholder") {
                window.emailjs.init(EMAIL_PUBLIC_KEY);

                // Prepare friendly grouped item list
                const itemsList = groupedItems.map(i => `${i.name} (x${i.quantity})`).join(', ');

                console.log("EmailJS Sending...", { EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, itemsList });
                showToast("📧 Sending Confirmation Email...");

                window.emailjs.send(EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, {
                    order_id: customOrderId,
                    to_name: formData.name,
                    to_email: formData.email,
                    total_amount: finalTotal,
                    items: itemsList,
                    date: new Date().toLocaleDateString()
                }).then(() => {
                    console.log("Email sent successfully");
                    showToast("📧 Email Sent Successfully!");
                }).catch((err) => {
                    console.error("Email send failed", err);
                    showToast("⚠️ Email Failed: " + (err.text || "Unknown Error"));
                });
            } else {
                console.log("EmailJS keys missing. Auto-email skipped (Order still succesful).");
            }
            // -------------------------------

        } catch (error) {
            console.error("Error adding document: ", error);
            // If error is permission denied, it likely means ID already exists (update not allowed)
            if (error.code === 'permission-denied') {
                showToast("❌ Duplicate Order ID. Please contact support.");
            } else {
                showToast("❌ Error saving order. Try again.");
            }
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="product-modal active" style={{ zIndex: 3000 }}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="modal-content"
                style={{ maxWidth: '500px', padding: '40px', maxHeight: '90vh', overflowY: 'auto' }}
            >
                <button className="close-modal" onClick={onClose}>&times;</button>
                <h2 style={{ marginBottom: '20px', fontSize: '1.8rem', color: '#F8FAFC' }}>SHIPMENT DATA</h2>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
                    <input name="name" placeholder="FULL NAME" required onChange={handleChange} style={inputStyle} />
                    <input name="email" type="email" placeholder="EMAIL (For tracking)" required onChange={handleChange} style={inputStyle} />
                    <input name="phone" type="tel" placeholder="PHONE NUMBER" required onChange={handleChange} style={inputStyle} />
                    <input name="address" placeholder="STREET ADDRESS" required onChange={handleChange} style={inputStyle} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <input name="city" placeholder="CITY" required onChange={handleChange} style={inputStyle} />
                        <input name="zip" placeholder="ZIP CODE" required onChange={handleChange} style={inputStyle} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                        <input
                            type="checkbox"
                            id="policy-check"
                            checked={policyAgreed}
                            onChange={(e) => setPolicyAgreed(e.target.checked)}
                            style={{ width: 'auto', margin: 0 }}
                        />
                        <label htmlFor="policy-check" style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                            I agree to the <a href="/cancellation.html" target="_blank" style={{ color: '#F43F5E', textDecoration: 'underline' }}>Refund Policy</a>.
                        </label>
                    </div>

                    <div style={{ marginTop: '20px', textAlign: 'center', background: '#1E293B', padding: '15px', borderRadius: '8px', border: '1px dashed #475569' }}>
                        <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '10px' }}>SCAN TO PAY</p>
                        <div style={{ background: 'white', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                            <canvas ref={qrRef} style={{ width: '150px', height: '150px' }}></canvas>
                        </div>
                        <p style={{ color: '#F8FAFC', fontSize: '1.2rem', marginTop: '10px', fontWeight: 'bold' }}>Pay: ₹{finalTotal}</p>
                        <button
                            type="button"
                            onClick={copyUPI}
                            style={{ marginTop: '10px', background: '#334155', color: 'white', border: '1px solid #475569', padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                        >
                            📋 COPY UPI ID
                        </button>
                        <a
                            href={upiLink}
                            style={{
                                display: 'block', marginTop: '15px', background: 'white', color: 'black',
                                padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem'
                            }}
                        >
                            TAP TO PAY (MOBILE APP)
                        </a>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="modal-btn buy-now"
                        style={{ marginTop: '20px', width: '100%', opacity: loading ? 0.7 : 1, background: '#10B981' }}
                    >
                        {loading ? 'CONFIRMING...' : 'I HAVE SCANNED & PAID'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

const OrderSuccessModal = ({ isOpen, onClose, orderDetails }) => {
    if (!isOpen || !orderDetails) return null;

    return (
        <div className="product-modal active" style={{ zIndex: 3000 }}>
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="modal-content"
                style={{ maxWidth: '450px', padding: '40px', textAlign: 'center' }}
            >
                <button className="close-modal" onClick={onClose}>&times;</button>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎉</div>
                <h2 style={{ marginBottom: '15px', fontSize: '1.8rem', color: '#10B981' }}>ORDER PLACED!</h2>
                <p style={{ color: '#94A3B8', marginBottom: '25px' }}>Thanks for your stash, {orderDetails.name}! We've received your order.</p>

                <div style={{ background: '#1E293B', padding: '20px', borderRadius: '12px', textAlign: 'left', marginBottom: '25px', border: '1px solid #334155' }}>
                    <div style={{ paddingBottom: '10px', borderBottom: '1px solid #334155', marginBottom: '10px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>ORDER ID</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#A18CD1', letterSpacing: '1px' }}>{orderDetails.id}</div>
                    </div>
                    <div style={{ paddingBottom: '10px', marginBottom: '10px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>CONTACT</div>
                        <div style={{ color: 'white' }}>{orderDetails.phone}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>TOTAL AMOUNT</div>
                        <div style={{ color: 'white', fontWeight: 'bold' }}>₹{orderDetails.total}</div>
                    </div>
                </div>

                <p style={{ fontSize: '0.9rem', color: '#CBD5E1', marginBottom: '25px' }}>
                    Sit tight! We will verify your payment and ship it soon.
                </p>

                <button
                    onClick={onClose}
                    className="cta-button"
                    style={{ width: '100%', padding: '15px' }}
                >
                    CONTINUE SHOPPING
                </button>
            </motion.div>
        </div>
    );
};

const FlyingItem = ({ emoji, startPos, onComplete }) => {
    return (
        <motion.div
            initial={{
                position: 'fixed',
                left: startPos.x,
                top: startPos.y,
                fontSize: '2rem',
                pointerEvents: 'none',
                zIndex: 9999,
                opacity: 1,
                scale: 1
            }}
            animate={{
                left: window.innerWidth - 80, // Approximate cart position
                top: 30, // Approximate cart top position
                scale: 0.5,
                opacity: 0
            }}
            transition={{ duration: 0.8, ease: "anticipate" }}
            onAnimationComplete={onComplete}
        >
            {emoji}
        </motion.div>
    );
};

// --- Main App ---

const App = () => {
    const [cart, setCart] = useState([]);
    const [products, setProducts] = useState(PRODUCTS);
    const [loadingProducts, setLoadingProducts] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            if (!db) return;
            try {
                const snapshot = await db.collection('products').get();
                if (!snapshot.empty) {
                    const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setProducts(fetched);
                }
            } catch (error) {
                console.error("Error fetching products", error);
            } finally {
                setLoadingProducts(false);
            }
        };
        fetchProducts();
    }, []);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '' });
    const [flyingItems, setFlyingItems] = useState([]);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isTrackerOpen, setIsTrackerOpen] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(null); // { id, name, phone, total }

    const showToast = (msg) => {
        setToast({ show: true, message: msg });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const handleOrderSuccess = (details) => {
        setIsCheckoutOpen(false);
        setOrderSuccess(details);
        clearCart();
    };

    const addToCart = (product, startPos) => {
        const { quantity, ...cleanProduct } = product;
        setCart([...cart, cleanProduct]);
        showToast(`Added ${cleanProduct.name}`);

        if (window.confetti) {
            window.confetti({
                particleCount: 50,
                spread: 50,
                origin: startPos ? { x: startPos.x / window.innerWidth, y: startPos.y / window.innerHeight } : { y: 0.6 }
            });
        }

        if (startPos) {
            const newItem = { id: Date.now(), emoji: product.image, startPos };
            setFlyingItems(prev => [...prev, newItem]);
        }
    };

    const removeFromCart = (index) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    };

    const removeAllFromCart = (productId) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    const clearCart = () => {
        setCart([]);
    };

    const handleBuyNow = (product) => {
        addToCart(product);
        setIsCartOpen(true);
    };

    const handleCheckoutButton = (total) => {
        if (cart.length === 0) {
            showToast("Your cart is empty!");
            return;
        }
        setIsCartOpen(false);
        setIsCheckoutOpen(true);
    };

    return (
        <div>
            <Toast message={toast.message} isVisible={toast.show} />

            {/* Flying Items Animation Layer */}
            {flyingItems.map(item => (
                <FlyingItem
                    key={item.id}
                    emoji={item.emoji}
                    startPos={item.startPos}
                    onComplete={() => setFlyingItems(prev => prev.filter(i => i.id !== item.id))}
                />
            ))}

            <Marquee />
            <Navbar
                cartCount={cart.length}
                cartTotal={cart.reduce((sum, item) => sum + item.price, 0)}
                onOpenCart={() => setIsCartOpen(true)}
                onOpenTracker={() => setIsTrackerOpen(true)}
            />
            <Hero />

            <Shop
                products={products}
                onOpenDetail={setSelectedProduct}
                onAddToCart={addToCart}
            />

            <Footer
                onOpenTracker={() => setIsTrackerOpen(true)}
            />

            <ProductModal
                product={selectedProduct}
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
                onAddToCart={addToCart}
                onBuyNow={handleBuyNow}
            />

            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cart={cart}
                onRemove={removeFromCart}
                onRemoveAll={removeAllFromCart}
                onAdd={(item) => addToCart(item)}
                onCheckout={handleCheckoutButton}
            />

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                cart={cart}
                onSuccess={handleOrderSuccess}
                showToast={showToast}
            />

            <OrderTrackerModal
                isOpen={isTrackerOpen}
                onClose={() => setIsTrackerOpen(false)}
                showToast={showToast}
            />

            <OrderSuccessModal
                isOpen={!!orderSuccess}
                onClose={() => setOrderSuccess(null)}
                orderDetails={orderSuccess}
            />

        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
