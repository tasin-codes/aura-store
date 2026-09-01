/* ==========================================================================
   BUSINESS CONFIGURATION
   ========================================================================== */
const BUSINESS_CONFIG = {
    businessName: "AURA STORE",
    whatsappNumber: "+8801861403911",
    currency: "৳",
    deliveryChargeInside: 80,
    deliveryChargeOutside: 150,
    phone: "+880 1861403911",
    email: "tasinbinazam@gmail.com",
    address: "Mirpur - 1, Block-A, Dhaka"
};

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
        
        // স্টক চেক কন্ডিশন
        const isOutOfStock = product.quantity === 0 || product.stock_status === "out_of_stock";

        // Sold Out থাকলে বাটন ও ব্যাজ কেমন হবে
        const actionButtonsHTML = isOutOfStock
            ? `<button class="btn btn-secondary disabled" disabled style="width: 100%; background-color: #9ca3af; cursor: not-allowed; opacity: 0.8; padding: 2px 4px !important; font-size: 0.65rem !important;">Sold Out</button>`
            : `<button class="btn btn-secondary" onclick="addToCart(${product.id})" style="padding: 2px 4px !important; font-size: 0.65rem !important;">
                    <i class="fa-solid fa-cart-plus"></i> Add
               </button>
               <button class="btn btn-primary" onclick="buyNow(${product.id})" style="padding: 2px 4px !important; font-size: 0.65rem !important;">
                    Buy Now
               </button>`;

        const badgeHTML = isOutOfStock
            ? `<span class="badge-discount" style="background-color: #ef4444;">Sold Out</span>`
            : (hasDiscount ? `<span class="badge-discount">Sale</span>` : '');

        return `
            <div class="product-card" data-id="${product.id}" style="padding: 6px !important;">
                <div class="card-image-wrap" onclick="openProductModal(${product.id})" style="height: 110px !important; min-height: 110px !important; max-height: 110px !important; overflow: hidden !important; border-radius: 6px !important;">
                    <img src="${product.image}" alt="${product.name}" loading="lazy" style="height: 100% !important; width: 100% !important; object-fit: cover !important;">
                    ${badgeHTML}
                    <button class="btn-wishlist ${isWishlisted ? 'active' : ''}" 
                            onclick="event.stopPropagation(); toggleWishlist(${product.id})" 
                            aria-label="Wishlist">
                        <i class="${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                    </button>
                </div>
                <div class="card-content" style="padding-top: 4px !important; gap: 1px !important;">
                    <span class="product-category" style="font-size: 0.6rem !important; margin-bottom: 1px !important;">${product.category}</span>
                    <h3 class="product-title" onclick="openProductModal(${product.id})" style="font-size: 0.75rem !important; line-height: 1.1 !important; margin: 1px 0 2px 0 !important; font-weight: 700;">${product.name}</h3>
                    <div class="rating-stars" style="font-size: 0.6rem !important; margin-bottom: 2px !important;">
                        ${getStarRatingHTML(product.rating)}
                        <span class="rating-count" style="font-size: 0.6rem !important;">(${product.ratingCount})</span>
                    </div>
                    <p class="product-description" style="font-size: 0.65rem !important; line-height: 1.1 !important; margin: 0 0 4px 0 !important; color: #6b7280; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${product.description}</p>
                    <div class="card-footer-price" style="margin-bottom: 4px !important;">
                        <span class="current-price" style="font-size: 0.75rem !important; font-weight: 800;">${BUSINESS_CONFIG.currency}${product.price}</span>
                        ${hasDiscount ? `<span class="old-price" style="font-size: 0.65rem !important; text-decoration: line-through; opacity: 0.6; margin-left: 4px;">${BUSINESS_CONFIG.currency}${product.oldPrice}</span>` : ''}
                    </div>
                    <div class="card-actions-grid" style="gap: 4px !important; margin-top: 2px !important;">
                        ${actionButtonsHTML}
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
   CART OPERATIONS
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
    filterAndSortProducts();
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
   CHECKOUT & EMAILJS SYSTEM
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

    // Cart items → readable text
    const orderItems = orderData.items.map((item, index) => {
        return `${index + 1}. ${item.name} x${item.quantity} = ${BUSINESS_CONFIG.currency}${item.price * item.quantity}`;
    }).join('\n');


    // =========================================================
    // EMAIL DATA
    // =========================================================

    const emailParams = {
    to_email: orderData.email,
    to_name: orderData.name,

    customer_name: orderData.name,
    order_id: orderData.orderId,

    phone: orderData.phone,
    email: orderData.email,

    address: `${orderData.address}, ${orderData.city}`,

    product: orderItems,

    quantity: orderData.items.reduce(
        (sum, item) => sum + item.quantity,
        0
    ),

    subtotal: `${BUSINESS_CONFIG.currency}${orderData.subtotal}`,

    delivery_charge: `${BUSINESS_CONFIG.currency}${orderData.deliveryCharge}`,

    total: `${BUSINESS_CONFIG.currency}${orderData.total}`,

    payment_method: "Cash on Delivery",

    notes: orderData.notes
};


    console.log("Sending order emails:", emailParams);


    // =========================================================
    // SEND BOTH EMAILS
    // =========================================================

    const ownerEmail = emailjs.send(
        "service_xpo9pt9",
        "template_f9swdxh",
        emailParams
    );

    const customerEmail = emailjs.send(
        "service_xpo9pt9",
        "template_tkdrcrs",
        emailParams
    );


    // =========================================================
    // AFTER BOTH EMAILS ARE SENT
    // =========================================================

    Promise.all([ownerEmail, customerEmail])
        .then(function(responses) {

            console.log("Owner email sent:", responses[0]);
            console.log("Customer confirmation sent:", responses[1]);

            // Show confirmation on website
            showOrderConfirmation(orderData);

            // Clear cart
            clearCart();

            // Close checkout
            closeCheckout();

        })
        .catch(function(error) {

            console.error("EmailJS Error:", error);

            alert(
                "Order could not be submitted. Please try again."
            );
        });
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
        <p style="font-size: 1rem; font-weight: 800; color: var(--primary-color);">Total Payable: ${BUSINESS_CONFIG.currency}${order.total}</p>
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
    searchInput.addEventListener('input', filterAndSortProducts);
    categorySelect.addEventListener('change', filterAndSortProducts);
    sortSelect.addEventListener('change', filterAndSortProducts);
    resetFiltersBtn.addEventListener('click', () => {
        searchInput.value = '';
        categorySelect.value = 'all';
        sortSelect.value = 'default';
        filterAndSortProducts();
    });

    cartToggleBtn.addEventListener('click', openCartDrawer);
    cartCloseBtn.addEventListener('click', closeCartDrawer);
    cartOverlay.addEventListener('click', closeCartDrawer);
    continueShoppingBtn.addEventListener('click', closeCartDrawer);
    openCheckoutBtn.addEventListener('click', openCheckout);

    deliveryAreaSelect.addEventListener('change', updateCartUI);

    modalCloseBtn.addEventListener('click', closeProductModal);
    productModalOverlay.addEventListener('click', closeProductModal);
    checkoutCloseBtn.addEventListener('click', closeCheckout);
    checkoutOverlay.addEventListener('click', closeCheckout);

    checkoutForm.addEventListener('submit', handleCheckoutSubmit);
    whatsappOrderBtn.addEventListener('click', generateWhatsAppMessage);

    backToShopBtn.addEventListener('click', () => {
        confirmationModal.classList.remove('active');
        confirmationOverlay.classList.remove('active');
    });

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
// Live Banner Auto-Slider JavaScript
let slideIndex = 0;
let slides = document.querySelectorAll(".slide");
let dots = document.querySelectorAll(".dot");
let slideInterval;

function showSlide(index) {
    slides = document.querySelectorAll(".slide");
    dots = document.querySelectorAll(".dot");
    if (!slides.length) return;
    
    slides.forEach((slide) => slide.classList.remove("active"));
    dots.forEach((dot) => dot.classList.remove("active"));
    
    slideIndex = (index + slides.length) % slides.length;
    
    slides[slideIndex].classList.add("active");
    dots[slideIndex].classList.add("active");
}

function nextSlide() {
    showSlide(slideIndex + 1);
}

function currentSlide(index) {
    showSlide(index);
    resetTimer();
}

function resetTimer() {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 4000); // ৪ সেকেন্ড পর পর ব্যানার চেঞ্জ হবে
}

// Dynamic Landing Page Functionality
document.addEventListener("DOMContentLoaded", () => {
    resetTimer();

    // Landing Page Handler: index.html?landing=true&id=PRODUCT_ID
    const urlParams = new URLSearchParams(window.location.search);
    const isLanding = urlParams.get('landing');
    const productId = urlParams.get('id');

    if (isLanding === 'true' && productId) {
        document.querySelector('.hero-slider-section')?.style.setProperty('display', 'none', 'important');
        document.querySelector('.about-section')?.style.setProperty('display', 'none', 'important');
        document.querySelector('.contact-section')?.style.setProperty('display', 'none', 'important');

        if (typeof openProductModal === 'function') {
            openProductModal(parseInt(productId));
        }
    }
});
// Toggle Payment Options Display (bKash & COD Only)
function togglePaymentDetails(type) {
    const bkashBox = document.getElementById('bkash-info');
    if (!bkashBox) return;
    
    if (type === 'bkash') {
        bkashBox.style.display = 'block';
    } else {
        bkashBox.style.display = 'none';
    }
}

// Function to Generate Invoice and Show Confirmation Modal
function generateInvoiceData(orderData) {
    const randomID = Math.floor(100000 + Math.random() * 900000);
    const today = new Date().toLocaleDateString('en-GB');

    document.getElementById('invoice-id').innerText = `Order ID: #AURA-${randomID}`;
    document.getElementById('invoice-date').innerText = `Date: ${today}`;
    
    document.getElementById('inv-cust-name').innerText = orderData.name;
    document.getElementById('inv-cust-phone').innerText = orderData.phone;
    document.getElementById('inv-cust-address').innerText = `${orderData.address}, ${orderData.city}`;
    document.getElementById('inv-payment-method').innerText = orderData.paymentMethod;

    // Show bKash Details in Invoice if bKash selected
    const trxInfoElem = document.getElementById('inv-trx-info');
    if (orderData.paymentMethod === 'bKash') {
        trxInfoElem.innerText = `Sender: ${orderData.bkashNum || 'N/A'} | TrxID: ${orderData.trxId || 'N/A'}`;
    } else {
        trxInfoElem.innerText = 'Pay Cash Upon Receipt';
    }

    // Populate Invoice Items
    const itemsBody = document.getElementById('inv-items-body');
    if (itemsBody) {
        itemsBody.innerHTML = '';
        if (orderData.items && orderData.items.length > 0) {
            orderData.items.forEach(item => {
                const row = `
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">৳${item.price * item.quantity}</td>
                    </tr>
                `;
                itemsBody.innerHTML += row;
            });
        }
    }

    document.getElementById('inv-subtotal').innerText = `৳${orderData.subtotal}`;
    document.getElementById('inv-delivery').innerText = `৳${orderData.delivery}`;
    document.getElementById('inv-total').innerText = `৳${orderData.total}`;
}

// Print / PDF Download Function for Invoice
function printInvoice() {
    const printContent = document.getElementById('printable-invoice').innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = `<div style="padding: 30px;">${printContent}</div>`;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
}
