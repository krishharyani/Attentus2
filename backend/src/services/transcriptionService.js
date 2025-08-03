import fs from 'fs';
import { speechClient } from '../config/speechClient.js';

export async function transcribeAudio(uri) {
  try {
    console.log('🔍 Transcribing from:', uri);
    console.log('🔍 Speech client initialized:', !!speechClient);
    
    // Configure diarization to 2 speakers (doctor and patient)
    const request = {
      audio: { uri: uri },
      config: {
        encoding: 'MP3', // Updated to handle common audio formats
        sampleRateHertz: 44100, // Higher sample rate for better quality
        languageCode: 'en-US',
        enableSpeakerDiarization: true,
        diarizationSpeakerCount: 2, // Doctor and patient
        enableAutomaticPunctuation: true,
        enableWordTimeOffsets: true,
        model: 'latest_long' // Use the latest long-form model
      }
    };

    console.log('Sending transcription request...');
    console.log('Request config:', JSON.stringify(request.config, null, 2));
    
    const [operation] = await speechClient.longRunningRecognize(request);
    
    console.log('Waiting for transcription to complete...');
    const [response] = await operation.promise();
    
    console.log('Transcription completed. Processing results...');
    
    // Process results with speaker diarization
    let transcript = '';
    let currentSpeaker = null;
    
    for (const result of response.results) {
      const alternative = result.alternatives[0];
      
      if (result.words && result.words.length > 0) {
        // Group words by speaker
        let speakerSegments = {};
        
        for (const word of result.words) {
          if (word.speakerTag) {
            const speaker = word.speakerTag;
            if (!speakerSegments[speaker]) {
              speakerSegments[speaker] = [];
            }
            speakerSegments[speaker].push(word.word);
          }
        }
        
        // Build transcript with speaker labels
        for (const [speaker, words] of Object.entries(speakerSegments)) {
          const speakerLabel = speaker === 1 ? 'DOCTOR' : 'PATIENT';
          const text = words.join(' ');
          transcript += `[${speakerLabel}]: ${text}\n`;
        }
      } else {
        // Fallback for results without word-level diarization
        transcript += alternative.transcript + '\n';
      }
    }
    
    console.log('Transcription processed successfully');
    console.log('Transcript length:', transcript.length);
    
    return transcript.trim();
  } catch (error) {
    console.error('Error in transcription service:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      stack: error.stack
    });
    
    // Provide more specific error messages based on error type
    if (error.message.includes('EHOSTUNREACH') || error.message.includes('ENOTFOUND')) {
      throw new Error(`Network connectivity issue: Cannot reach Google Speech-to-Text service. Please check your internet connection and try again. Original error: ${error.message}`);
    } else if (error.message.includes('UNAUTHENTICATED')) {
      throw new Error(`Authentication failed: Please check your Google Cloud credentials. Original error: ${error.message}`);
    } else if (error.message.includes('PERMISSION_DENIED')) {
      throw new Error(`Permission denied: Please check your Google Cloud project permissions. Original error: ${error.message}`);
    } else if (error.message.includes('INVALID_ARGUMENT')) {
      throw new Error(`Invalid audio format or configuration. Please check the audio file. Original error: ${error.message}`);
    } else {
      throw new Error(`Transcription failed: ${error.message}`);
    }
  }
}
