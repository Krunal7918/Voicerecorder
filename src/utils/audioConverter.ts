import lamejs from 'lamejs';

export const convertToMp3 = async (blob: Blob): Promise<Blob> => {
  try {
    const audioContext = new AudioContext();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    const mp3Encoder = new lamejs.Mp3Encoder(1, audioBuffer.sampleRate, 128);
    const samples = new Int16Array(audioBuffer.length);
    const leftChannel = audioBuffer.getChannelData(0);
    
    // Convert Float32Array to Int16Array
    for (let i = 0; i < audioBuffer.length; i++) {
      samples[i] = Math.max(-32768, Math.min(32767, Math.floor(leftChannel[i] * 32768)));
    }
    
    const mp3Data: Int8Array[] = [];
    const blockSize = 1152; // Multiple of 576 (minimum encoder block size)
    
    for (let i = 0; i < samples.length; i += blockSize) {
      const sampleChunk = samples.subarray(i, i + blockSize);
      const mp3buf = mp3Encoder.encodeBuffer(sampleChunk);
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
      }
    }
    
    const end = mp3Encoder.flush();
    if (end.length > 0) {
      mp3Data.push(end);
    }
    
    return new Blob(mp3Data, { type: 'audio/mp3' });
  } catch (error) {
    console.error('MP3 conversion error:', error);
    throw new Error('Failed to convert audio to MP3 format');
  }
};