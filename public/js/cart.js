/**
 * BEESBEE - Guest Cart Management
 * Persisted in localStorage with auto offer and free gift detection
 */

class CartManager {
  constructor() {
    this.storageKey = "beesbee_guest_cart";
    this.cart = this.loadCart();
  }

  loadCart() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn("Could not load cart from localStorage", e);
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.cart));
      window.dispatchEvent(new CustomEvent("beesbee:cart-updated", { detail: this.getSummary() }));
    } catch (e) {
      console.error("Failed to save cart", e);
    }
  }

  /**
   * Add a bottle size to cart
   * @param {string} size - e.g. "250g", "500g", "1kg", "2kg"
   * @param {number} quantity - default 1
   * @param {object} customData - optional custom overrides
   */
  addItem(size, quantity = 1, customData = null) {
    const product = window.BEESBEE_PRODUCTS[0];
    const sizeData = product.sizes.find(s => s.size === size);
    if (!sizeData) return false;

    const existingIndex = this.cart.findIndex(item => item.size === size && !item.isFreeGift);
    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += quantity;
    } else {
      this.cart.push({
        id: `honey-${size}`,
        name: product.name,
        size: size,
        price: sizeData.price,
        originalPrice: sizeData.originalPrice,
        image: sizeData.image,
        quantity: quantity,
        isFreeGift: false,
        tagline: sizeData.tagline
      });
    }

    this.saveCart();
    return true;
  }

  updateQuantity(size, newQty) {
    if (newQty <= 0) {
      this.removeItem(size);
      return;
    }

    const item = this.cart.find(i => i.size === size && !i.isFreeGift);
    if (item) {
      item.quantity = Math.min(10, Math.max(1, newQty));
      this.saveCart();
    }
  }

  removeItem(size) {
    this.cart = this.cart.filter(item => !(item.size === size && !item.isFreeGift));
    this.saveCart();
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
  }

  /**
   * Calculates cart totals, discounts, free shipping and special promotional rewards
   */
  getSummary() {
    let subtotal = 0;
    let totalItems = 0;
    let originalSubtotal = 0;
    let has2kg = false;
    let qty2kg = 0;

    this.cart.forEach(item => {
      if (!item.isFreeGift) {
        subtotal += item.price * item.quantity;
        originalSubtotal += item.originalPrice * item.quantity;
        totalItems += item.quantity;

        if (item.size === "2kg") {
          has2kg = true;
          qty2kg += item.quantity;
        }
      }
    });

    // Special Offer Calculation: Buy 2kg -> Get 250g FREE
    const freeGifts = [];
    if (has2kg) {
      freeGifts.push({
        name: "Pure Natural Honey (Bonus Gift)",
        size: "250g",
        quantity: qty2kg,
        value: 199 * qty2kg,
        price: 0,
        badge: "🎁 FREE OFFER"
      });
    }

    const savings = (originalSubtotal - subtotal) + (freeGifts.reduce((acc, g) => acc + g.value, 0));
    const deliveryCharge = 0; // FREE Delivery
    const finalTotal = subtotal + deliveryCharge;

    return {
      items: this.cart,
      totalCount: totalItems,
      subtotal: subtotal,
      originalSubtotal: originalSubtotal,
      savings: savings,
      deliveryCharge: deliveryCharge,
      finalTotal: finalTotal,
      freeGifts: freeGifts,
      hasSpecialOffer: freeGifts.length > 0
    };
  }
}

window.cartManager = new CartManager();
