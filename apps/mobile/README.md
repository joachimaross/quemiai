# QUEMI Mobile

React Native (Expo) mobile application for QUEMI - Unified Social Media & Messaging Hub.

## Features

- 📱 Cross-platform (iOS & Android)
- 🔄 Unified feed from all platforms
- 💬 Unified inbox
- 🤖 QuemiAi assistant chat
- 📸 Camera integration
- 🔔 Push notifications
- 💾 Offline caching
- 🔗 Deep linking

## Getting Started

### Prerequisites

- Node.js >= 18
- Expo CLI
- iOS Simulator or Android Emulator

### Installation

```bash
cd apps/mobile
pnpm install
```

### Development

```bash
# Start Expo dev server
pnpm start

# Run on iOS
pnpm ios

# Run on Android
pnpm android

# Run on web
pnpm web
```

## Project Structure

```
apps/mobile/
├── src/
│   ├── screens/          # App screens
│   │   ├── FeedScreen.tsx
│   │   ├── InboxScreen.tsx
│   │   ├── QuemiAiScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── navigation/       # Navigation setup
│   │   └── RootNavigator.tsx
│   ├── services/         # API services
│   │   ├── feedService.ts
│   │   └── aiService.ts
│   ├── components/       # Reusable components
│   ├── hooks/            # Custom React hooks
│   └── utils/            # Utility functions
├── assets/               # Images, fonts, etc.
├── app.json             # Expo config
├── package.json
└── tsconfig.json
```

## Environment Variables

Create a `.env` file:

```env
EXPO_PUBLIC_API_URL=http://localhost:4000
```

## Building for Production

### iOS

```bash
expo build:ios
```

### Android

```bash
expo build:android
```

## Testing

```bash
pnpm test
```

## License

UNLICENSED - Private project
