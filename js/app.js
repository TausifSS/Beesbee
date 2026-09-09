/**
 * BEESBEE - Main Application UI Orchestrator
 * Pure Natural Honey Storefront & Multi-Page Manager
 */

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  setupNavbarActiveState();
  updateCartBadge();
  setupEventListeners();

  // Page-specific initializations
  if (document.getElementById("products-grid")) {
    renderProductCards();
  }
  if (document.getElementById("offers-container")) {
    renderSpecialOffers();
  }
  if (document.getElementById("video-showcase-container")) {
    renderVideoSection();
  }
  if (document.getElementById("dedicated-orders-list")) {
    renderDedicatedOrdersPage();
  }
  if (document.getElementById("dedicated-offers-list")) {
    renderDedicatedOffersPage();
  }
  if (document.getElementById("dedicated-harvest-container")) {
    renderDedicatedHarvestPage();
  }

  setupProfileData();
}

/**
 * Highlight active navbar link based on current page filename
 */
function setupNavbarActiveState() {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".nav-link");
  
  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (href === currentPath || (currentPath === "" && href === "index.html") || (currentPath === "index.html" && href === "index.html")) {
      link.classList.add("text-[#D97706]", "font-extrabold");
      link.classList.remove("text-stone-700");
    }
  });

  // Highlight bottom nav active tab
  const bottomNavItems = document.querySelectorAll(".bottom-nav-item");
  bottomNavItems.forEach(item => {
    const page = item.getAttribute("data-page");
    if (page && currentPath.includes(page)) {
      item.classList.add("text-[#D97706]");
      item.classList.remove("text-stone-600");
    }
  });
}

/**
 * Global Toast Utility
 */
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  
  let icon = "🍯";
  if (type === "success") icon = "✅";
  if (type === "error") icon = "⚠️";
  if (type === "gps") icon = "📍";

  toast.innerHTML = `
    <span class="text-lg">${icon}</span>
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
      <div class="relative bg-[#FBF9F4] rounded-xl p-3 flex items-center justify-center min-h-[160px] overflow-hidden cursor-pointer" onclick="openProductDetailModal('${item.size}')">
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
        <span class="absolute top-2 right-2 bg-amber-100 text-[#92400E] text-[10px] font-bold px-1.5 py-0.5 rounded-md">
          ${item.discountPercent}% OFF
        </span>

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
        <!-- Size Tag -->
        <div class="flex items-center justify-center">
          <span class="bg-[#B45309] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm tracking-wide">
            ${item.size}
          </span>
        </div>

        <p class="text-[12px] text-stone-600 text-center font-medium mt-2 line-clamp-1">
          ${item.tagline}
        </p>

        <!-- Pricing -->
        <div class="flex items-baseline justify-center gap-1.5 mt-2">
          <span class="text-xl font-extrabold text-[#2B1810]">₹${item.price}</span>
          <span class="text-xs text-stone-400 line-through">₹${item.originalPrice}</span>
        </div>

        ${item.specialOfferText ? `
          <div class="mt-1 text-center">
            <span class="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              🎁 ${item.specialOfferText}
            </span>
          </div>
        ` : ''}

        <!-- Actions -->
        <div class="mt-4 flex flex-col gap-2">
          <button 
            type="button" 
            onclick="handleAddToCart('${item.size}')"
            class="w-full honey-gradient-btn font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            Add to Cart
          </button>
          
          <button 
            type="button" 
            onclick="openDirectOrderModal('${item.size}')"
            class="w-full bg-[#1B4332] text-white hover:bg-[#122e22] font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1 transition-all">
            <span>Order Now</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

/**
 * Render Special Offer Carousel / Banners on Home
 */
function renderSpecialOffers() {
  const container = document.getElementById("offers-container");
  if (!container) return;

  container.innerHTML = `
    <!-- Main 2kg Hero Offer -->
    <div class="bg-gradient-to-r from-[#1B3B28] via-[#244A34] to-[#1B3B28] rounded-2xl p-4 sm:p-5 text-white shadow-lg relative overflow-hidden border border-emerald-800">
      <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-500/10 rounded-full blur-xl pointer-events-none"></div>

      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex-1 text-center sm:text-left">
          <div class="inline-block bg-amber-400 text-stone-900 font-extrabold text-[10px] tracking-wider px-2.5 py-0.5 rounded-full uppercase mb-2">
            SPECIAL COMBO OFFER
          </div>
          <h3 class="text-xl sm:text-2xl font-bold font-serif-brand text-amber-200">
            Buy 2kg Get 250g FREE!
          </h3>
          <p class="text-xs text-emerald-100/90 mt-1 font-medium">
            More Honey. More Health. 100% Raw Forest Harvest with sterile glass packaging.
          </p>

          <div class="mt-3 flex items-center justify-center sm:justify-start gap-2">
            <span class="text-xs bg-black/30 border border-white/20 px-2 py-1 rounded-md text-amber-300 font-bold">
              ⚡ Limited Period Deal
            </span>
            <span class="text-xs text-emerald-200">
              Save ₹199 Instant
            </span>
          </div>
        </div>

        <div class="flex flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
          <button 
            type="button" 
            onclick="openDirectOrderModal('2kg')"
            class="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-sm py-2.5 px-6 rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all">
            <span>Claim Offer on WhatsApp</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </button>
          <a href="offers.html" class="text-xs text-amber-300 hover:underline font-semibold mt-1">
            View All Combo Packs ➔
          </a>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render Dedicated Offers Page
 */
