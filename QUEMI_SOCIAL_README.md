# Quemi Social - Modern Social Media & Messaging Web App

![Home Page](https://github.com/user-attachments/assets/d50245ea-daac-4b4f-9c0f-093fb2b3c16c)

A modern, responsive social media and messaging web app built with React, TypeScript, and Tailwind CSS. Inspired by Apple Messages and Google Messages with enhanced usability, design, and social features.

## ✨ Features

### 🔐 User Authentication & Onboarding
- Login/Signup pages with email, password, and social login buttons (Google, Apple, Facebook)
- Password reset and email verification support
- Modern, responsive design with form validation

![Login Page](https://github.com/user-attachments/assets/b6e6ef0e-55f2-4bb6-a296-de8e2d7d3116)

### 👤 User Profiles
- Profile page with avatar, cover photo, bio, and user information
- Posts grid displaying user's content
- Followers/following counts with statistics
- Editable profile settings
- Profile customization options

![Profile Page](https://github.com/user-attachments/assets/e23882b5-0eb4-4c89-9236-071cf7b0a511)

### 📱 Feed & Posts
- Home feed with posts showing user avatar, username, timestamp, text, images/videos
- Stories carousel with status indicators
- Reactions (like, bookmark, share, comment)
- Post creation modal with text, privacy settings, and tags
- Real-time post interactions
- Hashtag support

![Feed Page](https://github.com/user-attachments/assets/afae74f4-444c-4d91-a686-a64d7b41ed89)

### 💬 Messaging & Chat
- Direct messaging with conversation list
- Real-time message delivery with read receipts
- Typing indicators and online status
- Group chats with custom names
- Message search functionality
- Smooth chat interface with message bubbles

![Messages Page](https://github.com/user-attachments/assets/031c8d30-4c41-44ba-a16c-4798353e6e15)

### 🔔 Notifications & Alerts
- Real-time notifications for likes, comments, mentions, new followers, and messages
- Notification center with filters (all/unread)
- Notification badges on navbar
- Mark as read functionality

### 🔍 Search & Explore
- Comprehensive search for users, posts, and hashtags
- Explore page with trending posts
- Suggested users section
- Trending hashtags with post counts
- Category filters

### ⚙️ Settings & Customization
- Profile settings (display name, username, bio, location, website)
- Notification preferences (email, push, messages)
- Privacy settings (account privacy, online status, tagging, comments)
- Appearance settings (theme, font size, chat bubble color)
- Dark mode support

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Custom components with Lucide React icons
- **Animation:** Framer Motion
- **State Management:** React Context API with hooks

### Backend
- **Framework:** NestJS
- **Language:** TypeScript
- **Real-time:** Socket.IO (WebSockets)
- **Database:** Firebase (Authentication)
- **Testing:** Jest

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/joachimaross/quemiai.git
cd quemiai
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Firebase configuration
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
cd frontend
npm run build
npm start
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── feed/         # Main feed page
│   │   ├── messages/     # Messaging interface
│   │   ├── profile/      # User profile
│   │   ├── explore/      # Explore trending content
│   │   ├── notifications/# Notifications center
│   │   ├── search/       # Search functionality
│   │   ├── settings/     # User settings
│   │   ├── login/        # Login page
│   │   └── signup/       # Signup page
│   ├── components/       # React components
│   │   ├── Navbar.tsx    # Navigation bar
│   │   ├── FloatingDock.tsx # Bottom navigation
│   │   └── ...
│   └── lib/              # Utility functions
│       ├── types.ts      # TypeScript types
│       ├── placeholderData.ts # Sample data
│       ├── context.tsx   # App context
│       ├── auth.ts       # Authentication
│       └── utils.ts      # Utilities
```

## 🎨 Design Features

- **Responsive Design:** Fully responsive across mobile, tablet, and desktop
- **Dark Theme:** Modern dark theme optimized for readability
- **Smooth Animations:** Transitions and hover effects
- **Accessible:** Keyboard navigation and ARIA labels
- **Modular Components:** Reusable and scalable component architecture

## 🔒 Security

- Firebase Authentication integration
- Secure password handling
- CSRF protection
- Input validation and sanitization

## 📝 Available Pages

- `/` - Home landing page
- `/login` - User login
- `/signup` - User registration
- `/feed` - Main social media feed
- `/messages` - Direct messages and group chats
- `/profile` - User profile
- `/explore` - Explore trending content
- `/notifications` - Notifications center
- `/search` - Search users, posts, and hashtags
- `/settings` - User settings and preferences

## 🔄 State Management

The app uses React Context API for global state management:

- User authentication state
- Posts and comments
- Messages and conversations
- Notifications
- User settings
- Like, follow, and bookmark states

## 📦 Key Components

### Data Types
- User, Post, Story, Message, Conversation, Notification, Comment
- Fully typed with TypeScript for type safety

### Context Providers
- AppProvider: Global app state
- Authentication state management

### Reusable Components
- Post cards with interactions
- Message bubbles
- User cards
- Notification items
- Settings panels

## 🎯 Future Enhancements

- Real-time WebSocket integration
- Video and audio message support
- Advanced media upload with preview
- Story creation and viewing
- Comment threading UI
- Push notifications
- Progressive Web App (PWA) support
- Backend API integration
- Database persistence

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

UNLICENSED - Private project

## 👥 Authors

Built with ❤️ by the Quemiai team

## 🙏 Acknowledgments

- Design inspiration from Apple Messages and Google Messages
- Icons from Lucide React
- Images from Unsplash and Dicebear Avatars

---

**Note:** This project uses placeholder data and focuses on frontend implementation. It's ready for future backend API integration.
