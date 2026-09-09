/**
 * BEESBEE - Application Configuration
 * All business settings, WhatsApp number, and initial catalog
 */

const CONFIG = {
  brand: {
    name: "BeesBee",
    tagline: "Pure Honey. Straight From Nature.",
    description: "100% Raw, Unpasteurized & Pure Natural Honey collected straight from pristine natural apiaries and delivered to your doorstep.",
    whatsappNumber: "919876543210", // Default business WhatsApp number (country code without +)
    displayPhone: "+91 98765 43210",
    email: "support@beesbee.com",
    address: "BeesBee Apiaries & Natural Farms, Western Ghats Valley",
    operatingHours: "Monday - Sunday: 9:00 AM - 8:00 PM",
  },
  
  delivery: {
    standardCharge: 0, // FREE delivery promotion
    freeDeliveryThreshold: 0, // Free delivery for all honey orders
    estimatedDays: "2-4 Business Days",
  },

  offers: [
    {
      id: "offer-2kg-free-250g",
      title: "FAMILY HONEY COMBO",
      headline: "Buy 2kg → Get 250g FREE!",
      badge: "LIMITED SPECIAL OFFER",
      savings: "Save ₹199",
      conditionSize: "2kg",
      minQty: 1,
      rewardText: "1x 250g Pure Honey Jar (FREE)",
      rewardSize: "250g",
      rewardValue: 199,
      bannerImage: "assets/images/offer_banner.png",
      isActive: true
    },
    {
      id: "offer-1kg-bundle",
      title: "WELLNESS DUO",
      headline: "Buy 1kg + 500g Combo",
      badge: "POPULAR BUNDLE",
      savings: "Save ₹100",
      conditionSize: "1kg",
      minQty: 1,
      rewardText: "Flat ₹100 Off on 500g addition",
      rewardSize: null,
      rewardValue: 100,
      bannerImage: "assets/images/four_jars_full.jpg",
      isActive: true
    }
  ],

  videos: [
    {
      id: "vid-harvest-1",
      title: "Wild Comb Harvesting",
      subtitle: "See how we naturally collect honey directly from deep forest bee colonies without harming bees.",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-beekeeper-checking-a-honeycomb-with-bees-42416-large.mp4",
      poster: "assets/images/video_banner.png",
      duration: "0:45",
      tag: "Harvesting"
    },
    {
      id: "vid-extract-2",
      title: "Cold Filtration & Bottling",
      subtitle: "Zero heat, zero pasteurization. Pure honey gently strained through natural cotton filters into sterilized glass jars.",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-honey-flowing-from-a-wooden-dipper-into-a-jar-42398-large.mp4",
      poster: "assets/images/hero_jar.png",
      duration: "0:38",
      tag: "Bottling"
    }
  ],

  announcements: [
    {
      id: "ann-fresh-batch",
      title: "🍯 Fresh Monsoon Harvest Now Available!",
      message: "Our newest forest honey harvest is bottled and ready. Rich in natural pollens and antioxidants.",
      date: "Active Now",
      isNew: true
    },
    {
      id: "ann-free-shipping",
      title: "🚚 Free Nationwide Delivery On All Orders",
      message: "Enjoy free priority safe-glass packing and doorstep delivery across all states.",
      date: "Ongoing",
      isNew: false
    }
  ]
};

// Expose on window
window.BEESBEE_CONFIG = CONFIG;
