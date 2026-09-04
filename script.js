/* ==========================================================================
   FIREBASE IMPORTS & INITIALIZATION
   ========================================================================== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs, 
    orderBy,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCJx8A6rJExtGxL5xuZqR-nCC3eXsRMEJg",
    authDomain: "tasin-40c58.firebaseapp.com",
    projectId: "tasin-40c58",
    storageBucket: "tasin-40c58.firebasestorage.app",
    messagingSenderId: "1089282991754",
    appId: "1:1089282991754:web:fcc35d27d8d5d515eb2f73",
    measurementId: "G-L1HT9YRPE4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ==========================================================================
   BUSINESS CONFIGURATION & GLOBAL STATE
   ========================================================================== */
const BUSINESS_CONFIG = {
    businessName: "AURA STORE",
    whatsappNumber: "8801861403911",
    currency: "৳",
    deliveryChargeInside: 80,
    deliveryChargeOutside: 150,
    phone: "+880 1861403911",
    email: "tasinbinazam@gmail.com",
    address: "Mirpur - 1, Block-A, Dhaka"
};

let cart = JSON.parse(localStorage.getItem('aura_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('aura_wishlist')) || [];
let currentUser = null;

/* ==========================================================================
   DOM ELEMENTS & INITIALIZATION
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    initHeroSlider();
});

function initApp() {
    renderCategories();
    renderProducts();
    updateCartUI();
    updateWishlistUI();
    setupEventListeners();
    setupAuthObserver();
}

/* ==========================================================================
   HERO SLIDER SYSTEM
   ========================================================================== */
let currentSlideIndex = 0;
let slideInterval;

function initHeroSlider() {
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;
    
    showSlide(currentSlideIndex);
    slideInterval = setInterval(() => {
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        showSlide(currentSlideIndex);
    }, 5000);
}

function showSlide(index) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}

window.currentSlide = function(index) {
    clearInterval(slideInterval);
    currentSlideIndex = index;
    showSlide(currentSlideIndex);
    slideInterval = setInterval(() => {
        currentSlideIndex = (currentSlideIndex + 1) % document.querySelectorAll('.slide').length;
        showSlide(currentSlideIndex);
    }, 5000);
};

/* ==========================================================================
   PRODUCTS & FILTERS RENDER
   ========================================================================== */
function renderCategories() {
    const select = document.getElementById('category-select');
    if (!select || typeof productsData === 'undefined') return;

    const categories = ['all', ...new Set(productsData.map(p => p.category))];
    select.innerHTML = categories.map(cat => `
        <option value="${cat}">${cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
    `).join('');
}

function renderProducts() {
    const grid = document.getElementById('products-grid');
    const emptyState = document.getElementById('empty-products');
    
    // Fallback check if productsData is attached to window
    const products = typeof productsData !== 'undefined' ? productsData : window.productsData;
    if (!grid || !products) return;

    const searchVal = document.getElementById('search-input')?.value.toLowerCase() || '';
    const categoryVal = document.getElementById('category-select')?.value || 'all';
    const sortVal = document.getElementById('sort-select')?.value || 'default';

    let filtered = products.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchVal) || (p.tags && p.tags.some(t => t.toLowerCase().includes(searchVal)));
        const matchesCat = categoryVal === 'all' || p.category === categoryVal;
        return matchesSearch && matchesCat;
    });

    if (sortVal === 'price-low') filtered.sort((a, b) => a.price - b.price);
    if (sortVal === 'price-high') filtered.sort((a, b) => b.price - a.price);
    if (sortVal === 'name-asc') filtered.sort((a, b) => a.title.localeCompare(b.title));

    if (filtered.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    grid.innerHTML = filtered.map(p => {
        const isWish = wishlist.includes(p.id);
        const isSoldOut = p.inStock === false;

        return `
            <div class="product-card">
                <div class="card-image-wrap" onclick="openProductModal(${p.id})">
                    <img src="${p.image}" alt="${p.title}">
                    ${p.oldPrice ? `<span class="badge-discount">-${Math.round(((p.oldPrice - p.price)/p.oldPrice)*100)}%</span>` : ''}
                    <button class="btn-wishlist ${isWish ? 'active' : ''}" onclick="event.stopPropagation(); toggleWishlist(${p.id})">
                        <i class="fa-${isWish ? 'solid' : 'regular'} fa-heart"></i>
                    </button>
                </div>
                <div class="card-content">
                    <span class="product-category">${p.category}</span>
                    <h3 class="product-title" onclick="openProductModal(${p.id})">${p.title}</h3>
                    <div class="rating-stars">
                        <i class="fa-solid fa-star"></i>
                        <span>${p.rating || 5.0}</span>
                        <span class="rating-count">(${p.reviews || 10})</span>
                    </div>
                    <p class="product-description">${p.description}</p>
                    <div class="card-footer-price">
                        <span class="current-price">${BUSINESS_CONFIG.currency}${p.price}</span>
                        ${p.oldPrice ? `<span class="old-price">${BUSINESS_CONFIG.currency}${p.oldPrice}</span>` : ''}
                    </div>
                    <div class="card-actions-grid">
                        <button class="btn btn-secondary" onclick="openProductModal(${p.id})">Details</button>
                        <button class="btn btn-primary ${isSoldOut ? 'disabled' : ''}" ${isSoldOut ? 'disabled' : ''} onclick="addToCart(${p.id})">
                            ${isSoldOut ? 'Sold Out' : 'Add to Bag'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/* ==========================================================================
   CART & WISHLIST LOGIC
   ========================================================================== */
window.addToCart = function(productId, qty = 1) {
    const product = productsData.find(p => p.id === productId);
    if (!product || product.inStock === false) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += qty;
    } else {
        cart.push({ ...product, quantity: qty });
    }

    saveCart();
    updateCartUI();
    showToast(`${product.title} added to bag!`);
};

window.toggleWishlist = function(productId) {
    const idx = wishlist.indexOf(productId);
    if (idx > -1) {
        wishlist.splice(idx, 1);
        showToast('Removed from wishlist');
    } else {
        wishlist.push(productId);
        showToast('Added to wishlist!');
    }
    localStorage.setItem('aura_wishlist', JSON.stringify(wishlist));
    updateWishlistUI();
    renderProducts();
};

function saveCart() {
    localStorage.setItem('aura_cart', JSON.stringify(cart));
}

function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const drawerCount = document.getElementById('cart-drawer-count');
    const container = document.getElementById('cart-items-container');
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (cartCount) cartCount.innerText = totalItems;
    if (drawerCount) drawerCount.innerText = totalItems;

    if (container) {
        if (cart.length === 0) {
            container.innerHTML = `<p style="text-align:center; padding: 2rem; color: var(--text-muted);">Your bag is empty.</p>`;
        } else {
            container.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.title}" class="cart-item-img">
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.title}</div>
                        <div class="cart-item-price">${BUSINESS_CONFIG.currency}${item.price}</div>
                        <div class="cart-qty-controls">
                            <button class="cart-qty-btn" onclick="updateQty(${item.id}, -1)">-</button>
                            <span class="cart-qty-val">${item.quantity}</span>
                            <button class="cart-qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
                        </div>
                    </div>
                    <button class="cart-item-remove" onclick="removeFromCart(${item.id})"><i class="fa-solid fa-trash"></i></button>
                </div>
            `).join('');
        }
    }

    if (subtotalEl) subtotalEl.innerText = `${BUSINESS_CONFIG.currency}${subtotal}`;
    if (totalEl) totalEl.innerText = `${BUSINESS_CONFIG.currency}${subtotal}`;
}

