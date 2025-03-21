# My QR List

A React Native Expo app that allows users to create and manage lists of items, with the ability to generate QR codes for sharing lists. When someone scans the QR code, they can view the list on their device.

## Features

- Create multiple lists with items
- Mark items as complete/incomplete
- Delete items from lists
- Generate QR codes for sharing lists
- Scan QR codes to view shared lists
- Modern and intuitive UI with React Native Paper
- Persistent storage using AsyncStorage

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac) or Android Studio (for Android development)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd my-qr-list
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
- Press `i` to run on iOS simulator
- Press `a` to run on Android emulator
- Scan the QR code with Expo Go app on your physical device

## Usage

1. Create a new list by tapping the "+" button on the home screen
2. Add items to your list
3. Save the list
4. View your list and tap the QR code icon to generate a shareable QR code
5. Share the QR code with others
6. Use the scan button on the home screen to scan QR codes and view shared lists

## Development

The app is built with:
- React Native
- Expo
- TypeScript
- React Navigation
- React Native Paper
- Expo Barcode Scanner
- React Native QR Code SVG

## License

MIT 