import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

/**
 * Converts audio Blob to specified format.
 * Supported formats: .m4a, .caf
 * @param blob - Input audio Blob (e.g., webm, mp3, etc.).
 * @param outputFormat - Desired output format ('m4a' or 'caf').
 * @returns A Promise that resolves to a Blob containing the converted audio file.
 */
export const convertToAudioFormat = async (
  blob: Blob,
  outputFormat: 'm4a' | 'caf'
): Promise<Blob> => {
  if (!['m4a', 'caf'].includes(outputFormat)) {
    throw new Error('Invalid output format. Supported formats are: m4a, caf.');
  }

  try {
    console.log('====================================');
    console.log("Start");
    console.log('====================================');
    const ffmpeg = createFFmpeg({ log: true });
    if (!ffmpeg.isLoaded()) await ffmpeg.load();

    // Write the input Blob to FFmpeg's virtual filesystem
    ffmpeg.FS('writeFile', 'input.webm', await fetchFile(blob)); // Replace 'webm' with your input format

    // Run FFmpeg command to convert to desired format
    const outputFile = `output.${outputFormat}`;
    const args = [
      '-i', 'input.webm', // Input file
      '-c:a', 'aac', // AAC codec for m4a
      '-b:a', '128k', // Audio bitrate
      '-ar', '44100', // Audio sample rate
      outputFile,
    ];
    console.log("🚀 ~ outputFormat:", outputFormat)
    if (outputFormat === 'caf') {
      args.splice(3, 1); // Use default codec for CAF
    }
    await ffmpeg.run(...args);

    // Read the converted file
    const outputData = ffmpeg.FS('readFile', outputFile);
    console.log("🚀 ~ outputData:", outputData)
    return new Blob([outputData.buffer], { type: `audio/${outputFormat}` });
  } catch (error) {
    console.error('Audio conversion error:', error);
    throw new Error('Failed to convert audio to the specified format.');
  }
};
