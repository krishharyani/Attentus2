# Attentus

## Project Overview

Attentus: AI-powered medical consult note automation for doctors

## Prerequisites

Before setting up the project, ensure you have the following installed and configured:

- **Node.js** (v16 or higher)
- **npm** (Node Package Manager)
- **Expo CLI** (`npm install -g @expo/cli`)
- **MongoDB Atlas account** for database hosting
- **Google Cloud project** for AI services
- **Firebase project** for authentication and backend services

## Project Structure

This repository contains two main subfolders:
- `frontend/` - React Native/Expo mobile application
- `backend/` - Node.js/Express server with AI integration

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the backend directory with your configuration variables:
```
MONGODB_URI=your_mongodb_atlas_connection_string
GOOGLE_CLOUD_PROJECT_ID=your_google_cloud_project_id
FIREBASE_PROJECT_ID=your_firebase_project_id
```

### 2. Service Account Setup

Place your service account JSON files in the backend directory:
- `attentus-6c92a-firebase-adminsdk-fbsvc-0d03c6a439.json` (Firebase Admin SDK)
- `durable-cursor-445521-d3-2729fd106f75.json` (Google Cloud credentials)

### 3. Running the Application

#### Backend Server
```bash
cd backend
npm install
npm run dev
```

#### Frontend Mobile App
```bash
cd frontend
npm install
npm run start
```

The frontend will start the Expo development server, allowing you to run the mobile app on your device or emulator.

Attentus

A React Native + Node.js/Express + MongoDB + Firebase + Google Speech + OpenAI hackathon project for doctors.

├── frontend
├── backend
│   └── credentials
├── .env
├── .gitignore
└── README.md
