
function handleCheckoutSubmit(e) {
    e.preventDefault();

    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    const orderData = {
        orderId: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
        name: document.getElementById('cust-name').value.trim(),
        phone: document.getElementById('cust-phone').value.trim(),
        email: document.getElementById('cust-email').value.trim(),
        address: document.getElementById('cust-address').value.trim(),
        city: document.getElementById('cust-city').value.trim(),
        area: deliveryAreaSelect.value,
        notes: document.getElementById('cust-notes').value.trim(),

        items: [...cart],
        subtotal: calculateSubtotal(),
        deliveryCharge: getDeliveryCharge(),
        total: calculateSubtotal() + getDeliveryCharge()
    };

    // Convert cart items into readable text
    const orderItems = orderData.items.map((item, index) => {
        return `${index + 1}. ${item.name} x${item.quantity} = ${BUSINESS_CONFIG.currency}${item.price * item.quantity}`;
    }).join('\n');

    // EmailJS data
    const templateParams = {
        order_id: orderData.orderId,
        customer_name: orderData.name,
        phone: orderData.phone,
        address: `${orderData.address}, ${orderData.city}`,
        product: orderItems,
        quantity: orderData.items.reduce((sum, item) => sum + item.quantity, 0),
        total: `${BUSINESS_CONFIG.currency}${orderData.total}`,
        payment_method: "Cash on Delivery"
    };

    // Send email through EmailJS
    emailjs.send(
        "service_xpo9pt9",
        "template_f9swdxh",
        templateParams
    )
    .then(function(response) {

        console.log(
            "Order email sent successfully!",
            response.status,
            response.text
        );

        // Email successfully sent
        showOrderConfirmation(orderData);

        // Empty cart
        clearCart();

        // Close checkout
        closeCheckout();

    })
    .catch(function(error) {

        console.error("EmailJS Error:", error);

        alert("Order could not be submitted. Please try again.");
    });
}
/* ==========================================================================
   BUSINESS CONFIGURATION (Edit details here)
   ========================================================================== */
const BUSINESS_CONFIG = {
    businessName: "AURA STORE",
    whatsappNumber: "8801700000000", // Format: country code without + sign (e.g. 8801700000000)
    currency: "৳",
    deliveryChargeInside: 80,
    deliveryChargeOutside: 150,
    phone: "+880 1700-000000",
    email: "support@aurastore.com",
    address: "Gulshan Avenue, Block NW-2, Dhaka"
};

/* ==========================================================================
   SAMPLE PRODUCTS DATA
   ========================================================================== */
const products = [
    {
        id: 1,
        name: "Minimalist Leather Backpack",
        category: "Bags",
        price: 3490,
        oldPrice: 4200,
        rating: 4.8,
        ratingCount: 42,
        image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80",
        description: "Crafted from full-grain genuine leather. Features a dedicated 15-inch laptop sleeve, water-resistant interior lining, and ergonomic padded shoulder straps."
    },
    {
        id: 2,
        name: "Wireless ANC Headphones",
        category: "Electronics",
        price: 5800,
        oldPrice: 6500,
        rating: 4.9,
        ratingCount: 128,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
        description: "Premium active noise cancelling over-ear headphones with custom 40mm drivers, 30-hour battery life, and ultra-soft memory foam ear cushions."
    },
    {
        id: 3,
        name: "Classic Stainless Steel Watch",
        category: "Accessories",
        price: 2990,
        oldPrice: null,
        rating: 4.6,
        ratingCount: 19,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
        description: "Japanese quartz movement timepiece with scratch-resistant sapphire crystal glass, brushed stainless steel case, and 50m water resistance."
    },
    {
        id: 4,
        name: "Ceramic Coffee Mug Set",
        category: "Home & Living",
        price: 1200,
        oldPrice: 1500,
        rating: 4.7,
        ratingCount: 56,
        image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
        description: "Handcrafted matte ceramic mugs. Dishwasher and microwave safe. Set of 2 ergonomic mugs designed to keep your morning brew hot longer."
    },
    {
        id: 5,
        name: "Smart Fitness Watch V2",
        category: "Electronics",
        price: 4500,
        oldPrice: 5200,
        rating: 4.5,
        ratingCount: 84,
        image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=600&q=80",
        description: "Track your heart rate, sleep metrics, workout routines, and phone notifications with a vibrant HD AMOLED touch display."
    },
    {
        id: 6,
        name: "Organic Cotton Casual Shirt",
        category: "Apparel",
        price: 1850,
        oldPrice: 2200,
        rating: 4.8,
        ratingCount: 37,
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80",
        description: "100% breathable organic cotton shirt. Tailored modern fit suitable for both casual weekends and office work."
    },
    {
        id: 7,
        name: "Polarized Retro Sunglasses",
        category: "Accessories",
        price: 1450,
        oldPrice: null,
        rating: 4.6,
        ratingCount: 62,
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80",
        description: "UV400 protection polarized lenses mounted in a lightweight acetate frame. Prevents harsh reflections and strain."
    },
    {
        id: 8,
        name: "Aromatic Soy Wax Candle",
        category: "Home & Living",
        price: 850,
        oldPrice: 990,
        rating: 4.9,
        ratingCount: 91,
        image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80",
        description: "Hand-poured 100% natural soy wax scented with lavender and cedarwood essential oils. 45-hour clean burn time."
    }
];

