# 🐝 BeesBee — Pure Honey. Straight From Nature.

A premium, fast, mobile-first e-commerce website dedicated exclusively to 100% natural, raw, unpasteurized honey.

---

## 🍯 Core Features

1. **Zero-Login WhatsApp Ordering**:
   - Frictionless ordering flow: `Select Bottle Size (250g, 500g, 1kg, 2kg) ➔ Quantity ➔ Auto-applied Offers ➔ Mandatory GPS Location ➔ Order Summary ➔ WhatsApp Direct`.
   - Generates a beautifully formatted WhatsApp message with emojis, order items, free bonus gifts, address, and a clickable Google Maps location pin.
   - Unique Order ID generator (`BB-XXXXXX`).

2. **Mandatory GPS Delivery Pin**:
   - One-tap "Get Current Location (GPS)" button using browser Geolocation API.
   - Reverse geocoded into State, City, and Pincode via OpenStreetMap.
   - Embeds a direct Google Maps link (`https://maps.google.com/?q=LAT,LNG`) directly in the WhatsApp order text so delivery personnel navigate accurately without phone calls.

3. **Authentic Bottle Showcase**:
   - 4 glass jar sizes:
     - **250g** (₹199) - *Perfect for trying or personal use*
     - **500g** (₹349) - *Great for daily wellness*
     - **1kg** (₹649) - *Best for families*
     - **2kg** (₹1,199) - *More goodness for your home + FREE 250g Jar*
   - Real product photography cropped directly from the official BeesBee brand assets.

4. **Automated Special Offers**:
   - Auto-detects family pack promotions: **Buy 2kg → Get 250g FREE!** (Auto-applied in cart and checkout with `₹0` charge).

5. **"Behind the Honey 🍯" Video Showcase**:
   - Real beekeeping, harvesting, and cold extraction video demonstration.
   - Mobile-optimized vertical modal player with mute-by-default audio.

6. **Local Order History & Live Tracker**:
   - Visual 5-step progress stepper: `Placed on WhatsApp` ➔ `Confirmed` ➔ `Preparing & Bottling` ➔ `Out for Delivery` ➔ `Delivered`.
   - One-tap button to inquire status on WhatsApp.

7. **Discreet Merchant Admin Dashboard (`/admin.html`)**:
   - Hidden from public navigation.
   - Passcode protected (Default: `beesbee2026`).
   - Live order viewer with customer phone, GPS maps pin, and status dropdown.
   - Product pricing and stock editor.
   - WhatsApp business number and support settings.

8. **Maintenance Screen (`/maintenance.html`)**:
   - Branded holding page: *"We're preparing something sweet 🍯"*.

---

## 🚀 How to Run

### Option 1: Using Node.js (Recommended)
```bash
npm start
```
Then open your browser at:
- **Customer Storefront:** [http://localhost:3000](http://localhost:3000)
- **Merchant Admin:** [http://localhost:3000/admin.html](http://localhost:3000/admin.html)
- **Maintenance Page:** [http://localhost:3000/maintenance.html](http://localhost:3000/maintenance.html)

### Option 2: Direct Static Hosting
Since there are zero external database dependencies required at this stage, the entire `public/` directory can be hosted directly on **Vercel**, **Netlify**, **GitHub Pages**, or opened locally!

---

## 📁 Project Structure

```
BeesBee/
├── public/
│   ├── assets/
│   │   ├── images/         # Official BeesBee logos, jar cutouts & banners
│   │   └── videos/         # Harvesting footage
│   ├── css/
│   │   └── style.css       # Custom design system & animations
│   ├── js/
│   │   ├── config.js       # Business settings & WhatsApp number
│   │   ├── products.js     # 4 honey bottle sizes & purity specifications
│   │   ├── cart.js         # Guest cart & free gift logic
│   │   ├── checkout.js     # Mandatory GPS & WhatsApp message generator
│   │   ├── orders.js       # Local orders history & status stepper
│   │   └── app.js          # Main UI controller & drawer modals
│   ├── index.html          # Mobile-first storefront
│   ├── admin.html          # Discreet merchant admin panel
│   └── maintenance.html    # Branded maintenance page
├── server.js               # Zero-dependency local development server
├── package.json
└── README.md
```
