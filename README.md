# Joachima Social Media Super App

## Project Description

Joachima is an all-in-one social media and messaging super app designed to integrate various social platforms and provide a unified experience. It aims to offer features like user authentication, post management, social media integration (Facebook, Twitter, Instagram), messaging, analytics, and a marketplace for creators.

## Key Features (Planned/Implemented)

- User Authentication (Signup, Login, Logout)
- Basic User Profiles
- Create, Read, Update, Delete Text-based Posts
- Social Media Account Connection (Facebook, Twitter, Instagram)
- Cross-platform Content Management
- Engagement features (Like, Comment, Share)
- Analytics for User Engagement
- Creator Marketplace
- Real-time Messaging (planned)
- Rich Media Support (planned)

## Technologies Used

- **Backend:** Node.js, Express.js, TypeScript
- **Database:** Google Firestore (via Firebase Admin SDK)
- **Cloud Services:** Google Cloud Storage, Google Cloud Speech, Google Cloud Video Intelligence, Google Cloud Video Transcoder
- **Authentication:** Firebase Authentication, JWT
- **Social Integration:** Twitter API v2
- **Other:** `js-recommender`, `bcryptjs`, `express-validator`, `helmet`, `cors`, `serverless-http`
- **Testing:** Jest (Unit), Cypress (E2E)

## Getting Started

### Prerequisites

- Node.js (v20 or higher recommended)
- npm (Node Package Manager)
- Google Cloud Project with Firestore, Storage, Speech, Video Intelligence, Video Transcoder APIs enabled.
- Firebase Project linked to Google Cloud Project.
- Twitter Developer Account (for API keys).
- `.env` file configured with necessary environment variables (see `.env.example`).

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/joachimaross/JoachimaSocial.git
   cd JoachimaSocial
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory based on `.env.example` and fill in your credentials.

### Running the Application Locally

To run the application locally for development:

```bash
npm start
```

### Running Tests

- **Unit Tests (Jest):**
  ```bash
  npm test
  ```
- **End-to-End Tests (Cypress):**
  ```bash
  npm run cypress:run
  ```

## Project Structure

```
.env.example
.eslintrc.json
.gitignore
.prettierrc.json
...
src/
├── api/             # API route definitions
├── config/          # Application configuration (Firebase, GCP, etc.)
├── functions/       # Serverless function entry point
├── middleware/      # Express middleware (auth, error handling, validation)
├── services/        # Business logic and external service integrations
├── utils/           # Utility functions and custom error classes
└── index.ts         # Local development entry point
```

## Contributing

(Add contributing guidelines here)

## License

(Add license information here)