/* ==========================================================================
   APP STATE
   ========================================================================== */
let cart = JSON.parse(localStorage.getItem('aura_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('aura_wishlist')) || [];

/* ==========================================================================
   DOM ELEMENTS
   ========================================================================== */
const productsGrid = document.getElementById('products-grid');
const emptyProducts = document.getElementById('empty-products');
const searchInput = document.getElementById('search-input');
const categorySelect = document.getElementById('category-select');
const sortSelect = document.getElementById('sort-select');
const resetFiltersBtn = document.getElementById('reset-filters-btn');

// Cart Elements
const cartToggleBtn = document.getElementById('cart-toggle-btn');
const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const cartCloseBtn = document.getElementById('cart-close-btn');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartCountBadge = document.getElementById('cart-count');
const cartDrawerCount = document.getElementById('cart-drawer-count');
const cartSubtotalEl = document.getElementById('cart-subtotal');
const cartDeliveryEl = document.getElementById('cart-delivery');
const cartTotalEl = document.getElementById('cart-total');
const continueShoppingBtn = document.getElementById('continue-shopping-btn');
const openCheckoutBtn = document.getElementById('open-checkout-btn');

// Wishlist Elements
const wishlistCountBadge = document.getElementById('wishlist-count');

// Product Quick View Modal Elements
const productModal = document.getElementById('product-modal');
const productModalOverlay = document.getElementById('product-modal-overlay');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalContent = document.getElementById('modal-content');

// Checkout Modal Elements
const checkoutModal = document.getElementById('checkout-modal');
const checkoutOverlay = document.getElementById('checkout-overlay');
const checkoutCloseBtn = document.getElementById('checkout-close-btn');
const checkoutForm = document.getElementById('checkout-form');
const checkoutSubtotalEl = document.getElementById('checkout-subtotal');
const checkoutDeliveryEl = document.getElementById('checkout-delivery');
const checkoutTotalEl = document.getElementById('checkout-total');
const deliveryAreaSelect = document.getElementById('cust-area');
const whatsappOrderBtn = document.getElementById('whatsapp-order-btn');

// Order Confirmation Elements
const confirmationModal = document.getElementById('confirmation-modal');
const confirmationOverlay = document.getElementById('confirmation-overlay');
const confirmationDetails = document.getElementById('confirmation-details');
const backToShopBtn = document.getElementById('back-to-shop-btn');

// Mobile Nav Elements
const hamburgerBtn = document.getElementById('hamburger-btn');
const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
const mobileNavClose = document.getElementById('mobile-nav-close');
const mobileLinks = document.querySelectorAll('.mobile-link');

// Toast
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    applyBusinessConfig();
    populateCategoryFilter();
    renderProducts(products);
    updateCartUI();
    updateWishlistUI();
    setupEventListeners();
});

