/**
 * BEESBEE - Products & Sizes Catalog
 * Dedicated to 100% Pure Natural Honey in 4 core glass jar sizes
 */

const PRODUCTS_DATA = [
  {
    id: "beesbee-pure-honey",
    name: "BeesBee Pure Natural Honey",
    subtitle: "Real Honey. Real Goodness.",
    badge: "100% Raw & Natural",
    rating: 4.9,
    reviewsCount: 1420,
    origin: "Untouched Western Ghats & Himalayan Wild Flora",
    shelfLife: "18 Months",
    purityHighlights: [
      "100% Pure, Raw & Unpasteurized",
      "Zero Added Sugar or High Fructose Corn Syrup",
      "Zero Artificial Preservatives or Additives",
      "Retains Natural Bee Pollen & Propolis Enzymes",
      "NMR Lab Tested & Authenticity Verified"
    ],
    storage: "Store at room temperature in a cool, dry place away from direct sunlight. Do not refrigerate. Crystallization is a natural characteristic of raw honey; gently warm jar in water to liquefy.",
    sizes: [
      {
        size: "250g",
        weightGrams: 250,
        price: 199,
        originalPrice: 249,
        discountPercent: 20,
        tagline: "Perfect for trying or personal use",
        recommendedFor: "Solo daily tea or coffee boost",
        image: "assets/images/jar_250g.png",
        inStock: true,
        isPopular: false
      },
      {
        size: "500g",
        weightGrams: 500,
        price: 349,
        originalPrice: 429,
        discountPercent: 19,
        tagline: "Great for daily wellness",
        recommendedFor: "Morning warm water & immunity ritual",
        image: "assets/images/jar_500g.png",
        inStock: true,
        isPopular: true
      },
      {
        size: "1kg",
        weightGrams: 1000,
        price: 649,
        originalPrice: 799,
        discountPercent: 19,
        tagline: "Best for families",
        recommendedFor: "Household cooking, breakfast & baking",
        image: "assets/images/jar_1kg.png",
        inStock: true,
        isPopular: false
      },
      {
        size: "2kg",
        weightGrams: 2000,
        price: 1199,
        originalPrice: 1499,
        discountPercent: 20,
        tagline: "More goodness for your home",
        recommendedFor: "Maximum value & free 250g bonus jar",
        image: "assets/images/jar_2kg.png",
        inStock: true,
        isBestValue: true,
        specialOfferText: "Includes FREE 250g Jar"
      }
    ],
    combos: [
      {
        id: "family-combo-2kg",
        name: "Family Honey Pack (2kg + 250g FREE)",
        sizesIncluded: "2kg + 250g Bonus",
        price: 1199,
        originalPrice: 1748,
        savings: 549,
        badge: "🔥 Best Value Offer",
        description: "Get 2kg pure honey and receive a 250g compact jar completely FREE.",
        image: "assets/images/offer_banner.png",
        inStock: true
      },
      {
        id: "wellness-pack-1kg-500g",
        name: "Wellness Duo (1kg + 500g)",
        sizesIncluded: "1kg + 500g",
        price: 899,
        originalPrice: 1228,
        savings: 329,
        badge: "✨ Immunity Bundle",
        description: "Perfect pair for your kitchen pantry and office desk.",
        image: "assets/images/four_jars_full.jpg",
        inStock: true
      }
    ]
  }
];

window.BEESBEE_PRODUCTS = PRODUCTS_DATA;