function renderDedicatedOffersPage() {
  const container = document.getElementById("dedicated-offers-list");
  if (!container) return;

  container.innerHTML = `
    <!-- Offer 1: Family Combo -->
    <div class="bg-white rounded-3xl p-6 border border-stone-200 honey-card-shadow flex flex-col md:flex-row items-center gap-6">
      <div class="w-full md:w-1/3 bg-[#FAF7F2] rounded-2xl p-4 flex items-center justify-center">
        <img src="assets/images/offer_banner.png" alt="Buy 2kg Get 250g Free" class="w-full max-h-56 object-contain rounded-xl" />
      </div>
      <div class="flex-1 text-center md:text-left">
        <span class="bg-amber-100 text-[#92400E] font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
          🔥 Most Popular Family Offer
        </span>
        <h3 class="text-2xl font-bold font-heading text-stone-900 mt-2">
          Family Honey Pack (2kg + 250g FREE)
        </h3>
        <p class="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
          Order our largest 2kg Pure Forest Honey jar and receive an authentic 250g travel/desk jar completely FREE. Perfect for daily family breakfast and herbal teas.
        </p>

        <div class="flex items-baseline justify-center md:justify-start gap-3 mt-4">
          <span class="text-3xl font-extrabold text-[#D97706]">₹1,199</span>
          <span class="text-base text-stone-400 line-through">₹1,748</span>
          <span class="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md">Save ₹549 Total</span>
        </div>

        <div class="mt-5 flex flex-col sm:flex-row gap-3">
          <button onclick="openDirectOrderModal('2kg')" class="honey-gradient-btn font-bold text-xs py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md">
            <span>Order Family Combo on WhatsApp</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </button>
          <button onclick="handleAddToCart('2kg')" class="bg-white border border-stone-300 text-stone-800 font-bold text-xs py-3 px-5 rounded-xl hover:bg-stone-50 transition-colors">
            Add Combo to Cart
          </button>
        </div>
      </div>
    </div>

    <!-- Offer 2: Wellness Duo -->
    <div class="bg-white rounded-3xl p-6 border border-stone-200 honey-card-shadow flex flex-col md:flex-row items-center gap-6 mt-6">
      <div class="w-full md:w-1/3 bg-[#FAF7F2] rounded-2xl p-4 flex items-center justify-center">
        <img src="assets/images/four_jars_full.jpg" alt="Wellness Duo" class="w-full max-h-56 object-contain rounded-xl" />
      </div>
      <div class="flex-1 text-center md:text-left">
        <span class="bg-emerald-100 text-emerald-900 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
          🍃 Daily Immunity Pack
        </span>
        <h3 class="text-2xl font-bold font-heading text-stone-900 mt-2">
          Wellness Duo (1kg Kitchen Jar + 500g Wellness Jar)
        </h3>
        <p class="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
          Keep one large jar in the kitchen for cooking and daily lemon honey warm water, and one convenient 500g jar for your work desk.
        </p>

        <div class="flex items-baseline justify-center md:justify-start gap-3 mt-4">
          <span class="text-3xl font-extrabold text-[#D97706]">₹899</span>
          <span class="text-base text-stone-400 line-through">₹1,228</span>
          <span class="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md">Save ₹329</span>
        </div>

        <div class="mt-5 flex flex-col sm:flex-row gap-3">
          <button onclick="openDirectOrderModal('1kg')" class="honey-gradient-btn font-bold text-xs py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md">
            <span>Order Wellness Duo on WhatsApp</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
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
    <div class="bg-gradient-to-br from-[#FAF5EC] to-[#F3ECE0] rounded-3xl p-5 border border-[#E9E0D2] shadow-sm">
      <div class="flex items-center justify-between mb-3">
        <div>
          <span class="text-[11px] font-bold tracking-wider text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full uppercase">
            From Hive to Home
          </span>
          <h3 class="text-lg sm:text-xl font-bold font-heading text-[#2B1810] mt-1">
            See Where Your Honey Comes From
          </h3>
        </div>
        <a href="harvest.html" class="text-xs font-bold text-amber-800 hover:underline">
          Full Story ➔
        </a>
      </div>

      <!-- Video Preview Card -->
      <div class="relative rounded-2xl overflow-hidden bg-stone-900 group shadow-md aspect-video max-h-[280px] flex items-center justify-center cursor-pointer" onclick="openVideoPlayerModal()">
        <img 
          src="${vid.poster}" 
          alt="${vid.title}" 
          class="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-4">
          <div class="flex justify-between items-center">
            <span class="bg-emerald-900/90 text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-sm">
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

      <!-- Trust Badges Under Video -->
      <div class="grid grid-cols-4 gap-2 mt-4 text-center">
        <div class="p-2 bg-white/70 rounded-xl border border-stone-200/50">
          <div class="text-base sm:text-lg">🌿</div>
          <div class="text-[10px] font-bold text-stone-800 mt-0.5">100% Natural</div>
        </div>
        <div class="p-2 bg-white/70 rounded-xl border border-stone-200/50">
          <div class="text-base sm:text-lg">🚫</div>
          <div class="text-[10px] font-bold text-stone-800 mt-0.5">No Sugar</div>
        </div>
        <div class="p-2 bg-white/70 rounded-xl border border-stone-200/50">
          <div class="text-base sm:text-lg">🧪</div>
          <div class="text-[10px] font-bold text-stone-800 mt-0.5">No Preservatives</div>
        </div>
        <div class="p-2 bg-white/70 rounded-xl border border-stone-200/50">
          <div class="text-base sm:text-lg">❤️</div>
          <div class="text-[10px] font-bold text-stone-800 mt-0.5">Rich Nutrients</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render Dedicated Behind the Honey Page
 */
function renderDedicatedHarvestPage() {
  const container = document.getElementById("dedicated-harvest-container");
  if (!container) return;

  container.innerHTML = `
    <div class="space-y-8">
      <!-- Step 1 -->
      <div class="bg-white rounded-3xl p-6 border border-stone-200 honey-card-shadow flex flex-col md:flex-row items-center gap-6">
        <div class="w-full md:w-1/2 aspect-video bg-stone-900 rounded-2xl overflow-hidden relative cursor-pointer group" onclick="openVideoPlayerModal()">
          <img src="assets/images/video_banner.png" alt="Harvesting" class="w-full h-full object-cover group-hover:scale-105 transition-all" />
          <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div class="w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center text-stone-900 shadow-xl group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
        </div>
        <div class="flex-1">
          <span class="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase">Step 01</span>
          <h3 class="text-xl font-bold font-heading text-stone-900 mt-2">Ethical Colony Harvesting</h3>
          <p class="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
            Our traditional tribal harvesters never destroy hives or harm bee colonies. We carefully collect only the outer surplus honeycomb caps, leaving the queen and brood healthy and well-nourished.
          </p>
        </div>
      </div>

      <!-- Step 2 -->
      <div class="bg-white rounded-3xl p-6 border border-stone-200 honey-card-shadow flex flex-col md:flex-row-reverse items-center gap-6">
        <div class="w-full md:w-1/2 aspect-video bg-stone-900 rounded-2xl overflow-hidden relative cursor-pointer group" onclick="openVideoPlayerModal()">
          <img src="assets/images/hero_jar.png" alt="Cold Extraction" class="w-full h-full object-cover group-hover:scale-105 transition-all" />
          <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div class="w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center text-stone-900 shadow-xl group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
        </div>
        <div class="flex-1">
          <span class="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full uppercase">Step 02</span>
          <h3 class="text-xl font-bold font-heading text-stone-900 mt-2">Zero-Heat Cold Filtration</h3>
          <p class="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
            Commercial honey is pasteurized at high heat, destroying valuable enzymes and natural aromatics. BeesBee uses gentle gravity straining through organic cotton mesh to remove wax fragments while preserving 100% of bee propolis and wild floral pollens.
          </p>
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
 * Update Cart Badge Count across header & bottom nav
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
    videoElement.play().catch(e => console.log("Video autoplay caught:", e));
  }

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
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
 * Cart Drawer / Modal
 */
