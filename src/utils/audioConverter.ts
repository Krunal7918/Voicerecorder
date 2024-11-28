import lamejs from 'lamejs';
import WavEncoder from 'wav-encoder';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const ffmpeg = createFFmpeg({ log: true });

export const convertAudio = async (blob, targetFormat = 'mp3') => {
  console.log("🚀 ~ convertAudio ~ targetFormat:", targetFormat)
  const audioContext = new AudioContext();
  const arrayBuffer = await blob.arrayBuffer();

  // Decode the input file to AudioBuffer
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  if (targetFormat === 'mp3') {
    // MP3 Conversion using lamejs
    const mp3Encoder = new lamejs.Mp3Encoder(1, audioBuffer.sampleRate, 128);
    const samples = new Int16Array(audioBuffer.getChannelData(0).length);

    // Convert Float32Array to Int16Array
    for (let i = 0; i < samples.length; i++) {
      samples[i] = Math.max(-32768, Math.min(32767, Math.floor(audioBuffer.getChannelData(0)[i] * 32768)));
    }

    const mp3Data = [];
    const blockSize = 1152;

    for (let i = 0; i < samples.length; i += blockSize) {
      const mp3buf = mp3Encoder.encodeBuffer(samples.subarray(i, i + blockSize));
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
      }
    }

    const end = mp3Encoder.flush();
    if (end.length > 0) {
      mp3Data.push(end);
    }

    return new Blob(mp3Data, { type: 'audio/mp3' });
  } else if (targetFormat === 'wav') {
    console.log('====================================');
    console.log("wav convert",);
    console.log('====================================');
    // WAV Conversion using wav-encoder
    const wavData = WavEncoder.encode({
      sampleRate: audioBuffer.sampleRate,
      channelData: [audioBuffer.getChannelData(0)]
    });

    return new Blob([wavData], { type: 'audio/wav' });
  } else if (targetFormat === 'm4a' || targetFormat === 'caf') {
    // M4A or CAF Conversion using ffmpeg.js
    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load();
    }

    const inputFileName = `input.${blob.type.split('/')[1]}`;
    const outputFileName = `output.${targetFormat}`;

    ffmpeg.FS('writeFile', inputFileName, await fetchFile(blob));
    await ffmpeg.run('-i', inputFileName, outputFileName);

    const outputFile = ffmpeg.FS('readFile', outputFileName);
    return new Blob([outputFile], { type: `audio/${targetFormat}` });
  } else {
    throw new Error('Unsupported target format');
  }
};
