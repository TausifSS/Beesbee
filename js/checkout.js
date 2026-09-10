/**
 * BEESBEE - Frictionless Checkout, Mandatory GPS Location & WhatsApp Order Generator
 * No login required. Direct WhatsApp confirmation + local order tracking.
 */

class CheckoutManager {
  constructor() {
    this.gpsLocation = null; // { lat, lng, accuracy, addressString, state, city, pincode, mapsUrl }
    this.isLocating = false;
  }

  /**
   * Request browser Geolocation and reverse-geocode to human-readable address
   */
  async captureGPSLocation(onSuccess, onError) {
    if (!navigator.geolocation) {
      const err = "Geolocation is not supported by your browser. Please ensure location services are turned on.";
      if (onError) onError(err);
      return;
    }

    this.isLocating = true;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = Math.round(position.coords.accuracy);

        const mapsUrl = `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`;

        // Attempt Reverse Geocoding with OpenStreetMap Nominatim
        let reverseData = {
          state: "",
          city: "",
          area: "",
          pincode: "",
          displayAddress: `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`
        };

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`, {
            headers: {
              'Accept-Language': 'en'
            }
          });

          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};

            const road = addr.road || addr.pedestrian || addr.suburb || "";
            const area = addr.neighbourhood || addr.suburb || addr.residential || "";
            const city = addr.city || addr.town || addr.village || addr.county || "";
            const state = addr.state || "";
            const pincode = addr.postcode || "";

            reverseData = {
              state: state,
              city: city,
              area: [road, area].filter(Boolean).join(", "),
              pincode: pincode,
              displayAddress: data.display_name || `${city}, ${state}`
            };
          }
        } catch (fetchErr) {
          console.warn("Reverse geocode network warning, coordinates captured successfully:", fetchErr);
        }

        this.gpsLocation = {
          lat: lat,
          lng: lng,
          accuracy: accuracy,
          mapsUrl: mapsUrl,
          ...reverseData
        };

        this.isLocating = false;
        if (onSuccess) onSuccess(this.gpsLocation);
      },
      (error) => {
        this.isLocating = false;
        let msg = "Could not retrieve delivery location pin.";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "Location access was denied. Please allow location access in your browser settings so we can deliver your order to your doorstep.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = "Location is unavailable on your device right now.";
        } else if (error.code === error.TIMEOUT) {
          msg = "Location request timed out. Please tap 'Pin Delivery Location' again.";
        }
        if (onError) onError(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000
      }
    );
  }

  /**
   * Generate a unique BeesBee Order ID
   */
  generateOrderId() {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `BB-${randomNum}`;
  }

  /**
   * Get the most recent saved order from local storage
   */
  getLastOrder() {
    try {
      const existing = localStorage.getItem("beesbee_orders");
      const list = existing ? JSON.parse(existing) : [];
      return list.length > 0 ? list[0] : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Validate checkout inputs
   */
  validateOrderForm(formData) {
    const errors = [];

    if (!formData.customerName || formData.customerName.trim().length < 2) {
      errors.push("Please enter your full name.");
    }

    const cleanPhone = (formData.customerPhone || "").replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      errors.push("Please enter a valid 10-digit WhatsApp phone number.");
    }

    if (!this.gpsLocation) {
      // Auto-recover saved location pin from profile or previous order
      const profile = this.getSavedProfile();
      if (profile && profile.locationPin) {
        this.gpsLocation = profile.locationPin;
      } else {
        const last = this.getLastOrder();
        if (last && last.address && last.address.gps) {
          this.gpsLocation = last.address.gps;
        }
      }
    }

    if (!this.gpsLocation) {
      errors.push("Please pin your delivery location so our delivery partner can reach your doorstep.");
    }

    if (!formData.houseNo || formData.houseNo.trim().length < 1) {
      errors.push("Please enter your Flat / House / Building No.");
    }

    if (!formData.area || formData.area.trim().length < 2) {
      errors.push("Please enter your Area or Street name.");
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
      cleanPhone: cleanPhone
    };
  }

  /**
   * Assemble Order, save locally, build WhatsApp message and dispatch
   */
  processOrder(formData, singleProductDirect = null) {
    const validation = this.validateOrderForm(formData);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    // Determine order items
    let items = [];
    let freeGifts = [];
    let finalTotal = 0;
    let savings = 0;

    if (singleProductDirect) {
      // Direct Quick Order flow for a specific size
      const sizeData = singleProductDirect.sizeData;
      const qty = singleProductDirect.quantity || 1;
      items.push({
        name: "BeesBee Pure Natural Honey",
        size: sizeData.size,
        price: sizeData.price,
        quantity: qty,
        subtotal: sizeData.price * qty
      });
      finalTotal = sizeData.price * qty;

      if (sizeData.size === "2kg") {
        freeGifts.push({
          name: "Pure Natural Honey (Bonus Gift)",
          size: "250g",
          quantity: qty,
          value: 199 * qty,
          price: 0
        });
        savings += 199 * qty;
      }
      savings += (sizeData.originalPrice - sizeData.price) * qty;
    } else {
      // From Cart
      const summary = window.cartManager.getSummary();
      if (summary.items.length === 0) {
        return { success: false, errors: ["Your cart is empty. Please choose a honey jar first."] };
      }
      items = summary.items.map(i => ({
        name: i.name,
        size: i.size,
        price: i.price,
        quantity: i.quantity,
        subtotal: i.price * i.quantity
      }));
      freeGifts = summary.freeGifts;
      finalTotal = summary.finalTotal;
      savings = summary.savings;
    }

    const orderId = this.generateOrderId();
    const orderTimestamp = new Date().toISOString();

    const fullOrderRecord = {
      orderId: orderId,
      createdAt: orderTimestamp,
      status: "Order Placed on WhatsApp",
      customer: {
        name: formData.customerName.trim(),
        phone: validation.cleanPhone
      },
      address: {
        houseNo: formData.houseNo.trim(),
        area: formData.area.trim(),
        landmark: (formData.landmark || "").trim(),
        city: formData.city || this.gpsLocation.city || "",
        state: formData.state || this.gpsLocation.state || "",
        pincode: formData.pincode || this.gpsLocation.pincode || "",
        gps: {
          lat: this.gpsLocation.lat,
          lng: this.gpsLocation.lng,
          accuracyMeters: this.gpsLocation.accuracy,
          mapsUrl: this.gpsLocation.mapsUrl
        }
      },
      items: items,
      freeGifts: freeGifts,
      totalAmount: finalTotal,
      savings: savings,
      deliveryCharge: "FREE"
    };

    // 1. Save in user's local orders history
    this.saveOrderLocally(fullOrderRecord);

    // 2. Save user profile for next time convenience
    this.saveUserProfile({
      name: formData.customerName.trim(),
      phone: validation.cleanPhone,
      houseNo: formData.houseNo.trim(),
      area: formData.area.trim(),
      landmark: (formData.landmark || "").trim(),
      city: formData.city || (this.gpsLocation ? this.gpsLocation.city : "") || "",
      state: formData.state || (this.gpsLocation ? this.gpsLocation.state : "") || "",
      pincode: formData.pincode || (this.gpsLocation ? this.gpsLocation.pincode : "") || "",
      locationPin: this.gpsLocation
    });

    // 3. If cart was used, clear cart
    if (!singleProductDirect) {
      window.cartManager.clearCart();
    }

    // 4. Generate formatted WhatsApp message
    const message = this.buildWhatsAppMessage(fullOrderRecord);

    // 5. Build WhatsApp URL
    const businessPhone = window.BEESBEE_CONFIG.brand.whatsappNumber;
    const whatsappUrl = `https://wa.me/${businessPhone}?text=${encodeURIComponent(message)}`;

    return {
      success: true,
      order: fullOrderRecord,
      whatsappUrl: whatsappUrl
    };
  }

