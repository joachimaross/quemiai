# Zeeky Social: Your Pulse on Real Content

## Project Description

Zeeky is an all-in-one social media and messaging super app designed to be a vibrant, immersive social experience. It focuses on connecting users through real content and shared "vibes," moving beyond simple algorithms. The platform features rich media, customizable user profiles ("Zones"), and a focus on real-time engagement.

## Key Features (Planned/Implemented)

- **User Authentication** (Signup, Login, Logout)
- **Customizable User Profiles ("Zones")**
- **The Zeeky Stream:** An immersive vertical feed for mixed content (videos, music, articles).
- **The Pulse:** A trending hub showing real-time activity.
- Create, Read, Update, Delete Posts
- Engagement features (Likes, Comments, Shares with a "pulse" effect)
- **Vibes:** Profile customization with color palettes and soundscapes.
- **3D Avatars** (planned)
- **Real-time Messaging** (planned)

## Technologies Used

- **Backend:** Node.js, Express.js, TypeScript
- **Frontend (Planned):** Next.js, React, Tailwind CSS, Framer Motion, Three.js
- **Database:** Google Firestore (via Firebase Admin SDK)
- **Cloud Services:** Google Cloud Storage, Google Cloud Speech, Google Cloud Video Intelligence, Google Cloud Video Transcoder
- **Authentication:** Firebase Authentication, JWT
- **Other:** `js-recommender`, `bcryptjs`, `express-validator`, `helmet`, `cors`, `serverless-http`
- **Testing:** Jest (Unit), Cypress (E2E)

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm (Node Package Manager)
- Google Cloud Project with necessary APIs enabled.
- Firebase Project linked to Google Cloud Project.
- `.env` file configured with necessary environment variables.

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/joachimaross/JoachimaSocial.git
    cd JoachimaSocial
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the root directory and fill in your credentials.

### Running the Application Locally

To run the backend API locally for development:

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
.
├── frontend/        # Next.js frontend application
└── src/             # Node.js backend API
    ├── api/         # API route definitions
    ├── config/      # Application configuration
    ├── functions/   # Serverless function entry point
    ├── middleware/  # Express middleware
    ├── services/    # Business logic
    └── utils/       # Utility functions
```

## Contributing

(Add contributing guidelines here)

## License

(Add license information here)
