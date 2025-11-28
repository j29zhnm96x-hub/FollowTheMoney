# FollowTheMoney

Ultra-fast offline money tracker PWA built with vanilla HTML, CSS, and JavaScript.

## Features
- 💰 Track income and expenses with ease
- 📊 View transaction history with swipe-to-delete
- 🔄 Monthly recurring income automation
- 💾 Offline-first with IndexedDB storage
- 🛡️ Automatic local backups protect data during updates
- 📱 Installable as PWA on any device
- 🌓 Automatic dark/light mode support

## Quick Start
Just open `index.html` in any modern browser. No build process required!

## Deploy
Upload all files to any static hosting:
- GitHub Pages
- Netlify
- Vercel
- Any web server

## Files
- `index.html` - Main app page
- `styles.css` - All styling
- `app.js` - Logic, IndexedDB, and backup safeguards
- `manifest.json` - PWA configuration
- `sw.js` - Offline caching & asset updates
- `favicon.ico` - App icon

## Data Safety
The app now mirrors every change to a lightweight local backup so even if the PWA updates or IndexedDB is unavailable, your transactions and settings are restored instantly. A smarter service worker also waits for the backup flush before swapping versions, preventing refresh-related data loss.

## iPhone Installation
1. Open in Safari
2. Tap Share button
3. Select "Add to Home Screen"
4. Enjoy offline access!

## Browser Support
Works on all modern browsers with IndexedDB and Service Worker support:
- Chrome/Edge 80+
- Safari 13+
- Firefox 75+
- Mobile browsers

---
Made with ❤️ for simple money tracking