function applyBusinessConfig() {
    document.getElementById('brand-logo-text').textContent = BUSINESS_CONFIG.businessName;
    document.getElementById('mobile-brand-logo').textContent = BUSINESS_CONFIG.businessName;
    document.getElementById('footer-brand-name').textContent = BUSINESS_CONFIG.businessName;
    document.getElementById('copyright-name').textContent = BUSINESS_CONFIG.businessName;
    document.getElementById('contact-phone-display').textContent = BUSINESS_CONFIG.phone;
    document.getElementById('contact-email-display').textContent = BUSINESS_CONFIG.email;
    document.getElementById('contact-address-display').textContent = BUSINESS_CONFIG.address;

    // Set currency symbols across static UI
    document.querySelectorAll('.currency-symbol').forEach(el => {
        el.textContent = BUSINESS_CONFIG.currency;
    });
}

function populateCategoryFilter() {
    const categories = ['all', ...new Set(products.map(p => p.category))];
    categorySelect.innerHTML = categories.map(cat => 
        `<option value="${cat}">${cat === 'all' ? 'All Categories' : cat}</option>`
    ).join('');
}

/* ==========================================================================
   PRODUCT RENDERING & FILTERING
   ========================================================================== */
function renderProducts(items) {
    if (items.length === 0) {
        productsGrid.innerHTML = '';
        emptyProducts.classList.remove('hidden');
        return;
    }

    emptyProducts.classList.add('hidden');
    productsGrid.innerHTML = items.map(product => {
        const isWishlisted = wishlist.includes(product.id);
        const hasDiscount = product.oldPrice && product.oldPrice > product.price;

        return `
            <div class="product-card" data-id="${product.id}">
                <div class="card-image-wrap" onclick="openProductModal(${product.id})">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    ${hasDiscount ? `<span class="badge-discount">Sale</span>` : ''}
                    <button class="btn-wishlist ${isWishlisted ? 'active' : ''}" 
                            onclick="event.stopPropagation(); toggleWishlist(${product.id})" 
                            aria-label="Wishlist">
                        <i class="${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                    </button>
                </div>
                <div class="card-content">
                    <span class="product-category">${product.category}</span>
                    <h3 class="product-title" onclick="openProductModal(${product.id})">${product.name}</h3>
                    <div class="rating-stars">
                        ${getStarRatingHTML(product.rating)}
                        <span class="rating-count">(${product.ratingCount})</span>
                    </div>
                    <p class="product-description">${product.description}</p>
                    <div class="card-footer-price">
                        <span class="current-price">${BUSINESS_CONFIG.currency}${product.price}</span>
                        ${hasDiscount ? `<span class="old-price">${BUSINESS_CONFIG.currency}${product.oldPrice}</span>` : ''}
                    </div>
                    <div class="card-actions-grid">
                        <button class="btn btn-secondary" onclick="addToCart(${product.id})">
                            <i class="fa-solid fa-cart-plus"></i> Add
                        </button>
                        <button class="btn btn-primary" onclick="buyNow(${product.id})">
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function getStarRatingHTML(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            stars += `<i class="fa-solid fa-star"></i>`;
        } else if (i - rating < 1) {
            stars += `<i class="fa-solid fa-star-half-stroke"></i>`;
        } else {
            stars += `<i class="fa-regular fa-star"></i>`;
        }
    }
    return stars;
}

function filterAndSortProducts() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedCategory = categorySelect.value;
    const selectedSort = sortSelect.value;

    let filtered = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
                              product.description.toLowerCase().includes(searchTerm);
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (selectedSort === 'price-low') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (selectedSort === 'price-high') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (selectedSort === 'name-asc') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    renderProducts(filtered);
}

/* ==========================================================================
   CART OPERATIONS & LOCALSTORAGE
   ========================================================================== */
function addToCart(productId, quantity = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = cart.findIndex(item => item.id === productId);
    if (existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
    }

    saveCart();
    updateCartUI();
    showToast(`Added "${product.name}" to your bag!`);
}

function updateCartQuantity(productId, delta) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        cart[itemIndex].quantity += delta;
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        saveCart();
        updateCartUI();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
    showToast("Item removed from cart.");
}

function saveCart() {
    localStorage.setItem('aura_cart', JSON.stringify(cart));
}

function calculateSubtotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function getDeliveryCharge() {
    if (cart.length === 0) return 0;
    const isOutside = deliveryAreaSelect.value === 'outside';
    return isOutside ? BUSINESS_CONFIG.deliveryChargeOutside : BUSINESS_CONFIG.deliveryChargeInside;
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountBadge.textContent = totalItems;
    cartDrawerCount.textContent = totalItems;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-products">
                <i class="fa-solid fa-bag-shopping"></i>
                <p>Your shopping bag is empty.</p>
            </div>
        `;
    } else {
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <div class="cart-item-price">${BUSINESS_CONFIG.currency}${item.price}</div>
                    <div class="cart-qty-controls">
                        <button class="cart-qty-btn" onclick="updateCartQuantity(${item.id}, -1)">-</button>
                        <span class="cart-qty-val">${item.quantity}</span>
                        <button class="cart-qty-btn" onclick="updateCartQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})" aria-label="Remove item">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `).join('');
    }

    const subtotal = calculateSubtotal();
    const delivery = getDeliveryCharge();
    const total = subtotal + delivery;

    cartSubtotalEl.textContent = `${BUSINESS_CONFIG.currency}${subtotal}`;
    cartDeliveryEl.textContent = `${BUSINESS_CONFIG.currency}${delivery}`;
    cartTotalEl.textContent = `${BUSINESS_CONFIG.currency}${total}`;

    // Update checkout summary values
    checkoutSubtotalEl.textContent = `${BUSINESS_CONFIG.currency}${subtotal}`;
    checkoutDeliveryEl.textContent = `${BUSINESS_CONFIG.currency}${delivery}`;
    checkoutTotalEl.textContent = `${BUSINESS_CONFIG.currency}${total}`;
}

function buyNow(productId) {
    addToCart(productId);
    openCheckout();
}

/* ==========================================================================
   WISHLIST SYSTEM
   ========================================================================== */
function toggleWishlist(productId) {
    const index = wishlist.indexOf(productId);
    if (index > -1) {
        wishlist.splice(index, 1);
        showToast("Removed from wishlist.");
    } else {
        wishlist.push(productId);
        showToast("Added to wishlist!");
    }
    localStorage.setItem('aura_wishlist', JSON.stringify(wishlist));
    updateWishlistUI();
    filterAndSortProducts(); // Re-render to update heart icon colors
}

function updateWishlistUI() {
    wishlistCountBadge.textContent = wishlist.length;
}

/* ==========================================================================
   PRODUCT DETAILS MODAL
   ========================================================================== */
function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    modalContent.innerHTML = `
        <div class="modal-product-grid">
            <img src="${product.image}" alt="${product.name}" class="modal-product-img">
            <div>
                <span class="product-category">${product.category}</span>
                <h2 style="font-size: 1.6rem; font-weight: 800; margin-bottom: 0.5rem;">${product.name}</h2>
                <div class="rating-stars" style="margin-bottom: 1rem;">
                    ${getStarRatingHTML(product.rating)}
                    <span class="rating-count">(${product.ratingCount} reviews)</span>
                </div>
                <div class="card-footer-price" style="margin-bottom: 1.25rem;">
                    <span class="current-price" style="font-size: 1.5rem;">${BUSINESS_CONFIG.currency}${product.price}</span>
                    ${product.oldPrice ? `<span class="old-price" style="font-size: 1.1rem;">${BUSINESS_CONFIG.currency}${product.oldPrice}</span>` : ''}
                </div>
                <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem;">${product.description}</p>
                
                <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1.5rem;">
                    <label style="font-weight: 600; font-size: 0.9rem;">Quantity:</label>
                    <div class="cart-qty-controls" style="padding: 0.25rem;">
                        <button class="cart-qty-btn" id="modal-qty-minus">-</button>
                        <span class="cart-qty-val" id="modal-qty-val">1</span>
                        <button class="cart-qty-btn" id="modal-qty-plus">+</button>
                    </div>
                </div>

                <div style="display: flex; gap: 1rem;">
                    <button class="btn btn-primary btn-full" id="modal-add-cart-btn">Add to Cart</button>
                    <button class="btn btn-secondary btn-full" id="modal-buy-now-btn">Buy Now</button>
                </div>
            </div>
        </div>
    `;

    let modalQty = 1;
    const qtyValEl = document.getElementById('modal-qty-val');
    
    document.getElementById('modal-qty-minus').addEventListener('click', () => {
        if (modalQty > 1) {
            modalQty--;
            qtyValEl.textContent = modalQty;
        }
    });

    document.getElementById('modal-qty-plus').addEventListener('click', () => {
        modalQty++;
        qtyValEl.textContent = modalQty;
    });

    document.getElementById('modal-add-cart-btn').addEventListener('click', () => {
        addToCart(product.id, modalQty);
        closeProductModal();
    });

    document.getElementById('modal-buy-now-btn').addEventListener('click', () => {
        addToCart(product.id, modalQty);
        closeProductModal();
        openCheckout();
    });

    productModal.classList.add('active');
    productModalOverlay.classList.add('active');
}

function closeProductModal() {
    productModal.classList.remove('active');
    productModalOverlay.classList.remove('active');
}

/* ==========================================================================
   CHECKOUT & ORDER SYSTEM
   ========================================================================== */
function openCheckout() {
    if (cart.length === 0) {
        showToast("Your cart is empty. Add items first!");
        return;
    }
    closeCartDrawer();
    updateCartUI();
    checkoutModal.classList.add('active');
    checkoutOverlay.classList.add('active');
}

function closeCheckout() {
    checkoutModal.classList.remove('active');
    checkoutOverlay.classList.remove('active');
}

function handleCheckoutSubmit(e) {
    e.preventDefault();

    const orderData = {
        orderId: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
        name: document.getElementById('cust-name').value,
        phone: document.getElementById('cust-phone').value,
        email: document.getElementById('cust-email').value,
        address: document.getElementById('cust-address').value,
        city: document.getElementById('cust-city').value,
        area: deliveryAreaSelect.value,
        notes: document.getElementById('cust-notes').value,
        items: [...cart],
        subtotal: calculateSubtotal(),
        deliveryCharge: getDeliveryCharge(),
        total: calculateSubtotal() + getDeliveryCharge()
    };

    showOrderConfirmation(orderData);
    clearCart();
    closeCheckout();
}

function generateWhatsAppMessage() {
    const name = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const address = document.getElementById('cust-address').value.trim();
    const city = document.getElementById('cust-city').value.trim();

    if (!name || !phone || !address) {
        alert("Please fill out your Name, Phone Number, and Address before ordering via WhatsApp.");
        return;
    }

    let message = `*NEW ORDER - ${BUSINESS_CONFIG.businessName}*\n`;
    message += `------------------------------\n`;
    message += `*Customer:* ${name}\n`;
    message += `*Phone:* ${phone}\n`;
    message += `*Address:* ${address}, ${city}\n\n`;
    message += `*Order Items:*\n`;

    cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name} x${item.quantity} = ${BUSINESS_CONFIG.currency}${item.price * item.quantity}\n`;
    });

    const subtotal = calculateSubtotal();
    const delivery = getDeliveryCharge();
    const total = subtotal + delivery;

    message += `\n------------------------------\n`;
    message += `*Subtotal:* ${BUSINESS_CONFIG.currency}${subtotal}\n`;
    message += `*Delivery Fee:* ${BUSINESS_CONFIG.currency}${delivery}\n`;
    message += `*Total Amount:* ${BUSINESS_CONFIG.currency}${total}\n`;
    message += `*Payment Method:* Cash on Delivery\n`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappURL, '_blank');
}