function updateWishlistUI() {
    const wishCount = document.getElementById('wishlist-count');
    if (wishCount) wishCount.innerText = wishlist.length;
}

window.updateQty = function(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== id);
    }
    saveCart();
    updateCartUI();
};

window.removeFromCart = function(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    updateCartUI();
};

/* ==========================================================================
   AUTHENTICATION & USER PROFILE SYSTEM
   ========================================================================== */
function setupAuthObserver() {
    onAuthStateChanged(auth, (user) => {
        currentUser = user;
        renderUserDropdown();
        if (user) {
            const custName = document.getElementById('cust-name');
            const custEmail = document.getElementById('cust-email');
            if (custName && !custName.value) custName.value = user.displayName || '';
            if (custEmail && !custEmail.value) custEmail.value = user.email || '';
        }
    });
}

function renderUserDropdown() {
    const dropdown = document.getElementById('user-dropdown');
    const mobileContainer = document.getElementById('mobile-auth-link-container');
    if (!dropdown) return;

    if (currentUser) {
        dropdown.innerHTML = `
            <div style="padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); font-weight: 700; font-size: 0.85rem;">
                Hi, ${currentUser.displayName || 'Customer'}
            </div>
            <button onclick="openAccountModal('orders')"><i class="fa-solid fa-box"></i> My Orders</button>
            <button onclick="openAccountModal('profile')"><i class="fa-solid fa-user-gear"></i> Settings</button>
            <button onclick="handleLogout()" style="color: #ef4444;"><i class="fa-solid fa-right-from-bracket"></i> Logout</button>
        `;
        if (mobileContainer) {
            mobileContainer.innerHTML = `<a href="javascript:void(0)" onclick="openAccountModal('orders')" class="mobile-link"><i class="fa-solid fa-user"></i> My Account</a>`;
        }
    } else {
        dropdown.innerHTML = `
            <button onclick="openAuthModal('login')"><i class="fa-solid fa-right-to-bracket"></i> Login</button>
            <button onclick="openAuthModal('register')"><i class="fa-solid fa-user-plus"></i> Create Account</button>
        `;
        if (mobileContainer) {
            mobileContainer.innerHTML = `<a href="javascript:void(0)" onclick="openAuthModal('login')" class="mobile-link"><i class="fa-solid fa-right-to-bracket"></i> Login / Register</a>`;
        }
    }
}

