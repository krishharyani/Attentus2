import fs from 'fs';
import { speechClient } from '../config/speechClient.js';

export async function transcribeAudio(gcsUri) {
  // Configure diarization to 2 speakers
  const request = {
    audio: { uri: gcsUri },
    config: {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'en-US',
      enableSpeakerDiarization: true,
      diarizationSpeakerCount: 2
    }
  };
  const [operation] = await speechClient.longRunningRecognize(request);
  const [response] = await operation.promise();
  // concatenate transcripts
  return response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');
}
