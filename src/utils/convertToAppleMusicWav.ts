import { WaveFile } from 'wavefile';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

/**
 * Converts an audio Blob to an Apple Music-compatible WAV file.
 * @param blob - Input audio Blob (e.g., webm, mp3, etc.).
 * @returns A Promise that resolves to a Blob containing the WAV file.
 */
export const createAppleMusicWav = async (blob: Blob): Promise<Blob> => {
    try {
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
    } catch (error) {
        console.warn('Wavefile method failed, falling back to FFmpeg.', error);

        // Step 3: Fall back to FFmpeg for WAV creation
        const ffmpeg = createFFmpeg({ log: true });
        if (!ffmpeg.isLoaded()) await ffmpeg.load();

        ffmpeg.FS('writeFile', 'input.webm', await fetchFile(blob)); // Replace 'webm' with the actual input type
        await ffmpeg.run('-i', 'input.webm', '-ar', '44100', '-ac', '2', '-f', 'wav', 'output.wav');

        const wavData = ffmpeg.FS('readFile', 'output.wav');
        return new Blob([wavData.buffer], { type: 'audio/wav' });
    }
};