window.openAuthModal = function(view = 'login') {
    switchAuthView(view);
    document.getElementById('auth-overlay').classList.add('active');
    document.getElementById('auth-modal').classList.add('active');
    document.getElementById('user-dropdown').classList.remove('active');
};

window.closeAuthModal = function() {
    document.getElementById('auth-overlay').classList.remove('active');
    document.getElementById('auth-modal').classList.remove('active');
};

window.switchAuthView = function(view) {
    document.getElementById('auth-login-view').classList.add('hidden');
    document.getElementById('auth-register-view').classList.add('hidden');
    document.getElementById('auth-forgot-view').classList.add('hidden');

    if (view === 'login') document.getElementById('auth-login-view').classList.remove('hidden');
    if (view === 'register') document.getElementById('auth-register-view').classList.remove('hidden');
    if (view === 'forgot') document.getElementById('auth-forgot-view').classList.remove('hidden');
};

// Auth Form Handlers
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
        showToast('Successfully Logged In!');
        closeAuthModal();
    } catch (err) {
        alert(err.message);
    }
});

document.getElementById('register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(res.user, { displayName: name });
        showToast('Account Created Successfully!');
        closeAuthModal();
    } catch (err) {
        alert(err.message);
    }
});

document.getElementById('forgot-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value;
    try {
        await sendPasswordResetEmail(auth, email);
        alert('Password reset link sent to your email!');
        switchAuthView('login');
    } catch (err) {
        alert(err.message);
    }
});

window.handleLogout = async function() {
    await signOut(auth);
    showToast('Logged out');
    document.getElementById('user-dropdown').classList.remove('active');
};

/* ==========================================================================
   MY ACCOUNT & ORDER HISTORY LOGIC
   ========================================================================== */
window.openAccountModal = function(tab = 'orders') {
    if (!currentUser) return openAuthModal('login');
    
    switchAccountTab(tab);
    document.getElementById('account-overlay').classList.add('active');
    document.getElementById('account-modal').classList.add('active');
    document.getElementById('user-dropdown').classList.remove('active');

    document.getElementById('profile-name').value = currentUser.displayName || '';
    document.getElementById('profile-email').value = currentUser.email || '';

    if (tab === 'orders') fetchUserOrders();
};

window.closeAccountModal = function() {
    document.getElementById('account-overlay').classList.remove('active');
    document.getElementById('account-modal').classList.remove('active');
};

window.switchAccountTab = function(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('tab-orders').classList.add('hidden');
    document.getElementById('tab-profile').classList.add('hidden');

    if (tab === 'orders') {
        document.querySelector('.tab-btn:nth-child(1)').classList.add('active');
        document.getElementById('tab-orders').classList.remove('hidden');
        fetchUserOrders();
    } else {
        document.querySelector('.tab-btn:nth-child(2)').classList.add('active');
        document.getElementById('tab-profile').classList.remove('hidden');
    }
};

