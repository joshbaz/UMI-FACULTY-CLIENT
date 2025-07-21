# UMI School Portal - Progressive Web App (PWA) Setup

## Overview
The UMI School Portal has been converted to a Progressive Web App (PWA), enabling users to install it on their desktop and mobile devices for a native app-like experience.

## Features
- **Installable**: Can be installed on desktop and mobile devices
- **Offline Capable**: Service worker caches resources for offline access
- **App-like Experience**: Runs in standalone mode without browser UI
- **Cross-Platform**: Works on Windows, macOS, Linux, iOS, and Android
- **Auto-Updates**: Automatically updates when new versions are available
- **Purple Theme**: Faculty-specific purple branding (#7c3aed)

## Installation

### Desktop (Chrome, Edge, Safari)
1. Open the UMI School Portal in your browser
2. Look for the install prompt or click the install icon in the address bar
3. Click "Install" when prompted
4. The app will be installed and can be launched from your desktop

### Mobile (iOS/Android)
1. Open the portal in Safari (iOS) or Chrome (Android)
2. Tap the share button and select "Add to Home Screen"
3. The app icon will appear on your home screen

## Technical Implementation

### Dependencies Added
```json
{
  "vite-plugin-pwa": "^0.21.1",
  "workbox-window": "^7.3.0"
}
```

### Vite Configuration
- PWA plugin configured with purple theme
- Service worker generates automatically
- Manifest includes faculty-specific branding
- DOCX file caching for proposal templates

### PWA Assets Generated
- **Icons**: 192x192, 512x512 PWA icons
- **Apple Icons**: apple-touch-icon.png for iOS
- **Favicons**: Multiple sizes for browser tabs
- **Manifest**: Web app manifest with purple theme
- **Service Worker**: Caches app shell and API responses

### Files Modified
1. `vite.config.js` - Added VitePWA plugin configuration
2. `index.html` - Added PWA meta tags and theme colors
3. `src/App.jsx` - Integrated PWAInstaller component
4. `src/components/PWAInstaller.jsx` - Created install prompt component

## PWA Installer Component
The PWAInstaller component provides:
- Install prompts when PWA is available
- Debug information in development mode
- Purple-themed UI matching school portal design
- Session-based install prompt management

## Offline Capabilities
- **App Shell Caching**: Core app files cached for offline access
- **API Caching**: GET requests cached with NetworkFirst strategy
- **Template Caching**: DOCX proposal templates cached for offline use
- **Resource Caching**: Images, fonts, and CSS cached automatically

## Development
- Install prompts only show in production builds
- Debug panel available in development mode
- Service worker registration is automatic

## Build & Deploy
```bash
yarn build
```

The build process generates:
- Optimized app bundle (~2MB)
- Service worker with precache manifest
- All PWA assets and icons
- Web app manifest

## Browser Support
- **Chrome/Chromium**: Full PWA support
- **Safari**: Basic PWA support (iOS 11.3+)
- **Firefox**: Progressive enhancement
- **Edge**: Full PWA support

## Faculty-Specific Features
- Purple theme color (#7c3aed) for faculty branding
- "UMI School Portal" app name and short name
- Faculty-specific icon and splash screens
- Optimized for faculty workflow and document management

## Troubleshooting
- Clear browser cache if installation issues occur
- Ensure HTTPS is enabled for PWA features
- Check browser console for service worker errors
- Verify manifest.webmanifest is accessible

## Updates
The PWA automatically checks for updates and prompts users when new versions are available. Updates are handled by the service worker without user intervention. 