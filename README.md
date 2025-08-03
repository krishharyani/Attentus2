# Attentus

**AI-powered medical consult note automation for doctors**

Attentus is a comprehensive mobile application that helps doctors automate the creation of medical consultation notes using AI. The app combines React Native (Expo) frontend with a Node.js/Express backend, featuring real-time speech-to-text transcription, AI-powered note generation, secure patient management, and inter-doctor communication. Built with modern technologies including MongoDB for data persistence, Firebase for authentication and file storage, Google Cloud Speech-to-Text for audio processing, and OpenAI for intelligent note generation.

## 🏗️ Architecture

- **Frontend**: React Native with Expo
- **Backend**: Node.js with Express
- **Database**: MongoDB Atlas
- **Authentication**: Firebase Admin SDK
- **File Storage**: Firebase Storage
- **Speech Processing**: Google Cloud Speech-to-Text
- **AI Integration**: OpenAI GPT for note generation
- **Real-time Communication**: WebSocket support for chat features

## 📋 Prerequisites

Before setting up the project, ensure you have the following installed and configured:

- **Node.js** (v14 or higher)
- **npm** (Node Package Manager)
- **Expo CLI** (`npm install -g @expo/cli`)
- **Expo Go** app on your mobile device
- **MongoDB Atlas account** for database hosting
- **Google Cloud project** with Speech-to-Text API enabled
- **Firebase project** for authentication and file storage
- **OpenAI API account** for AI-powered note generation
- **Google Cloud SDK** (optional, for API management)

## 🔧 Environment Configuration

### Backend `.env`
Create a `.env` file in the `backend/` directory with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Google Cloud Speech-to-Text
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/google-speech-credentials.json
GOOGLE_CLOUD_PROJECT="your-project-id"

# JWT Authentication
JWT_SECRET=your-jwt-secret-key-here

# Firebase Configuration
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```

### Frontend Configuration
Update the API host in `frontend/api/client.js`:

```javascript
const API_HOST = '192.168.68.121'; // Replace with your LAN IP address
const BACKEND_URL = `http://${API_HOST}:3001`;
```

## 📁 Project Structure

```
Attentus/
├── frontend/                 # React Native Expo app
│   ├── screens/             # App screens
│   │   ├── Auth/           # Authentication screens
│   │   └── components/     # Reusable components
│   ├── navigation/          # Navigation configuration
│   ├── context/             # React Context providers
│   ├── api/                 # API client configuration
│   └── assets/              # Images and static files
├── backend/                 # Node.js Express server
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── middlewares/     # Custom middlewares
│   │   ├── services/        # Business logic services
│   │   └── config/          # Configuration files
│   ├── credentials/         # Service account files
│   └── scripts/             # Utility scripts
└── README.md
```

## 🚀 Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd Attentus

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Service Account Setup

Place your service account JSON files in the `backend/credentials/` directory:
- `firebase-admin.json` - Firebase Admin SDK credentials (required for file storage and authentication)

### 3. Enable Speech-to-Text API

Before starting the backend, run:
```bash
npm run enable-api
```

This ensures the Speech-to-Text API is active in your GCP project.

**Note:** If you don't have Google Cloud SDK installed, you can manually enable the Speech-to-Text API at: https://console.cloud.google.com/apis/library/speech.googleapis.com

### 4. Environment Configuration

1. Copy the environment variables from the section above
2. Update the MongoDB connection string with your Atlas credentials
3. Add your OpenAI API key
4. Configure Firebase project settings
5. Update the frontend API host to your local IP address
6. Ensure all required credentials are in the `backend/credentials/` directory

### 5. Start the Application

#### Backend Server
```bash
cd backend
npm start
```

The backend will start on port 3001 (configurable via PORT environment variable).

#### Frontend Mobile App
```bash
cd frontend
npm start
```

This will start the Expo development server. Scan the QR code with Expo Go to run the app on your device.

## 🔑 Key Features

### Authentication & User Management
- Secure login/signup with Firebase authentication
- JWT token-based session management
- Protected API routes
- Doctor profile management with first/last name support
- Voice profile upload during signup

### Patient Management
- Add and manage patient information
- Store vital signs and contact details
- Patient history tracking
- Search and filter patients
- Patient consult note history

### Appointment Management
- Create and schedule appointments
- Real-time audio recording during consultations
- Audio file upload support (MP3, M4A, WAV, etc.)
- Speech-to-text transcription via Google Cloud
- AI-powered consultation note generation with doctor/patient context
- Manual note editing and refinement
- Weight and height tracking
- Appointment status management

### Consult Note System
- AI-generated consultation notes from audio transcripts
- Preview mode with clickable full note viewing
- Dedicated read-only consult note viewing screen
- Note sharing in doctor communications
- Patient-specific consult note history

### Chat System
- Inter-doctor communication
- Real-time messaging
- Doctor search and filtering
- Consult note sharing in chat messages
- Professional consult note components in chat

### Profile Management
- Doctor profile customization
- Digital signature upload
- Consultation note templates
- Professional information management

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration with voice profile

### Doctors
- `GET /api/doctors/me` - Get current doctor profile
- `PUT /api/doctors/me` - Update doctor profile
- `GET /api/doctors` - List all doctors for chat
- `POST /api/doctors/me/signature` - Upload signature

### Patients
- `GET /api/patients` - Get all patients
- `POST /api/patients` - Create new patient
- `GET /api/patients/:id` - Get patient details
- `PUT /api/patients/:id` - Update patient information

### Appointments
- `GET /api/appointments` - Get all appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `POST /api/appointments/:id/record` - Submit audio recording/upload
- `DELETE /api/appointments/:id` - Cancel appointment

### Chats
- `GET /api/chats` - Get all chats
- `POST /api/chats` - Create new chat
- `GET /api/chats/:id` - Get chat details with messages
- `POST /api/chats/:id/message` - Send message with consult note support

## 🛠️ Development

### Running in Development Mode
```bash
# Backend with auto-restart
cd backend && npm run dev

# Frontend with hot reload
cd frontend && npm start
```

### Building for Production
```bash
# Build frontend
cd frontend && expo build:android  # or expo build:ios

# Deploy backend
cd backend && npm run build
```

### Available Scripts
```bash
# Backend
npm run start          # Start production server
npm run dev           # Start development server with nodemon
npm run enable-api    # Enable Google Cloud Speech-to-Text API

# Frontend
npm start             # Start Expo development server
npm run android       # Run on Android emulator
npm run ios          # Run on iOS simulator
```

## 🔒 Security Considerations

- All API endpoints are protected with JWT authentication
- File uploads are validated and stored securely in Firebase Storage
- Environment variables are used for sensitive configuration
- CORS is configured for secure cross-origin requests
- Input validation and sanitization on all endpoints
- Secure audio file handling with proper MIME type validation
- Protected patient data with role-based access control