async function fetchUserOrders() {
    const container = document.getElementById('orders-list-container');
    container.innerHTML = `<p style="text-align:center;">Loading orders...</p>`;

    try {
        const q = query(
            collection(db, "orders"), 
            where("userId", "==", currentUser.uid)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            container.innerHTML = `<p style="text-align:center; color: var(--text-muted); padding: 2rem;">No order history found.</p>`;
            return;
        }

        let html = '';
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            html += `
                <div class="order-card">
                    <div class="order-header-info">
                        <div>
                            <strong>Order ID:</strong> ${data.orderId || doc.id}
                        </div>
                        <span class="order-badge pending">${data.status || 'Processing'}</span>
                    </div>
                    <p style="font-size:0.85rem; margin-bottom:0.5rem;"><strong>Items:</strong> ${data.items ? data.items.map(i => `${i.title} (${i.quantity}x)`).join(', ') : 'Order Items'}</p>
                    <div style="display:flex; justify-content:space-between; font-size:0.85rem;">
                        <span><strong>Total:</strong> ${BUSINESS_CONFIG.currency}${data.totalAmount}</span>
                        <span><strong>Payment:</strong> ${data.paymentMethod}</span>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    } catch (err) {
        console.error(err);
        container.innerHTML = `<p style="text-align:center; color:#ef4444;">Error loading orders.</p>`;
    }
}

document.getElementById('profile-update-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newName = document.getElementById('profile-name').value;
    try {
        await updateProfile(currentUser, { displayName: newName });
        showToast('Profile updated successfully!');
        renderUserDropdown();
    } catch (err) {
        alert(err.message);
    }
});

/* ==========================================================================
   CHECKOUT & ORDER PLACEMENT SYSTEM
   ========================================================================== */
window.togglePaymentDetails = function(method) {
    const bkashInfo = document.getElementById('bkash-info');
    if (bkashInfo) {
        bkashInfo.style.display = method === 'bkash' ? 'block' : 'none';
    }
};

document.getElementById('checkout-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (cart.length === 0) return alert('Your cart is empty!');

    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const email = document.getElementById('cust-email').value;
    const address = document.getElementById('cust-address').value;
    const city = document.getElementById('cust-city').value;
    const zone = document.getElementById('cust-area').value;
    const payment = document.querySelector('input[name="payment"]:checked').value;

    const deliveryFee = zone === 'inside' ? BUSINESS_CONFIG.deliveryChargeInside : BUSINESS_CONFIG.deliveryChargeOutside;
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + deliveryFee;
    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

    const orderData = {
        orderId: orderId,
        userId: currentUser ? currentUser.uid : 'guest',
        customerName: name,
        phone: phone,
        email: email,
        address: `${address}, ${city}`,
        paymentMethod: payment,
        items: cart,
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        totalAmount: total,
        status: 'Pending',
        createdAt: new Date().toISOString()
    };

    // Save to Firestore
    try {
        await addDoc(collection(db, "orders"), orderData);
    } catch (err) {
        console.error("Firestore Order Error: ", err);
    }

    // Trigger EmailJS
    emailjs.send("service_default", "template_default", {
        order_id: orderId,
        to_name: name,
        to_email: email,
        phone: phone,
        total_amount: total,
        items_summary: cart.map(i => `${i.title} x${i.quantity}`).join(', ')
    }).catch(err => console.log("EmailJS bypass or error:", err));

    // Show Confirmation
    showOrderConfirmation(orderData);

    // Reset Cart
    cart = [];
    saveCart();
    updateCartUI();

    document.getElementById('checkout-overlay').classList.remove('active');
    document.getElementById('checkout-modal').classList.remove('active');
});

function showOrderConfirmation(data) {
    const details = document.getElementById('confirmation-details');
    if (details) {
        details.innerHTML = `
            <p><strong>Order ID:</strong> ${data.orderId}</p>
            <p><strong>Name:</strong> ${data.customerName}</p>
            <p><strong>Phone:</strong> ${data.phone}</p>
            <p><strong>Total Paid:</strong> ${BUSINESS_CONFIG.currency}${data.totalAmount} (${data.paymentMethod})</p>
        `;
    }
    document.getElementById('confirmation-overlay').classList.add('active');
    document.getElementById('confirmation-modal').classList.add('active');
}

/* ==========================================================================
   EVENT LISTENERS & UI TOGGLES
   ========================================================================== */
function setupEventListeners() {
    // Search & Filters
    document.getElementById('search-input')?.addEventListener('input', renderProducts);
    document.getElementById('category-select')?.addEventListener('change', renderProducts);
    document.getElementById('sort-select')?.addEventListener('change', renderProducts);
    document.getElementById('reset-filters-btn')?.addEventListener('click', () => {
        document.getElementById('search-input').value = '';
        document.getElementById('category-select').value = 'all';
        document.getElementById('sort-select').value = 'default';
        renderProducts();
    });

    // Cart Drawer
    document.getElementById('cart-toggle-btn')?.addEventListener('click', () => {
        document.getElementById('cart-overlay').classList.add('active');
        document.getElementById('cart-drawer').classList.add('active');
    });
    document.getElementById('cart-close-btn')?.addEventListener('click', closeCart);
    document.getElementById('cart-overlay')?.addEventListener('click', closeCart);
    document.getElementById('continue-shopping-btn')?.addEventListener('click', closeCart);

    // Checkout Modal
    document.getElementById('open-checkout-btn')?.addEventListener('click', () => {
        if (cart.length === 0) return alert('Your cart is empty!');
        closeCart();
        updateCheckoutSummary();
        document.getElementById('checkout-overlay').classList.add('active');
        document.getElementById('checkout-modal').classList.add('active');
    });
    document.getElementById('checkout-close-btn')?.addEventListener('click', closeCheckout);
    document.getElementById('checkout-overlay')?.addEventListener('click', closeCheckout);

    // Confirmation Modal Close
    document.getElementById('back-to-shop-btn')?.addEventListener('click', () => {
        document.getElementById('confirmation-overlay').classList.remove('active');
        document.getElementById('confirmation-modal').classList.remove('active');
    });

    // Mobile Nav
    document.getElementById('hamburger-btn')?.addEventListener('click', () => {
        document.getElementById('mobile-nav-overlay').classList.add('active');
        document.getElementById('mobile-nav-drawer').classList.add('active');
    });
    document.getElementById('mobile-nav-close')?.addEventListener('click', closeMobileNav);
    document.getElementById('mobile-nav-overlay')?.addEventListener('click', closeMobileNav);

    // User Dropdown
    document.getElementById('user-menu-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('user-dropdown').classList.toggle('active');
    });

    document.addEventListener('click', () => {
        document.getElementById('user-dropdown')?.classList.remove('active');
    });

    // Product Modal Close
    document.getElementById('modal-close-btn')?.addEventListener('click', closeProductModal);
    document.getElementById('product-modal-overlay')?.addEventListener('click', closeProductModal);
}

function closeCart() {
    document.getElementById('cart-overlay').classList.remove('active');
    document.getElementById('cart-drawer').classList.remove('active');
}

function closeCheckout() {
    document.getElementById('checkout-overlay').classList.remove('active');
    document.getElementById('checkout-modal').classList.remove('active');
}

function closeMobileNav() {
    document.getElementById('mobile-nav-overlay').classList.remove('active');
    document.getElementById('mobile-nav-drawer').classList.remove('active');
}

function updateCheckoutSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const zone = document.getElementById('cust-area')?.value || 'inside';
    const delivery = zone === 'inside' ? BUSINESS_CONFIG.deliveryChargeInside : BUSINESS_CONFIG.deliveryChargeOutside;

    document.getElementById('checkout-subtotal').innerText = `${BUSINESS_CONFIG.currency}${subtotal}`;
    document.getElementById('checkout-delivery').innerText = `${BUSINESS_CONFIG.currency}${delivery}`;
    document.getElementById('checkout-total').innerText = `${BUSINESS_CONFIG.currency}${subtotal + delivery}`;
}

window.openProductModal = function(id) {
    const p = productsData.find(item => item.id === id);
    if (!p) return;

    const content = document.getElementById('modal-content');
    content.innerHTML = `
        <div class="modal-product-grid">
            <img src="${p.image}" alt="${p.title}" class="modal-product-img">
            <div>
                <span class="product-category">${p.category}</span>
                <h2 style="font-size:1.5rem; margin-bottom:0.5rem;">${p.title}</h2>
                <div class="rating-stars" style="margin-bottom:1rem;">
                    <i class="fa-solid fa-star"></i> <span>${p.rating || 5.0}</span>
                </div>
                <div style="font-size:1.5rem; font-weight:800; margin-bottom:1rem; color:var(--primary-color);">
                    ${BUSINESS_CONFIG.currency}${p.price}
                </div>
                <p style="color:var(--text-muted); margin-bottom:1.5rem;">${p.description}</p>
                <button class="btn btn-primary btn-full" ${p.inStock === false ? 'disabled' : ''} onclick="addToCart(${p.id}); closeProductModal();">
                    ${p.inStock === false ? 'Sold Out' : 'Add to Bag'}
                </button>
            </div>
        </div>
    `;

    document.getElementById('product-modal-overlay').classList.add('active');
    document.getElementById('product-modal').classList.add('active');
};

window.closeProductModal = function() {
    document.getElementById('product-modal-overlay').classList.remove('active');
    document.getElementById('product-modal').classList.remove('active');
};

function showToast(msg) {
    const toast = document.getElementById('toast');
    const msgEl = document.getElementById('toast-message');
    if (!toast || !msgEl) return;

    msgEl.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}