  /**
   * Build clean WhatsApp message template
   */
  buildWhatsAppMessage(order) {
    let msg = `🐝 *BEESBEE — NEW ORDER*\n`;
    msg += `---------------------------------\n`;
    msg += `*Order ID:* ${order.orderId}\n`;
    msg += `*Customer:* ${order.customer.name}\n`;
    msg += `*WhatsApp:* ${order.customer.phone}\n\n`;

    msg += `🍯 *ITEMS ORDERED:*\n`;
    order.items.forEach(item => {
      msg += `• Pure Natural Honey (${item.size}) × ${item.quantity} = ₹${item.subtotal.toLocaleString('en-IN')}\n`;
    });

    if (order.freeGifts && order.freeGifts.length > 0) {
      msg += `\n🎁 *OFFER APPLIED:*\n`;
      order.freeGifts.forEach(gift => {
        msg += `• FREE ${gift.size} Honey Jar × ${gift.quantity} (Worth ₹${gift.value})\n`;
      });
    }

    msg += `\n💵 *BILLING:*\n`;
    msg += `Delivery: FREE 🚚\n`;
    msg += `*TOTAL PAYABLE: ₹${order.totalAmount.toLocaleString('en-IN')}*\n`;
    if (order.savings > 0) {
      msg += `_(You saved ₹${order.savings.toLocaleString('en-IN')}!)_\n`;
    }

    msg += `\n📍 *DELIVERY ADDRESS:*\n`;
    msg += `${order.address.houseNo}\n`;
    msg += `${order.address.area}\n`;
    if (order.address.landmark) {
      msg += `Landmark: ${order.address.landmark}\n`;
    }
    const locationParts = [order.address.city, order.address.state, order.address.pincode].filter(Boolean);
    if (locationParts.length > 0) {
      msg += `${locationParts.join(', ')}\n`;
    }

    msg += `\n📍 *DELIVERY LOCATION MAP:*\n`;
    msg += `${order.address.gps.mapsUrl}\n`;
    msg += `---------------------------------\n`;
    msg += `Please confirm my order. Pure Honey Straight From Nature! 🍯`;

    return msg;
  }

  /**
   * Save order in browser localStorage
   */
  saveOrderLocally(order) {
    try {
      const existing = localStorage.getItem("beesbee_orders");
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(order); // Newest first
      localStorage.setItem("beesbee_orders", JSON.stringify(list));
      window.dispatchEvent(new CustomEvent("beesbee:orders-updated"));
    } catch (e) {
      console.error("Failed to save order locally", e);
    }
  }

  /**
   * Save lightweight customer profile
   */
  saveUserProfile(profile) {
    try {
      localStorage.setItem("beesbee_profile", JSON.stringify(profile));
      if (typeof window.syncUserProfile === 'function') {
        window.syncUserProfile(profile);
      }
    } catch (e) {
      console.warn("Failed to save profile", e);
    }
  }

  /**
   * Get saved lightweight customer profile
   */
  getSavedProfile() {
    try {
      const data = localStorage.getItem("beesbee_profile");
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }
}

window.checkoutManager = new CheckoutManager();