function showOrderConfirmation(order) {
    confirmationDetails.innerHTML = `
        <p><strong>Order ID:</strong> #${order.orderId}</p>
        <p><strong>Customer Name:</strong> ${order.name}</p>
        <p><strong>Phone:</strong> ${order.phone}</p>
        <p><strong>Delivery Address:</strong> ${order.address}, ${order.city}</p>
        <hr style="margin: 0.75rem 0; border: none; border-top: 1px dashed var(--border-color);">
        <p><strong>Ordered Items (${order.items.length}):</strong></p>
        <ul style="margin-left: 1.25rem; margin-bottom: 0.75rem;">
            ${order.items.map(item => `<li>${item.name} x ${item.quantity} (${BUSINESS_CONFIG.currency}${item.price * item.quantity})</li>`).join('')}
        </ul>
        <p style="font-size: 1rem; font-weight: 800; color: var(--primary-color);">Total Paid/Payable: ${BUSINESS_CONFIG.currency}${order.total}</p>
    `;

    confirmationModal.classList.add('active');
    confirmationOverlay.classList.add('active');
}

function clearCart() {
    cart = [];
    saveCart();
    updateCartUI();
}

/* ==========================================================================
   DRAWER & UI EVENT HANDLERS
   ========================================================================== */
function openCartDrawer() {
    cartDrawer.classList.add('active');
    cartOverlay.classList.add('active');
}

