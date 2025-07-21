
# UMI School Portal

A Progressive Web App (PWA) for the University Management Information System school portal, enabling faculty members to manage students, grades, and administrative tasks.

## Features

### Core Functionality
- **Student Management**: View and manage student profiles, proposals, and supervisor assignments
- **Grade Management**: Handle proposal grading, defense scheduling, and gradebook management
- **Faculty Management**: Manage supervisors and faculty assignments
- **Notifications**: Real-time notifications and updates
- **Statistics**: Faculty statistics and analytics
- **Settings**: User preferences and account management

### PWA Capabilities
- **📱 Installable**: Install on desktop and mobile devices
- **🔄 Offline Support**: Works offline with service worker caching
- **⚡ Fast Loading**: Optimized performance with resource caching
- **🎨 Native Feel**: App-like experience with purple faculty theme
- **🔄 Auto-Updates**: Automatic updates when new versions are available

## Installation

### As a Web App (PWA)
1. **Desktop**: Visit the portal in Chrome/Edge and click the install icon in the address bar
2. **Mobile**: Open in browser and select "Add to Home Screen"
3. **Launch**: Use the installed app icon for quick access

### Development Setup
```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview
```

## Technology Stack
- **Frontend**: React 19, Vite, TypeScript
- **Styling**: Tailwind CSS
- **PWA**: Vite PWA Plugin, Workbox
- **Icons**: Lucide React
- **Routing**: React Router
- **State**: Context API
- **Notifications**: Sonner

## PWA Features
- **Theme Color**: Purple (#7c3aed) for faculty branding
- **Offline Caching**: App shell and API responses cached
- **Install Prompts**: Smart install prompts for supported devices
- **Document Support**: Cached DOCX templates for proposals
- **Cross-Platform**: Works on all major platforms and browsers

## Development
- Built with React 19 and Vite for optimal performance
- TypeScript for type safety
- Tailwind CSS for responsive design
- PWA-ready with service worker and manifest

## Documentation
- See `PWA-SETUP.md` for detailed PWA implementation guide
- Component documentation available in respective directories

## Browser Support
- **Recommended**: Chrome, Edge, Safari (latest versions)
- **PWA Features**: Full support in Chrome/Edge, basic support in Safari
- **Mobile**: iOS Safari 11.3+, Android Chrome
