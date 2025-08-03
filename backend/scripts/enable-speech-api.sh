#!/usr/bin/env bash
set -e

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
  echo "⚠️  gcloud CLI not found. Please install Google Cloud SDK:"
  echo "   https://cloud.google.com/sdk/docs/install"
  echo "   Or manually enable Speech-to-Text API in Google Cloud Console:"
  echo "   https://console.cloud.google.com/apis/library/speech.googleapis.com"
  exit 0
fi

if ! gcloud services list --project="$GOOGLE_CLOUD_PROJECT" --enabled | grep -q speech.googleapis.com; then
  echo "👉 Enabling Speech-to-Text API for project $GOOGLE_CLOUD_PROJECT…"
  gcloud services enable speech.googleapis.com --project="$GOOGLE_CLOUD_PROJECT"
  echo "✅ Speech-to-Text API enabled."
else
  echo "✅ Speech-to-Text API already enabled."
fi 