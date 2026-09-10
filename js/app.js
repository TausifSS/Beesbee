/**
 * BEESBEE - Main Application UI & PWA Orchestrator
 * Pure Natural Honey Single-Seller Storefront
 */

let deferredPWAInstallPrompt = null;
let currentActiveView = "home";

document.addEventListener("DOMContentLoaded", () => {
  initApp();
  initPWA();
});

function initApp() {
  renderProductCards();
  renderShopCards();
  renderSpecialOffersSection();
  renderVideoSection();
  setupEventListeners();
  updateCartBadge();
  setupProfileData();
  initHistoryHandling();
}

/**
 * Native PWA History API Back-Button Handling
 */
let historyInitialized = false;

function initHistoryHandling() {
  if (historyInitialized) return;
  historyInitialized = true;

  try {
    history.replaceState({ view: 'home' }, '');
  } catch (e) {}

  window.addEventListener('popstate', (event) => {
    // 1. If any drawer or modal is open, close it!
    const closedOverlay = closeAnyActiveOverlay();
    if (closedOverlay) {
      return; // Handled back button by closing overlay
    }

    // 2. If no modal is open, switch view back smoothly
    if (event.state && event.state.view) {
      switchView(event.state.view, false);
    } else {
      switchView('home', false);
    }
  });
}

function pushHistoryState(stateObj) {
  try {
    history.pushState(stateObj, '');
  } catch (e) {}
}

function closeAnyActiveOverlay() {
  const sidebarPanel = document.getElementById("mobile-sidebar-panel");
  if (sidebarPanel && sidebarPanel.classList.contains("translate-x-0")) {
    closeSidebar();
    return true;
  }

  const overlayIds = [
    'wishlist-modal',
    'addresses-modal',
    'rewards-modal',
    'checkout-modal',
    'product-detail-modal',
    'video-modal',
    'story-modal',
    'search-modal',
    'notifications-modal',
    'cart-drawer'
  ];

  for (const id of overlayIds) {
    const el = document.getElementById(id);
    if (el && !el.classList.contains('hidden')) {
      el.classList.add('hidden');
      document.body.style.overflow = '';
      return true;
    }
  }
  return false;
}

/**
 * PWA Service Worker Registration & Installation Banner
 */
function initPWA() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => console.log('BeesBee Service Worker registered with scope:', reg.scope))
      .catch((err) => console.warn('Service Worker registration failed:', err));
  }

  // Listen for PWA Install Prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPWAInstallPrompt = e;

    // Check if user has already dismissed prompt in localStorage
    const hasDismissed = localStorage.getItem('beesbee_pwa_dismissed');
    if (!hasDismissed) {
      setTimeout(() => {
        showPWAInstallBanner();
      }, 2500);
    }
  });

  window.addEventListener('appinstalled', () => {
    console.log('BeesBee App installed successfully!');
    hidePWAInstallBanner();
    showToast("BeesBee App installed! 🍯", "success");
    deferredPWAInstallPrompt = null;
  });
}

function showPWAInstallBanner() {
  const banner = document.getElementById("pwa-install-banner");
  if (banner) {
    banner.classList.remove("translate-y-full", "hidden");
  }
}

function hidePWAInstallBanner(permanently = false) {
  const banner = document.getElementById("pwa-install-banner");
  if (banner) {
    banner.classList.add("translate-y-full");
    setTimeout(() => banner.classList.add("hidden"), 350);
  }
  if (permanently) {
    localStorage.setItem('beesbee_pwa_dismissed', 'true');
  }
}

function triggerPWAInstall() {
  if (deferredPWAInstallPrompt) {
    deferredPWAInstallPrompt.prompt();
    deferredPWAInstallPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted PWA install');
      } else {
        console.log('User dismissed PWA install');
      }
      deferredPWAInstallPrompt = null;
      hidePWAInstallBanner();
    });
  } else {
    showToast("To install, tap Share and select 'Add to Home Screen' in your browser", "info");
  }
}

/**
 * Switch Bottom Navigation Views: Home, Shop, Orders, Offers, Profile
 */
