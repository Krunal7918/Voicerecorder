import { WaveFile } from 'wavefile';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

/**
 * Converts an audio Blob to Apple Music-compatible M4A, CAF, or WAV file.
 * @param blob - Input audio Blob (e.g., webm, mp3, etc.).
 * @param outputFormat - Desired output format ('m4a', 'caf', or 'wav').
 * @returns A Promise that resolves to a Blob containing the converted file.
 */
export const createAppleMusicAudio = async (
  blob: Blob,
  outputFormat: 'm4a' | 'caf' | 'wav'
): Promise<Blob> => {
  try {
    // Validate output format
    if (!['m4a', 'caf', 'wav'].includes(outputFormat)) {
      throw new Error('Invalid output format. Supported formats are: m4a, caf, wav.');
    }

    // If WAV, use wavefile to convert
    if (outputFormat === 'wav') {
      // Step 1: Decode the input audio file into AudioBuffer
      const audioContext = new AudioContext();
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Step 2: Convert AudioBuffer to WAV using wavefile
      const wav = new WaveFile();
      const channelData = audioBuffer.getChannelData(0); // Mono audio
      const samples = new Int16Array(channelData.length);

      // Convert Float32Array to Int16Array
      for (let i = 0; i < channelData.length; i++) {
        samples[i] = Math.max(-32768, Math.min(32767, channelData[i] * 32768));
      }

      wav.fromScratch(1, audioBuffer.sampleRate, '16', samples);

      // Return Blob of WAV file
      return new Blob([wav.toBuffer()], { type: 'audio/wav' });
    }

    // Step 3: Fallback to FFmpeg for M4A or CAF creation
    const ffmpeg = createFFmpeg({ log: true });
    if (!ffmpeg.isLoaded()) await ffmpeg.load();

    // Write the input Blob to FFmpeg's virtual filesystem
    ffmpeg.FS('writeFile', 'input.webm', await fetchFile(blob)); // Replace 'webm' with your input format

    // Set up conversion arguments based on the output format
    const args = ['-i', 'input.webm', '-ar', '44100', '-ac', '2', '-b:a', '128k'];

    if (outputFormat === 'm4a') {
      args.push('-c:a', 'aac', 'output.m4a'); // Use AAC codec for m4a
    } else if (outputFormat === 'caf') {
      args.push('-f', 'caf', 'output.caf'); // Use CAF format
    }

    // Run the FFmpeg command to convert the audio
    await ffmpeg.run(...args);

    // Step 4: Read the converted audio file from FFmpeg's virtual filesystem
    const convertedData = ffmpeg.FS('readFile', `output.${outputFormat}`);

    // Return the converted audio as a Blob
    return new Blob([convertedData.buffer], { type: `audio/${outputFormat}` });

  } catch (error) {
    console.error('Audio conversion error:', error);
    throw new Error('Failed to convert audio to the specified format.');
  }
};
