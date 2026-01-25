# 🎂 Birthday Buddy (Beta v1.0)

**Birthday Buddy** is a premium, feature-rich React Native application built with Expo and Supabase. It doesn't just remind you of birthdays; it helps you celebrate them with a powerful **Integrated Card Studio** and high-quality sharing options.

---

## ✨ Features

### 📅 Birthday Management
- **Smart Calendar View**: Visualize all upcoming celebrations with a sleek, interactive calendar.
- **Dynamic List**: A scrollable feed of birthdays sorted by proximity.
- **Push Notifications**: Never miss a day with configurable reminders (1 hour before, 1 day before, etc.).

### 🎨 Card Studio (Design Engine)
Our flagship feature allows you to create professional-grade birthday cards on the go:
- **Premium Layouts**: Choose from 8+ distinct design languages (Starry Night, Retro Neon, Minimal Elegance, etc.).
- **Interactive Drag & Drop**: Add and position elements (stickers, text, emojis) exactly where you want them.
- **Full Customization**: Change themes, toggle photos, and add custom personal messages.
- **Real-time Preview**: High-fidelity rendering of your card as you design.

### 📤 Sharing & Export
- **Save to Gallery 📸**: High-resolution (1080x1920) export directly to your photo library.
- **Instagram Stories 🤩**: One-tap deep-linking that opens Instagram with your card perfectly fitted to a story.
- **Celebration Animation ✨**: A lightweight HTML5 bundle that lets recipients see moving celebration effects in their browser.
- **System Share**: Universal support for WhatsApp, iMessage, and other social platforms.

---

## 🛠️ Tech Stack
- **Framework**: [Expo](https://expo.dev/) (React Native)
- **Backend**: [Supabase](https://supabase.com/) (Auth, Database, Storage)
- **State Management**: React Hooks & Context
- **Graphics**: `react-native-view-shot`, `lottie-react-native`, `expo-image-manipulator`
- **Navigation**: React Navigation (Bottom Tabs + Stack)

---

## 🚀 Getting Started

1. **Clone & Install**:
   ```bash
   git clone https://github.com/your-username/birthday-buddy.git
   cd birthday-buddy
   npm install
   ```

2. **Environment Setup**:
   Copy `.env.template` to `.env` and add your credentials:
   ```bash
   cp .env.template .env
   ```

3. **Database Setup**:
   Run the SQL scripts provided in `storage_setup.md` in your Supabase SQL Editor to initialize tables and storage buckets.

4. **Run the App**:
   ```bash
   # Start the Metro bundler
   npx expo start
   ```

---

## 🗺️ Roadmap & Upcoming Features

- [ ] **Native Video Export**: High-quality MP4 generation directly on-device.
- [ ] **Gift Registry Integration**: Link gift ideas directly to birthday entries.
- [ ] **Group Celebrations**: Collaborate on card designs with friends.
- [x] **AI Message Generator**: Get personalized birthday wish suggestions based on your relationship.
- [ ] **Global Sync**: Automatically pull birthdays from contacts and social accounts.

---

## 🛡️ License
This project is for personal use and showcase purposes.

---
*Made with ❤️ by the Birthday Buddy Team*
