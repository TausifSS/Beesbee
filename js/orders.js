/**
 * BEESBEE - Orders & Live Status Tracker
 * Guest order history stored locally with visual status stepper
 */

class OrdersManager {
  constructor() {
    this.storageKey = "beesbee_orders";
  }

  getOrders() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn("Could not read orders", e);
      return [];
    }
  }

  getOrderById(orderId) {
    const orders = this.getOrders();
    return orders.find(o => o.orderId.toUpperCase() === orderId.trim().toUpperCase()) || null;
  }

  /**
   * Determine step level (1 to 5) for order stepper
   */
  getOrderStep(status) {
    const s = (status || "").toLowerCase();
    if (s.includes("delivered")) return 5;
    if (s.includes("out for delivery")) return 4;
    if (s.includes("preparing") || s.includes("bottling")) return 3;
    if (s.includes("confirmed")) return 2;
    return 1; // Order Placed / Received
  }

  /**
   * Update status of an order locally (useful for testing or customer simulation)
   */
  updateOrderStatus(orderId, newStatus) {
    const orders = this.getOrders();
    const target = orders.find(o => o.orderId.toUpperCase() === orderId.toUpperCase());
    if (target) {
      target.status = newStatus;
      localStorage.setItem(this.storageKey, JSON.stringify(orders));
      window.dispatchEvent(new CustomEvent("beesbee:orders-updated"));
      return true;
    }
    return false;
  }

  /**
   * Get direct WhatsApp support link for an order
   */
  getWhatsAppInquiryUrl(orderId) {
    const phone = window.BEESBEE_CONFIG.brand.whatsappNumber;
    const msg = `Hi BeesBee! 🍯 I would like to check the delivery status of my order: ${orderId}. Thank you!`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  }
}

window.ordersManager = new OrdersManager();