function openCartDrawer() {
  const drawer = document.getElementById("cart-drawer");
  if (!drawer) return;

  renderCartDrawerContents();
  drawer.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeCartDrawer() {
  const drawer = document.getElementById("cart-drawer");
  if (drawer) drawer.classList.add("hidden");
  document.body.style.overflow = "";
}

function renderCartDrawerContents() {
  const listContainer = document.getElementById("cart-items-list");
  const summary = window.cartManager.getSummary();

  if (summary.items.length === 0) {
    listContainer.innerHTML = `
      <div class="py-12 px-4 text-center">
        <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-3xl mb-3">
          🍯
        </div>
        <h4 class="font-bold text-stone-800 text-base">Your honey basket is empty</h4>
        <p class="text-xs text-stone-500 mt-1">Add our pure, cold-extracted honey bottles to get started.</p>
        <button onclick="closeCartDrawer(); window.location.href='shop.html'" class="mt-4 honey-gradient-btn text-xs font-bold py-2 px-5 rounded-xl">
          Shop Honey Now
        </button>
      </div>
    `;
    document.getElementById("cart-summary-section").classList.add("hidden");
    return;
  }

  document.getElementById("cart-summary-section").classList.remove("hidden");

  let html = summary.items.map(item => `
    <div class="flex items-center gap-3 p-3 bg-[#FAF7F2] rounded-xl border border-stone-200/70">
      <img src="${item.image}" alt="${item.size}" class="w-12 h-14 object-contain bg-white rounded-lg p-1" />
      <div class="flex-1">
        <div class="flex justify-between items-start">
          <h5 class="font-bold text-xs text-stone-900 leading-tight">BeesBee Pure Honey</h5>
          <button onclick="handleRemoveCartItem('${item.size}')" class="text-stone-400 hover:text-red-500 text-xs">
            ✕
          </button>
        </div>
        <div class="text-[11px] font-semibold text-amber-800">Size: ${item.size}</div>
        <div class="text-xs font-extrabold text-stone-900 mt-1">₹${item.price}</div>
      </div>

      <div class="flex items-center border border-stone-300 rounded-lg bg-white">
        <button onclick="handleCartQtyChange('${item.size}', ${item.quantity - 1})" class="px-2 py-0.5 text-xs text-stone-600 font-bold hover:bg-stone-100">-</button>
        <span class="px-2 py-0.5 text-xs font-bold text-stone-800">${item.quantity}</span>
        <button onclick="handleCartQtyChange('${item.size}', ${item.quantity + 1})" class="px-2 py-0.5 text-xs text-stone-600 font-bold hover:bg-stone-100">+</button>
      </div>
    </div>
  `).join("");

  if (summary.freeGifts.length > 0) {
    html += summary.freeGifts.map(g => `
      <div class="flex items-center gap-3 p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
        <div class="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-lg flex items-center justify-center text-base font-bold">🎁</div>
        <div class="flex-1">
          <div class="text-[11px] font-bold text-emerald-900">${g.name} (${g.size})</div>
          <div class="text-[10px] text-emerald-700 font-medium">Free Family Combo Special Gift</div>
        </div>
        <span class="text-xs font-extrabold text-emerald-700">FREE</span>
      </div>
    `).join("");
  }

  listContainer.innerHTML = html;

  document.getElementById("cart-subtotal-text").textContent = `₹${summary.subtotal}`;
  document.getElementById("cart-savings-text").textContent = `₹${summary.savings}`;
  document.getElementById("cart-total-text").textContent = `₹${summary.finalTotal}`;
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

  // If on orders page, refresh list; otherwise open drawer or redirect
  if (document.getElementById("dedicated-orders-list")) {
    renderDedicatedOrdersPage();
  } else {
    setTimeout(() => {
      openOrdersDrawer();
    }, 1000);
  }
}

/**
 * Orders Tracker Drawer & Dedicated Page
 */
function openOrdersDrawer() {
  const drawer = document.getElementById("orders-drawer");
  if (!drawer) {
    window.location.href = "orders.html";
    return;
  }

  renderOrdersList();
  drawer.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeOrdersDrawer() {
  const drawer = document.getElementById("orders-drawer");
  if (drawer) drawer.classList.add("hidden");
  document.body.style.overflow = "";
}

function renderOrdersList() {
  const container = document.getElementById("orders-list-container");
  if (!container) return;
  const orders = window.ordersManager.getOrders();
  renderOrdersMarkup(container, orders);
}

function renderDedicatedOrdersPage() {
  const container = document.getElementById("dedicated-orders-list");
  if (!container) return;
  const orders = window.ordersManager.getOrders();
  renderOrdersMarkup(container, orders);
}

function renderOrdersMarkup(container, orders) {
  if (orders.length === 0) {
    container.innerHTML = `
      <div class="py-12 px-4 text-center">
        <div class="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-3xl mb-3">
          📦
        </div>
        <h4 class="font-bold text-stone-800 text-base">No orders yet</h4>
        <p class="text-xs text-stone-500 mt-1">When you place an order on WhatsApp, it will be tracked here.</p>
        <a href="shop.html" class="mt-4 honey-gradient-btn text-xs font-bold py-2 px-5 rounded-xl inline-block">
          Explore Pure Honey
        </a>
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
            class="w-full text-center bg-[#25D366]/10 text-emerald-800 hover:bg-[#25D366]/20 font-bold text-xs py-2 px-3 rounded-xl border border-emerald-300 transition-all flex items-center justify-center gap-1.5">
            <span>Check Status on WhatsApp</span>
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
  const container = document.getElementById("dedicated-orders-list") || document.getElementById("orders-list-container");
  if (!order) {
    showToast(`Order "${id}" not found on this device`, "error");
    return;
  }
  renderOrdersMarkup(container, [order]);
}

/**
 * Pre-fill profile fields if previously saved
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
}

/**
 * Mobile Sidebar Drawer Navigation
 */
function openSidebar() {
  const sidebar = document.getElementById("mobile-sidebar");
  if (sidebar) sidebar.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeSidebar() {
  const sidebar = document.getElementById("mobile-sidebar");
  if (sidebar) sidebar.classList.add("hidden");
  document.body.style.overflow = "";
}

/**
 * Search Modal
 */
function openSearchModal() {
  const modal = document.getElementById("search-modal");
  if (modal) {
    modal.classList.remove("hidden");
    const input = document.getElementById("search-input");
    if (input) setTimeout(() => input.focus(), 100);
  }
}

function closeSearchModal() {
  const modal = document.getElementById("search-modal");
  if (modal) modal.classList.add("hidden");
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
}

function closeNotificationsModal() {
  const modal = document.getElementById("notifications-modal");
  if (modal) modal.classList.add("hidden");
  document.body.style.overflow = "";
}

/**
 * Setup Global UI Event Listeners
 */
function setupEventListeners() {
  window.addEventListener("beesbee:cart-updated", () => {
    updateCartBadge();
  });

  window.addEventListener("beesbee:orders-updated", () => {
    renderOrdersList();
    renderDedicatedOrdersPage();
  });
}
