# Attentus

**AI-powered medical consult note automation for doctors**

Attentus is a comprehensive mobile application that helps doctors automate the creation of medical consultation notes using AI. The app combines React Native (Expo) frontend with a Node.js/Express backend, featuring real-time speech-to-text transcription, AI-powered note generation, and secure patient management. Built with modern technologies including MongoDB for data persistence, Firebase for authentication and file storage, Google Cloud Speech-to-Text for audio processing, and OpenAI for intelligent note generation.

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

## 🔧 Environment Configuration

### Root `.env` (Backend)
Create a `.env` file in the root directory with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Google Cloud Speech-to-Text
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/google-speech-credentials.json

# JWT Authentication
JWT_SECRET=your-jwt-secret-key-here

# Firebase Configuration
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
FIREBASE_MEASUREMENT_ID=your-measurement-id
FIREBASE_ADMIN_CREDENTIALS=/path/to/your/firebase-admin.json
```

### Frontend Configuration
Update the API host in `frontend/api/client.js`:

```javascript
const API_HOST = '192.168.68.121'; // Replace with your LAN IP address
const api = axios.create({ baseURL: `http://${API_HOST}:3001/api` });
```

## 📁 Project Structure

```
Attentus/
├── frontend/                 # React Native Expo app
│   ├── screens/             # App screens
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
│   └── credentials/         # Service account files
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
- `firebase-admin.json` - Firebase Admin SDK credentials
- `google-speech-credentials.json` - Google Cloud Speech-to-Text credentials

### 3. Environment Configuration

1. Copy the environment variables from the section above
2. Update the MongoDB connection string with your Atlas credentials
3. Add your OpenAI API key
4. Configure Firebase project settings
5. Update the frontend API host to your local IP address

### 4. Start the Application

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

### Authentication
- Secure login/signup with Firebase authentication
- JWT token-based session management
- Protected API routes

### Patient Management
- Add and manage patient information
- Store vital signs and contact details
- Patient history tracking

### Appointment Recording
- Real-time audio recording during consultations
- Speech-to-text transcription via Google Cloud
- AI-powered consultation note generation
- Manual note editing and refinement

### Chat System
- Inter-doctor communication
- Real-time messaging
- Appointment discussion threads

### Profile Management
- Doctor profile customization
- Digital signature upload
- Consultation note templates

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration

### Doctors
- `GET /api/doctors/me` - Get current doctor profile
- `PUT /api/doctors/me` - Update doctor profile
- `POST /api/doctors/me/signature` - Upload signature

### Patients
- `GET /api/patients` - Get all patients
- `POST /api/patients` - Create new patient
- `GET /api/patients/:id` - Get patient details

### Appointments
- `GET /api/appointments` - Get all appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `POST /api/appointments/:id/record` - Submit audio recording

### Chats
- `GET /api/chats` - Get all chats
- `POST /api/chats` - Create new chat
- `GET /api/chats/:id` - Get chat details
- `POST /api/chats/:id/message` - Send message

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

## 🔒 Security Considerations

- All API endpoints are protected with JWT authentication
- File uploads are validated and stored securely
- Environment variables are used for sensitive configuration
- CORS is configured for secure cross-origin requests
- Input validation and sanitization on all endpoints

## 🐛 Troubleshooting

### Common Issues

1. **Backend Connection Failed**
   - Ensure the backend is running on port 3001
   - Check that your IP address is correctly set in the frontend
   - Verify firewall settings allow connections

2. **Authentication Errors**
   - Check Firebase configuration
   - Verify JWT secret is set correctly
   - Ensure service account files are in the correct location

3. **Audio Recording Issues**
   - Grant microphone permissions in Expo Go
   - Check Google Cloud Speech API is enabled
   - Verify service account has proper permissions

4. **Database Connection Issues**
   - Verify MongoDB Atlas connection string
   - Check network connectivity
   - Ensure database user has proper permissions

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions, please open an issue in the GitHub repository or contact the development team.
