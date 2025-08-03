import fs from 'fs';
import { speechClient } from '../config/speechClient.js';

export async function transcribeAudio(gcsUri) {
  try {
    console.log('Starting transcription for:', gcsUri);
    
    // Configure diarization to 2 speakers (doctor and patient)
    const request = {
      audio: { uri: gcsUri },
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
    throw new Error(`Transcription failed: ${error.message}`);
  }
}