function closeCartDrawer() {
    cartDrawer.classList.remove('active');
    cartOverlay.classList.remove('active');
}

function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function setupEventListeners() {
    // Search & Filter Listeners
    searchInput.addEventListener('input', filterAndSortProducts);
    categorySelect.addEventListener('change', filterAndSortProducts);
    sortSelect.addEventListener('change', filterAndSortProducts);
    resetFiltersBtn.addEventListener('click', () => {
        searchInput.value = '';
        categorySelect.value = 'all';
        sortSelect.value = 'default';
        filterAndSortProducts();
    });

    // Cart Drawer Listeners
    cartToggleBtn.addEventListener('click', openCartDrawer);
    cartCloseBtn.addEventListener('click', closeCartDrawer);
    cartOverlay.addEventListener('click', closeCartDrawer);
    continueShoppingBtn.addEventListener('click', closeCartDrawer);
    openCheckoutBtn.addEventListener('click', openCheckout);

    // Delivery Area Selection Listener
    deliveryAreaSelect.addEventListener('change', updateCartUI);

    // Modal Close Listeners
    modalCloseBtn.addEventListener('click', closeProductModal);
    productModalOverlay.addEventListener('click', closeProductModal);
    checkoutCloseBtn.addEventListener('click', closeCheckout);
    checkoutOverlay.addEventListener('click', closeCheckout);

    // Checkout Submit
    checkoutForm.addEventListener('submit', handleCheckoutSubmit);
    whatsappOrderBtn.addEventListener('click', generateWhatsAppMessage);

    // Confirmation Close
    backToShopBtn.addEventListener('click', () => {
        confirmationModal.classList.remove('active');
        confirmationOverlay.classList.remove('active');
    });

    // Mobile Navigation Drawer
    hamburgerBtn.addEventListener('click', () => {
        mobileNavDrawer.classList.add('active');
        mobileNavOverlay.classList.add('active');
    });

    const closeMobileNav = () => {
        mobileNavDrawer.classList.remove('active');
        mobileNavOverlay.classList.remove('active');
    };

    mobileNavClose.addEventListener('click', closeMobileNav);
    mobileNavOverlay.addEventListener('click', closeMobileNav);
    mobileLinks.forEach(link => link.addEventListener('click', closeMobileNav));
}