function switchView(viewName, pushHistory = true) {
  currentActiveView = viewName;

  if (pushHistory) {
    pushHistoryState({ view: viewName });
  }

  const views = ['home', 'shop', 'orders', 'offers', 'profile'];
  views.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    if (el) {
      if (v === viewName) {
        el.classList.remove("hidden");
      } else {
        el.classList.add("hidden");
      }
    }

    const tabBtn = document.getElementById(`tab-btn-${v}`);
    if (tabBtn) {
      if (v === viewName) {
        tabBtn.classList.add("text-[#D97706]");
        tabBtn.classList.remove("text-stone-500");
        const svg = tabBtn.querySelector("svg");
        if (svg) svg.classList.add("text-[#D97706]", "stroke-[#D97706]");
      } else {
        tabBtn.classList.remove("text-[#D97706]");
        tabBtn.classList.add("text-stone-500");
        const svg = tabBtn.querySelector("svg");
        if (svg) svg.classList.remove("text-[#D97706]", "stroke-[#D97706]");
      }
    }

    // Sidebar active item styling
    const sideBtn = document.getElementById(`sidebar-btn-${v}`);
    if (sideBtn) {
      if (v === viewName) {
        sideBtn.classList.add("bg-emerald-50", "text-[#1B4332]");
        sideBtn.classList.remove("text-stone-800");
      } else {
        sideBtn.classList.remove("bg-emerald-50", "text-[#1B4332]");
        sideBtn.classList.add("text-stone-800");
      }
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (viewName === 'shop') {
    renderShopCards();
  } else if (viewName === 'orders') {
    renderOrdersListView();
  }
}

/**
 * Toast Utility
 */
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  
  let icon = "🍯";
  if (type === "success") icon = "✓";
  if (type === "error") icon = "⚠️";
  if (type === "gps") icon = "📍";

  toast.innerHTML = `
    <span class="font-bold text-base text-amber-400">${icon}</span>
    <span class="flex-1">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-10px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/**
 * Render 4 Honey Bottle Cards (250g, 500g, 1kg, 2kg)
 */
function renderProductCards(filterSize = null) {
  const grid = document.getElementById("products-grid");
  if (!grid) return;

  const product = window.BEESBEE_PRODUCTS[0];
  let sizes = product.sizes;

  if (filterSize) {
    sizes = sizes.filter(s => s.size.toLowerCase() === filterSize.toLowerCase());
  }

  grid.innerHTML = sizes.map(item => `
    <div class="bg-white rounded-2xl p-4 honey-card-shadow border border-[#F0EBE1] flex flex-col justify-between hover:border-amber-400 transition-all duration-300 group">
      <!-- Image & Badges Area -->
      <div class="relative bg-[#FBF9F4] rounded-xl p-3 flex items-center justify-center min-h-[165px] overflow-hidden cursor-pointer" onclick="openProductDetailModal('${item.size}')">
        ${item.isBestValue ? `
          <span class="absolute top-2 left-2 bg-[#1B4332] text-amber-300 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider shadow-sm">
            Best Value
          </span>
        ` : ''}
        ${item.isPopular ? `
          <span class="absolute top-2 left-2 bg-[#D97706] text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider shadow-sm">
            Popular
          </span>
        ` : ''}

        <img 
          src="${item.image}" 
          alt="BeesBee Pure Honey ${item.size}" 
          class="h-32 object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onerror="this.src='assets/images/mockup_reference.png'"
        />
      </div>

      <!-- Content -->
      <div class="mt-3 flex-1 flex flex-col">
        <div class="flex items-center justify-between">
          <span class="bg-[#B45309] text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-md shadow-xs">
            ${item.size}
          </span>
          <span class="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
            ${item.discountPercent}% OFF
          </span>
        </div>

        <h4 class="font-bold text-xs sm:text-sm text-stone-900 mt-2 line-clamp-1">BeesBee Pure Honey</h4>
        <p class="text-[11px] text-stone-500 font-medium line-clamp-1">${item.tagline}</p>

        <!-- Mini Badges -->
        <div class="flex items-center gap-2 mt-2 text-[10px] text-stone-500">
          <span>🍃 100% Natural</span>
          <span>•</span>
          <span>🛡️ Lab Tested</span>
        </div>

        <!-- Pricing -->
        <div class="flex items-baseline gap-1.5 mt-2">
          <span class="text-lg sm:text-xl font-extrabold text-[#2B1810]">₹${item.price}</span>
          <span class="text-xs text-stone-400 line-through">₹${item.originalPrice}</span>
        </div>

        ${item.specialOfferText ? `
          <div class="mt-1">
            <span class="text-[10px] font-extrabold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md inline-block">
              🎁 ${item.specialOfferText}
            </span>
          </div>
        ` : ''}

        <!-- Real Action Buttons -->
        <div class="mt-4 flex flex-col gap-2">
          <button 
            type="button" 
            onclick="handleAddToCart('${item.size}')"
            class="w-full bg-[#FAF5EC] hover:bg-[#F3EAD9] border border-amber-300 text-[#92400E] font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            <span>Add to Cart</span>
          </button>
          
          <button 
            type="button" 
            onclick="openDirectOrderModal('${item.size}')"
            class="w-full forest-btn font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1 shadow-sm">
            <span>Order Now</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

/**
 * Dedicated Shop Page Functions (Matching Image 2 Reference)
 */
let currentShopCategory = 'all';
let currentShopSearchQuery = '';
let currentShopSortAsc = true;

function renderShopCards() {
  const grid = document.getElementById("shop-products-grid");
  if (!grid) return;

  const product = window.BEESBEE_PRODUCTS[0];
  let sizes = [...product.sizes];

  // Category filter
  if (currentShopCategory === 'pure') {
    // All pure honey jars
  } else if (currentShopCategory === 'raw') {
    // All raw honey jars
  } else if (currentShopCategory === 'combo' || currentShopCategory === 'deals') {
    sizes = sizes.filter(s => s.size === '2kg' || s.size === '1kg');
  }

  // Search filter
  if (currentShopSearchQuery) {
    const q = currentShopSearchQuery.toLowerCase().trim();
    sizes = sizes.filter(s => 
      s.size.toLowerCase().includes(q) || 
      s.tagline.toLowerCase().includes(q) || 
      "pure natural honey".includes(q)
    );
  }

  // Sort
  if (!currentShopSortAsc) {
    sizes.sort((a, b) => b.price - a.price);
  } else {
    sizes.sort((a, b) => a.price - b.price);
  }

  if (sizes.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-10 text-center text-stone-400 text-xs">
        No honey jars found matching your search.
      </div>
    `;
    return;
  }

  grid.innerHTML = sizes.map(item => `
    <div class="bg-white rounded-2xl p-3 sm:p-4 border border-stone-200/90 shadow-2xs flex flex-col justify-between hover:border-amber-400 transition-all duration-300 group">
      <div>
        <!-- Badges Bar -->
        <div class="flex items-center justify-between">
          <span class="bg-amber-100 text-amber-900 text-[11px] font-extrabold px-2.5 py-0.5 rounded-md">
            ${item.size}
          </span>
          ${item.size === '2kg' ? `
            <span class="bg-[#1B4332] text-amber-200 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md">
              BEST VALUE
            </span>
          ` : ''}
        </div>

        <!-- Jar Image -->
        <div class="flex items-center justify-center py-2 cursor-pointer" onclick="openProductDetailModal('${item.size}')">
          <img 
            src="${item.image}" 
            alt="BeesBee Pure Honey ${item.size}" 
            class="h-28 sm:h-36 object-contain group-hover:scale-105 transition-transform duration-300"
            onerror="this.src='assets/images/jar_${item.size}.png'"
          />
        </div>

        <!-- Details -->
        <h4 class="font-bold text-xs sm:text-sm text-stone-900 leading-tight">BeesBee Pure Honey</h4>
        <p class="text-[11px] text-stone-500 font-medium mt-0.5 line-clamp-1">${item.tagline}.</p>

        <!-- Feature Checkmarks Matching Image 2 -->
        <div class="space-y-0.5 mt-2.5 text-[10px] text-stone-600 font-medium">
          <div class="flex items-center gap-1.5">
            <span class="text-emerald-700">🍃</span>
            <span>100% Natural</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-amber-700">⚗️</span>
            <span>No Added Sugar</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-stone-700">🛡️</span>
            <span>Lab Tested</span>
          </div>
        </div>
      </div>

      <!-- Price & Real Interactive Dual Buttons Matching Image 2 -->
      <div class="mt-3 pt-2.5 border-t border-stone-100">
        <div class="text-base sm:text-lg font-black text-stone-900 mb-2">
          ₹${item.price}
        </div>

        <div class="flex flex-col gap-1.5">
          <button 
            type="button" 
            onclick="handleAddToCart('${item.size}')"
            class="w-full bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-bold text-[11px] py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all">
            <svg class="w-3.5 h-3.5 text-stone-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            <span>Add to Cart</span>
          </button>

          <button 
            type="button" 
            onclick="openDirectOrderModal('${item.size}')"
            class="w-full bg-[#D97706] hover:bg-[#B45309] text-white font-bold text-[11px] py-2 px-2.5 rounded-xl flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all">
            <span>Order Now</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

function handleShopSearch(val) {
  currentShopSearchQuery = val;
  renderShopCards();
}

function setShopCategory(cat, btnEl) {
  currentShopCategory = cat;
  const pills = document.querySelectorAll(".shop-filter-pill");
  pills.forEach(p => {
    p.classList.remove("bg-[#1B4332]", "text-white", "active");
    p.classList.add("bg-white", "text-stone-700", "border", "border-stone-200");
  });

  if (btnEl) {
    btnEl.classList.remove("bg-white", "text-stone-700", "border-stone-200");
    btnEl.classList.add("bg-[#1B4332]", "text-white", "active");
  }

  renderShopCards();
}

function toggleShopSort() {
  currentShopSortAsc = !currentShopSortAsc;
  const btn = document.getElementById("shop-sort-btn");
  if (btn) {
    btn.querySelector("span").textContent = currentShopSortAsc ? "Sort ↑" : "Sort ↓";
  }
  renderShopCards();
  showToast(currentShopSortAsc ? "Sorted by Price: Low to High" : "Sorted by Price: High to Low", "info");
}

function openCategoryFilterQuick() {
  const current = currentShopCategory;
  const next = current === 'all' ? 'combo' : 'all';
  const pills = document.querySelectorAll(".shop-filter-pill");
  pills.forEach(p => {
    if (next === 'combo' && p.textContent.includes('Combo')) {
      setShopCategory('combo', p);
    } else if (next === 'all' && p.textContent.includes('All')) {
      setShopCategory('all', p);
    }
  });
}

function claimSpecialDeal() {
  handleAddToCart('2kg');
  openCartDrawer();
  showToast("Special Deal Applied! Buy 2kg and get 250g FREE 🎁", "success");
}

/**
 * Render Special Offer Banner on Home View
 */
function renderSpecialOffersSection() {
  const container = document.getElementById("offers-container");
  if (!container) return;

  container.innerHTML = `
    <div class="bg-gradient-to-r from-[#FFF8EE] via-[#FBF2DE] to-[#F5E6C8] rounded-2xl p-4 sm:p-5 border border-amber-200 shadow-sm relative overflow-hidden">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex-1 text-center sm:text-left">
          <span class="inline-block bg-[#D97706] text-white font-extrabold text-[10px] tracking-wider px-2.5 py-0.5 rounded-full uppercase mb-1.5 shadow-xs">
            SPECIAL HONEY DEAL
          </span>
          <h3 class="text-2xl sm:text-3xl font-bold font-serif-brand text-stone-900 leading-tight">
            Buy 2kg Get <span class="text-[#D97706]">250g FREE!</span>
          </h3>
          <p class="text-xs text-stone-600 mt-1 font-medium">
            More Honey. More Happiness. 100% Raw Forest Harvest with sterile glass packaging.
          </p>

          <div class="mt-3 flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-[#1B4332]">
            <span>🍃 100% Natural</span>
            <span>•</span>
            <span>🛡️ Lab Tested</span>
            <span>•</span>
            <span>🚚 Free Delivery</span>
          </div>
        </div>

        <div class="flex flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
          <button 
            type="button" 
            onclick="openDirectOrderModal('2kg')"
            class="w-full sm:w-auto bg-[#1B4332] hover:bg-[#122E22] text-white font-extrabold text-xs sm:text-sm py-3 px-6 rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all">
            <span>Claim Offer on WhatsApp</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render Reusable "Behind the Honey 🍯" Video Showcase
 */
function renderVideoSection() {
  const container = document.getElementById("video-showcase-container");
  if (!container) return;

  const vid = window.BEESBEE_CONFIG.videos[0];

  container.innerHTML = `
    <div class="bg-white rounded-3xl p-5 border border-[#EDE7DB] shadow-sm">
      <div class="flex items-center justify-between mb-3">
        <div>
          <span class="text-[11px] font-bold tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase">
            🎥 Behind the Honey
          </span>
          <h3 class="text-lg sm:text-xl font-bold font-heading text-[#2B1810] mt-1">
            See Where Your Honey Comes From
          </h3>
          <p class="text-xs text-stone-500">Real Hives. Real Honey. Real People.</p>
        </div>
      </div>

      <!-- Video Preview Card -->
      <div class="relative rounded-2xl overflow-hidden bg-stone-900 group shadow-md aspect-video max-h-[260px] flex items-center justify-center cursor-pointer" onclick="openVideoPlayerModal()">
        <img 
          src="${vid.poster}" 
          alt="${vid.title}" 
          class="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-4">
          <div class="flex justify-between items-center">
            <span class="bg-emerald-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-sm">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Authentic Harvest Footage
            </span>
            <span class="text-xs font-mono text-white/90 bg-black/50 px-2 py-0.5 rounded">${vid.duration}</span>
          </div>

          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-amber-500 text-stone-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
            <div>
              <h4 class="text-white font-bold text-sm sm:text-base leading-snug drop-shadow">${vid.title}</h4>
              <p class="text-stone-300 text-xs line-clamp-1 drop-shadow">Tap to watch real beekeeping & collection</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Handle Add to Cart
 */
function handleAddToCart(size) {
  const success = window.cartManager.addItem(size, 1);
  if (success) {
    updateCartBadge();
    showToast(`Added ${size} jar to cart! 🍯`, "success");
  }
}

/**
 * Update Cart Badge Count
 */
function updateCartBadge() {
  const summary = window.cartManager.getSummary();
  const badges = document.querySelectorAll(".cart-count-badge");
  badges.forEach(badge => {
    badge.textContent = summary.totalCount;
    if (summary.totalCount > 0) {
      badge.classList.remove("hidden");
    } else {
      badge.classList.add("hidden");
    }
  });

  const sidebarCount = document.getElementById("sidebar-cart-count");
  if (sidebarCount) {
    sidebarCount.textContent = summary.totalCount;
  }
}

/**
 * Product Detail Modal
 */
let currentModalSelectedSize = "500g";

function openProductDetailModal(initialSize = "500g") {
  currentModalSelectedSize = initialSize;
  const modal = document.getElementById("product-detail-modal");
  if (!modal) return;

  const product = window.BEESBEE_PRODUCTS[0];
  const sizeData = product.sizes.find(s => s.size === initialSize) || product.sizes[1];

  document.getElementById("modal-prod-title").textContent = product.name;
  document.getElementById("modal-prod-image").src = sizeData.image;
  document.getElementById("modal-prod-price").textContent = `₹${sizeData.price}`;
  document.getElementById("modal-prod-original").textContent = `₹${sizeData.originalPrice}`;
  document.getElementById("modal-prod-tagline").textContent = sizeData.tagline;

  const sizeContainer = document.getElementById("modal-size-pills");
  sizeContainer.innerHTML = product.sizes.map(s => `
    <button 
      type="button" 
      onclick="selectModalSize('${s.size}')"
      class="size-pill px-3 py-1.5 rounded-xl text-xs font-bold ${s.size === initialSize ? 'active' : 'bg-white text-stone-700'}">
      ${s.size} • ₹${s.price}
    </button>
  `).join("");

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  pushHistoryState({ modal: 'product-detail-modal' });
}

function selectModalSize(size) {
  currentModalSelectedSize = size;
  const product = window.BEESBEE_PRODUCTS[0];
  const sizeData = product.sizes.find(s => s.size === size);
  if (!sizeData) return;

  document.getElementById("modal-prod-image").src = sizeData.image;
  document.getElementById("modal-prod-price").textContent = `₹${sizeData.price}`;
  document.getElementById("modal-prod-original").textContent = `₹${sizeData.originalPrice}`;
  document.getElementById("modal-prod-tagline").textContent = sizeData.tagline;

  const pills = document.querySelectorAll("#modal-size-pills .size-pill");
  pills.forEach(pill => {
    if (pill.textContent.includes(size)) {
      pill.classList.add("active");
    } else {
      pill.classList.remove("active");
    }
  });
}

function closeProductDetailModal() {
  const modal = document.getElementById("product-detail-modal");
  if (modal) modal.classList.add("hidden");
  document.body.style.overflow = "";
}

function addModalItemToCart() {
  handleAddToCart(currentModalSelectedSize);
  closeProductDetailModal();
}

function orderModalItemDirect() {
  closeProductDetailModal();
  openDirectOrderModal(currentModalSelectedSize);
}

/**
 * Video Player Modal
 */
function openVideoPlayerModal() {
  const modal = document.getElementById("video-modal");
  const vid = window.BEESBEE_CONFIG.videos[0];
  if (!modal) return;

  const videoElement = document.getElementById("harvest-video-player");
  if (videoElement) {
    videoElement.src = vid.videoUrl;
    videoElement.play().catch(e => console.log("User interaction needed to play video:", e));
  }

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  pushHistoryState({ modal: 'video-modal' });
}

function closeVideoPlayerModal() {
  const modal = document.getElementById("video-modal");
  const videoElement = document.getElementById("harvest-video-player");
  if (videoElement) {
    videoElement.pause();
    videoElement.src = "";
  }
  if (modal) modal.classList.add("hidden");
  document.body.style.overflow = "";
}

/**
 * Our Story Modal
 */
function openOurStoryModal() {
  const modal = document.getElementById("story-modal");
  if (modal) {
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    pushHistoryState({ modal: 'story-modal' });
  }
}

function closeOurStoryModal() {
  const modal = document.getElementById("story-modal");
  if (modal) {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
  }
}

/**
 * Cart Drawer / Modal (Matching Image 2 ref_cart_screen.png)
 */
function openCartDrawer() {
  const drawer = document.getElementById("cart-drawer");
  if (!drawer) return;

  renderCartDrawerContents();
  drawer.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  pushHistoryState({ modal: 'cart-drawer' });
}

function closeCartDrawer() {
  const drawer = document.getElementById("cart-drawer");
  if (drawer) drawer.classList.add("hidden");
  document.body.style.overflow = "";
}

function renderCartDrawerContents() {
  const listContainer = document.getElementById("cart-items-list");
  const summary = window.cartManager.getSummary();
  const countDisplay = document.getElementById("cart-items-count-text");
  if (countDisplay) {
    countDisplay.textContent = `(${summary.totalCount} items)`;
  }

  if (summary.items.length === 0) {
    listContainer.innerHTML = `
      <div class="py-12 px-4 text-center">
        <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-3xl mb-3">
          🍯
        </div>
        <h4 class="font-bold text-stone-800 text-base">Your honey basket is empty</h4>
        <p class="text-xs text-stone-500 mt-1">Add our pure, cold-extracted honey bottles to get started.</p>
        <button onclick="closeCartDrawer(); scrollToProducts();" class="mt-4 forest-btn text-xs font-bold py-2.5 px-6 rounded-xl">
          Shop Pure Honey
        </button>
      </div>
    `;
    document.getElementById("cart-summary-section").classList.add("hidden");
    return;
  }

  document.getElementById("cart-summary-section").classList.remove("hidden");

  let html = summary.items.map(item => `
    <div class="flex items-center gap-3 p-3 bg-white rounded-2xl border border-stone-200 shadow-2xs">
      <img src="${item.image}" alt="${item.size}" class="w-14 h-16 object-contain bg-[#FAF7F2] rounded-xl p-1.5" />
      <div class="flex-1">
        <div class="flex justify-between items-start">
          <div>
            <h5 class="font-bold text-xs text-stone-900 leading-tight">BeesBee Pure Honey</h5>
            <div class="text-[11px] text-stone-500 font-medium">${item.size} | ${item.tagline}</div>
          </div>
          <button onclick="handleRemoveCartItem('${item.size}')" class="text-stone-400 hover:text-red-500 p-1 text-sm" aria-label="Remove item">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>

        <div class="flex items-center gap-2 mt-1 text-[10px] text-stone-500">
          <span>🍃 100% Natural</span>
          <span>•</span>
          <span>🛡️ Lab Tested</span>
        </div>

        <div class="flex items-center justify-between mt-2">
          <div class="flex items-baseline gap-1.5">
            <span class="text-sm font-extrabold text-stone-900">₹${item.price}</span>
            <span class="text-[10px] text-stone-400 line-through">₹${item.originalPrice}</span>
            <span class="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
              Save ₹${item.originalPrice - item.price}
            </span>
          </div>

          <!-- Real Stepper -->
          <div class="flex items-center border border-stone-200 rounded-lg bg-stone-50">
            <button onclick="handleCartQtyChange('${item.size}', ${item.quantity - 1})" class="px-2 py-0.5 text-xs text-stone-600 font-bold hover:bg-stone-200 rounded-l">-</button>
            <span class="px-2.5 py-0.5 text-xs font-bold text-stone-800">${item.quantity}</span>
            <button onclick="handleCartQtyChange('${item.size}', ${item.quantity + 1})" class="px-2 py-0.5 text-xs text-stone-600 font-bold hover:bg-stone-200 rounded-r">+</button>
          </div>
        </div>
      </div>
    </div>
  `).join("");

  // Show Free Gifts if 2kg is present
  if (summary.freeGifts.length > 0) {
    html += summary.freeGifts.map(g => `
      <div class="flex items-center gap-3 p-3 bg-emerald-50/90 rounded-2xl border border-emerald-200">
        <div class="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center text-xl">
          🎁
        </div>
        <div class="flex-1">
          <div class="text-xs font-bold text-emerald-950">${g.name} (${g.size})</div>
          <div class="text-[10px] text-emerald-700 font-medium">Free Family Combo Bonus Gift</div>
        </div>
        <span class="text-xs font-extrabold text-emerald-800 bg-white px-2 py-1 rounded-lg border border-emerald-200">FREE</span>
      </div>
    `).join("");
  }

  listContainer.innerHTML = html;

  // Update summary numbers
  document.getElementById("cart-subtotal-text").textContent = `₹${summary.subtotal}`;
  document.getElementById("cart-discount-text").textContent = `- ₹${summary.originalSubtotal - summary.subtotal}`;
  document.getElementById("cart-total-text").textContent = `₹${summary.finalTotal}`;
  document.getElementById("cart-savings-banner-text").textContent = `You are saving ₹${summary.savings} on this order! 🍃`;
}

function handleCartQtyChange(size, newQty) {
  window.cartManager.updateQuantity(size, newQty);
  renderCartDrawerContents();
  updateCartBadge();
}

function handleRemoveCartItem(size) {
  window.cartManager.removeItem(size);
  renderCartDrawerContents();
  updateCartBadge();
  showToast(`Removed from basket`, "info");
}

function scrollToProducts() {
  switchView('home');
  const target = document.getElementById("products-section");
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' });
  }
}

/**
 * Checkout & Direct WhatsApp Order Modal
 */
let directOrderProductContext = null;

function openDirectOrderModal(size = "2kg") {
  const product = window.BEESBEE_PRODUCTS[0];
  const sizeData = product.sizes.find(s => s.size === size);
  if (!sizeData) return;

  directOrderProductContext = {
    sizeData: sizeData,
    quantity: 1
  };

  openCheckoutModalUI();
}

function openCartCheckoutModal() {
  const summary = window.cartManager.getSummary();
  if (summary.items.length === 0) {
    showToast("Your honey basket is empty!", "error");
    return;
  }
  directOrderProductContext = null;
  closeCartDrawer();
  openCheckoutModalUI();
}

function openCheckoutModalUI() {
  const modal = document.getElementById("checkout-modal");
  if (!modal) return;

  const itemPreview = document.getElementById("checkout-order-preview");
  if (directOrderProductContext) {
    const s = directOrderProductContext.sizeData;
    itemPreview.innerHTML = `
      <div class="flex items-center gap-3 bg-[#FAF7F2] p-3 rounded-xl border border-stone-200">
        <img src="${s.image}" alt="${s.size}" class="w-12 h-14 object-contain bg-white rounded-lg p-1" />
        <div class="flex-1">
          <div class="text-xs font-bold text-stone-900">BeesBee Pure Natural Honey</div>
          <div class="text-[11px] font-semibold text-amber-800">Size: ${s.size}</div>
          ${s.size === '2kg' ? '<span class="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">Includes FREE 250g Jar 🎁</span>' : ''}
        </div>
        <div class="text-right">
          <div class="text-sm font-extrabold text-stone-900">₹${s.price}</div>
          <div class="text-[10px] text-emerald-700 font-bold">Free Delivery</div>
        </div>
      </div>
    `;
    document.getElementById("checkout-total-display").textContent = `₹${s.price}`;
  } else {
    const summary = window.cartManager.getSummary();
    itemPreview.innerHTML = `
      <div class="bg-[#FAF7F2] p-3 rounded-xl border border-stone-200">
        <div class="text-xs font-bold text-stone-900 mb-1">Items in your basket (${summary.totalCount}):</div>
        ${summary.items.map(i => `<div class="text-[11px] text-stone-600 flex justify-between"><span>• ${i.size} × ${i.quantity}</span><span>₹${i.price * i.quantity}</span></div>`).join("")}
        ${summary.freeGifts.length > 0 ? `<div class="text-[11px] text-emerald-700 font-bold mt-1">🎁 Included: FREE 250g Jar</div>` : ''}
      </div>
    `;
    document.getElementById("checkout-total-display").textContent = `₹${summary.finalTotal}`;
  }

  setupProfileData();

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  pushHistoryState({ modal: 'checkout-modal' });
}

function closeCheckoutModal() {
  const modal = document.getElementById("checkout-modal");
  if (modal) modal.classList.add("hidden");
  document.body.style.overflow = "";
}

/**
 * Capture Mandatory GPS Location
 */
function handleCaptureGPS() {
  const btn = document.getElementById("gps-action-btn");
  const statusBox = document.getElementById("gps-status-indicator");

  btn.disabled = true;
  btn.innerHTML = `
    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    Detecting Exact GPS...
  `;

  window.checkoutManager.captureGPSLocation(
    (location) => {
      btn.disabled = false;
      btn.classList.remove("bg-amber-600", "hover:bg-amber-700");
      btn.classList.add("bg-emerald-600", "hover:bg-emerald-700");
      btn.innerHTML = `
        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        GPS Location Verified ✓
      `;

      statusBox.classList.remove("hidden");
      statusBox.innerHTML = `
        <div class="flex items-start gap-2 text-xs text-emerald-900 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
          <span class="text-sm">📍</span>
          <div>
            <div class="font-bold">Location Captured (±${location.accuracy}m)</div>
            <div class="text-[11px] text-emerald-800 line-clamp-2">${location.displayAddress}</div>
            <a href="${location.mapsUrl}" target="_blank" class="text-[10px] text-emerald-700 underline font-bold mt-0.5 inline-block">
              View Google Maps Pin ↗
            </a>
          </div>
        </div>
      `;

      if (location.area && !document.getElementById("checkout-area").value) {
        document.getElementById("checkout-area").value = location.area;
      }
      if (location.city) {
        document.getElementById("checkout-city").value = location.city;
      }
      if (location.state) {
        document.getElementById("checkout-state").value = location.state;
      }
      if (location.pincode && !document.getElementById("checkout-pincode").value) {
        document.getElementById("checkout-pincode").value = location.pincode;
      }

      showToast("GPS Location confirmed! 📍", "success");
    },
    (errorMsg) => {
      btn.disabled = false;
      btn.innerHTML = `
        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        Get Current Location (GPS)
      `;
      showToast(errorMsg, "error");
    }
  );
}

/**
 * Handle Order Submission & WhatsApp Dispatch
 */
function handleSubmitOrder() {
  const customerName = document.getElementById("checkout-name").value;
  const customerPhone = document.getElementById("checkout-phone").value;
  const houseNo = document.getElementById("checkout-house").value;
  const area = document.getElementById("checkout-area").value;
  const landmark = document.getElementById("checkout-landmark").value;
  const city = document.getElementById("checkout-city").value;
  const state = document.getElementById("checkout-state").value;
  const pincode = document.getElementById("checkout-pincode").value;

  const formData = {
    customerName,
    customerPhone,
    houseNo,
    area,
    landmark,
    city,
    state,
    pincode
  };

  const result = window.checkoutManager.processOrder(formData, directOrderProductContext);

  if (!result.success) {
    showToast(result.errors[0], "error");
    return;
  }

  closeCheckoutModal();
  updateCartBadge();
  showToast("Opening WhatsApp to confirm order... 🐝", "success");

  setTimeout(() => {
    window.open(result.whatsappUrl, "_blank");
  }, 300);

  // Switch to orders view to see status
  setTimeout(() => {
    switchView('orders');
  }, 900);
}

/**
 * Render Orders List View
 */
function renderOrdersListView() {
  const container = document.getElementById("orders-view-list");
  if (!container) return;

  const orders = window.ordersManager.getOrders();

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="py-16 px-4 text-center bg-white rounded-3xl border border-stone-200">
        <div class="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-3xl mb-3">
          📦
        </div>
        <h4 class="font-bold text-stone-900 text-base">No orders yet</h4>
        <p class="text-xs text-stone-500 mt-1">Orders placed on WhatsApp will appear here with live tracking.</p>
        <button onclick="switchView('home')" class="mt-4 forest-btn text-xs font-bold py-2.5 px-6 rounded-xl">
          Explore Pure Honey
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = orders.map(order => {
    const step = window.ordersManager.getOrderStep(order.status);
    const dateFormatted = new Date(order.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });

    return `
      <div class="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm mb-3">
        <div class="flex justify-between items-start border-b border-stone-100 pb-2.5">
          <div>
            <span class="text-xs font-bold font-mono text-[#D97706] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              ${order.orderId}
            </span>
            <div class="text-[11px] text-stone-400 mt-1">${dateFormatted}</div>
          </div>
          <span class="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
            ${order.status}
          </span>
        </div>

        <!-- 5-Step Stepper -->
        <div class="my-4">
          <div class="flex items-center justify-between relative">
            <div class="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-1 bg-stone-200 -z-0"></div>
            <div class="absolute left-3 top-1/2 -translate-y-1/2 h-1 bg-emerald-600 -z-0 transition-all duration-500" style="width: ${(step - 1) * 25}%"></div>

            <div class="relative z-10 flex flex-col items-center">
              <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 1 ? 'bg-emerald-600 text-white' : 'bg-stone-300 text-stone-600'}">1</div>
              <span class="text-[9px] font-bold text-stone-600 mt-1">Placed</span>
            </div>
            <div class="relative z-10 flex flex-col items-center">
              <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 2 ? 'bg-emerald-600 text-white' : 'bg-stone-300 text-stone-600'}">2</div>
              <span class="text-[9px] font-bold text-stone-600 mt-1">Confirmed</span>
            </div>
            <div class="relative z-10 flex flex-col items-center">
              <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 3 ? 'bg-emerald-600 text-white' : 'bg-stone-300 text-stone-600'}">3</div>
              <span class="text-[9px] font-bold text-stone-600 mt-1">Preparing</span>
            </div>
            <div class="relative z-10 flex flex-col items-center">
              <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 4 ? 'bg-emerald-600 text-white' : 'bg-stone-300 text-stone-600'}">4</div>
              <span class="text-[9px] font-bold text-stone-600 mt-1">Delivery</span>
            </div>
            <div class="relative z-10 flex flex-col items-center">
              <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 5 ? 'bg-emerald-600 text-white' : 'bg-stone-300 text-stone-600'}">5</div>
              <span class="text-[9px] font-bold text-stone-600 mt-1">Enjoy</span>
            </div>
          </div>
        </div>

        <div class="text-xs text-stone-700 bg-[#FAF7F2] p-2.5 rounded-xl border border-stone-100">
          ${order.items.map(i => `<div class="flex justify-between"><span>• Pure Honey (${i.size}) × ${i.quantity}</span><span class="font-bold">₹${i.subtotal}</span></div>`).join("")}
          ${order.freeGifts.length > 0 ? `<div class="text-emerald-700 font-bold mt-1 text-[11px]">🎁 FREE: 250g Bonus Jar</div>` : ''}
          <div class="border-t border-stone-200 mt-2 pt-1 flex justify-between font-bold text-stone-900">
            <span>Total Payable:</span>
            <span>₹${order.totalAmount}</span>
          </div>
        </div>

        <div class="mt-3">
          <a 
            href="${window.ordersManager.getWhatsAppInquiryUrl(order.orderId)}" 
            target="_blank"
            class="w-full text-center bg-[#25D366]/10 text-emerald-800 hover:bg-[#25D366]/20 font-bold text-xs py-2.5 px-3 rounded-xl border border-emerald-300 transition-all flex items-center justify-center gap-1.5">
            <span>Inquire Status on WhatsApp</span>
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.974.57 1.942.87 3.027.87 3.18 0 5.767-2.587 5.767-5.766.001-3.182-2.586-5.766-5.768-5.766z"/></svg>
          </a>
        </div>
      </div>
    `;
  }).join("");
}

function handleSearchOrderById() {
  const input = document.getElementById("order-id-search-input");
  if (!input) return;
  const id = input.value.trim();
  if (!id) {
    showToast("Please enter an Order ID", "error");
    return;
  }
  const order = window.ordersManager.getOrderById(id);
  const container = document.getElementById("orders-view-list");
  if (!order) {
    showToast(`Order "${id}" not found on this device`, "error");
    return;
  }
  container.innerHTML = `
    <div class="mb-4">
      <button onclick="renderOrdersListView()" class="text-xs font-bold text-amber-700 hover:underline">
        ← Back to All Orders
      </button>
    </div>
  `;
  container.innerHTML += order ? [order].map(o => `
    <div class="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm">
      <div class="flex justify-between items-start border-b pb-2">
        <span class="font-mono font-bold text-amber-800">${o.orderId}</span>
        <span class="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">${o.status}</span>
      </div>
      <div class="text-xs mt-3 text-stone-700">
        <div>Customer: ${o.customer.name} (${o.customer.phone})</div>
        <div>Address: ${o.address.houseNo}, ${o.address.area}</div>
      </div>
    </div>
  `).join("") : '';
}

/**
 * Pre-fill profile fields
 */
function setupProfileData() {
  const profile = window.checkoutManager.getSavedProfile();
  if (!profile) return;

  const nameInput = document.getElementById("checkout-name");
  const phoneInput = document.getElementById("checkout-phone");
  const houseInput = document.getElementById("checkout-house");
  const areaInput = document.getElementById("checkout-area");
  const landmarkInput = document.getElementById("checkout-landmark");

  if (nameInput && !nameInput.value) nameInput.value = profile.name || "";
  if (phoneInput && !phoneInput.value) phoneInput.value = profile.phone || "";
  if (houseInput && !houseInput.value) houseInput.value = profile.houseNo || "";
  if (areaInput && !areaInput.value) areaInput.value = profile.area || "";
  if (landmarkInput && !landmarkInput.value) landmarkInput.value = profile.landmark || "";

  // Update Profile View display
  const pName = document.getElementById("profile-display-name");
  const pPhone = document.getElementById("profile-display-phone");
  const pAddr = document.getElementById("profile-display-address");
  if (pName && profile.name) pName.textContent = profile.name;
  if (pPhone && profile.phone) pPhone.textContent = profile.phone;
  if (pAddr && profile.houseNo) pAddr.textContent = `${profile.houseNo}, ${profile.area}`;
}

function saveProfileViewData() {
  const name = document.getElementById("profile-edit-name").value.trim();
  const phone = document.getElementById("profile-edit-phone").value.trim();
  const address = document.getElementById("profile-edit-address").value.trim();

  if (!name || !phone) {
    showToast("Please enter your name and phone number", "error");
    return;
  }

  window.checkoutManager.saveUserProfile({
    name: name,
    phone: phone,
    houseNo: address,
    area: "",
    landmark: ""
  });

  setupProfileData();
  showToast("Profile details saved! 🍯", "success");
}

/**
 * Mobile Sidebar Drawer Navigation
 */
function openSidebar() {
  const sidebar = document.getElementById("mobile-sidebar");
  const backdrop = document.getElementById("mobile-sidebar-backdrop");
  const panel = document.getElementById("mobile-sidebar-panel");
  if (!sidebar || !backdrop || !panel) return;

  sidebar.classList.remove("pointer-events-none");
  backdrop.classList.remove("opacity-0", "pointer-events-none");
  backdrop.classList.add("opacity-100", "pointer-events-auto");
  panel.classList.remove("-translate-x-full");
  panel.classList.add("translate-x-0");
  document.body.style.overflow = "hidden";
  pushHistoryState({ modal: 'mobile-sidebar' });
}

function closeSidebar() {
  const sidebar = document.getElementById("mobile-sidebar");
  const backdrop = document.getElementById("mobile-sidebar-backdrop");
  const panel = document.getElementById("mobile-sidebar-panel");
  if (panel) {
    panel.classList.remove("translate-x-0");
    panel.classList.add("-translate-x-full");
  }
  if (backdrop) {
    backdrop.classList.remove("opacity-100", "pointer-events-auto");
    backdrop.classList.add("opacity-0", "pointer-events-none");
  }
  if (sidebar) {
    setTimeout(() => {
      sidebar.classList.add("pointer-events-none");
    }, 320);
  }
  document.body.style.overflow = "";
}

/**
 * Search Modal
 */
function openSearchModal() {
  const modal = document.getElementById("search-modal");
  if (modal) {
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    pushHistoryState({ modal: 'search-modal' });
    const input = document.getElementById("search-input");
    if (input) setTimeout(() => input.focus(), 100);
  }
}

function closeSearchModal() {
  const modal = document.getElementById("search-modal");
  if (modal) modal.classList.add("hidden");
  document.body.style.overflow = "";
}

function handleSearchInput(event) {
  const query = event.target.value.toLowerCase().trim();
  const resultsContainer = document.getElementById("search-results");
  if (!resultsContainer) return;

  if (!query) {
    resultsContainer.innerHTML = `
      <div class="text-center py-8 text-stone-400 text-xs">
        Try searching: "250g", "500g", "1kg", "2kg", "raw", "combo"
      </div>
    `;
    return;
  }

  const product = window.BEESBEE_PRODUCTS[0];
  const matched = product.sizes.filter(s => 
    s.size.toLowerCase().includes(query) || 
    s.tagline.toLowerCase().includes(query) || 
    "natural honey raw".includes(query)
  );

  if (matched.length === 0) {
    resultsContainer.innerHTML = `
      <div class="text-center py-8 text-stone-500 text-xs">
        No honey jars found matching "${query}".
      </div>
    `;
    return;
  }

  resultsContainer.innerHTML = matched.map(s => `
    <div class="flex items-center justify-between p-3 bg-white rounded-xl border border-stone-200 hover:border-amber-400 cursor-pointer transition-all" onclick="closeSearchModal(); openProductDetailModal('${s.size}')">
      <div class="flex items-center gap-3">
        <img src="${s.image}" alt="${s.size}" class="w-10 h-10 object-contain" />
        <div>
          <div class="font-bold text-xs text-stone-900">${product.name} (${s.size})</div>
          <div class="text-[11px] text-stone-500">${s.tagline}</div>
        </div>
      </div>
      <div class="text-right">
        <div class="text-xs font-bold text-[#D97706]">₹${s.price}</div>
        <span class="text-[10px] text-stone-400 line-through">₹${s.originalPrice}</span>
      </div>
    </div>
  `).join("");
}

/**
 * Notifications & Announcements Modal
 */
function openNotificationsModal() {
  const modal = document.getElementById("notifications-modal");
  if (!modal) return;

  const container = document.getElementById("notifications-list");
  const announcements = window.BEESBEE_CONFIG.announcements;

  container.innerHTML = announcements.map(a => `
    <div class="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl mb-2.5">
      <div class="flex justify-between items-start">
        <h5 class="text-xs font-bold text-stone-900">${a.title}</h5>
        ${a.isNew ? '<span class="text-[9px] bg-red-500 text-white font-bold px-1.5 py-0.5 rounded">NEW</span>' : ''}
      </div>
      <p class="text-xs text-stone-600 mt-1 leading-relaxed">${a.message}</p>
      <span class="text-[10px] text-stone-400 block mt-2">${a.date}</span>
    </div>
  `).join("");

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  pushHistoryState({ modal: 'notifications-modal' });
}

function closeNotificationsModal() {
  const modal = document.getElementById("notifications-modal");
  if (modal) modal.classList.add("hidden");
  document.body.style.overflow = "";
}

/**
 * Wishlist Modal
 */
function openWishlistModal() {
  const modal = document.getElementById("wishlist-modal");
  if (modal) {
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    pushHistoryState({ modal: 'wishlist-modal' });
  }
}

function closeWishlistModal() {
  const modal = document.getElementById("wishlist-modal");
  if (modal) modal.classList.add("hidden");
  document.body.style.overflow = "";
}

/**
 * Addresses Modal
 */
function openAddressesModal() {
  const modal = document.getElementById("addresses-modal");
  if (modal) {
    const profile = window.checkoutManager.getSavedProfile();
    const nameEl = document.getElementById("saved-address-name-display");
    const addrEl = document.getElementById("saved-address-details-display");
    if (profile && profile.name) {
      if (nameEl) nameEl.textContent = profile.name;
      if (addrEl && profile.houseNo) addrEl.textContent = `${profile.houseNo}, ${profile.area || ''}`;
    }
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    pushHistoryState({ modal: 'addresses-modal' });
  }
}

function closeAddressesModal() {
  const modal = document.getElementById("addresses-modal");
  if (modal) modal.classList.add("hidden");
  document.body.style.overflow = "";
}

/**
 * Rewards Modal
 */
function openRewardsModal() {
  const modal = document.getElementById("rewards-modal");
  if (modal) {
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    pushHistoryState({ modal: 'rewards-modal' });
  }
}

function closeRewardsModal() {
  const modal = document.getElementById("rewards-modal");
  if (modal) modal.classList.add("hidden");
  document.body.style.overflow = "";
}

/**
 * Referral Sharing Handler
 */
function shareReferral() {
  const text = "Discover 100% Pure Raw Honey straight from untouched forest hives at BeesBee! Order on WhatsApp: " + window.location.href;
  if (navigator.share) {
    navigator.share({
      title: "BeesBee — Pure Honey",
      text: text,
      url: window.location.href
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => {
      showToast("Referral link copied! Share with friends & family 🌿", "success");
    }).catch(() => {
      showToast("Share BeesBee with code WELCOME100 for ₹100 OFF!", "info");
    });
  }
}

/**
 * Logout Handler
 */
function handleLogout() {
  closeSidebar();
  showToast("Guest session active. Ready to order pure honey! 🍯", "info");
}

/**
 * Coupon Code Handler
 */
function copyCouponCode(code) {
  navigator.clipboard.writeText(code).then(() => {
    showToast(`Coupon code "${code}" copied! Paste on WhatsApp`, "success");
  }).catch(() => {
    showToast(`Use coupon code: ${code}`, "info");
  });
}

/**
 * Setup Global UI Event Listeners
 */
function setupEventListeners() {
  window.addEventListener("beesbee:cart-updated", () => {
    updateCartBadge();
  });

  window.addEventListener("beesbee:orders-updated", () => {
    renderOrdersListView();
  });
}
