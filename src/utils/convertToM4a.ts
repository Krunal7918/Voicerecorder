// import MP4Box from 'mp4box';

// /**
//  * Convert an audio Blob to M4A format using MP4Box.
//  * @param {Blob} audioBlob - The input audio Blob.
//  * @returns {Promise<Blob>} - A promise resolving to the converted M4A Blob.
//  */
// export default convertToM4a = async (audioBlob) => {
//     console.log("🚀 ~ convertToM4a ~ audioBlob:", audioBlob)
//     try {
//         // Step 1: Convert Blob to ArrayBuffer
//         const arrayBuffer = await blobToArrayBuffer(audioBlob);

//         // Step 2: Initialize MP4Box
//         const mp4box = MP4Box.createFile();

//         let m4aData = null;

//         // Step 3: Return a promise to handle asynchronous MP4Box processing
//         return new Promise((resolve, reject) => {
//             // MP4Box callback: when ready
//             mp4box.onReady = (info) => {
//                 console.log('MP4Box processing completed:', info);

//                 // Get the finalized M4A data
//                 m4aData = mp4box.flush();

//                 if (m4aData) {
//                     const m4aBlob = new Blob([m4aData], { type: 'audio/mp4' });
//                     resolve(m4aBlob); // Resolve with the M4A Blob
//                 } else {
//                     reject(new Error('Failed to generate M4A data.'));
//                 }
//             };

//             // MP4Box callback: on error
//             mp4box.onError = (error) => {
//                 console.error('MP4Box Error:', error);
//                 reject(new Error(`MP4Box processing error: ${error.message}`));
//             };

//             // Step 4: Add `fileStart` property to buffer and append
//             const bufferWithFileStart = {
//                 buffer: arrayBuffer,
//                 fileStart: 0, // File starts at the beginning
//             };



//             mp4box.appendBuffer(bufferWithFileStart); // Append the buffer to MP4Box
//         });
//     } catch (error) {
//         console.error('Error converting audio to M4A:', error);
//         throw new Error('M4A conversion failed.');
//     }
// };


// /**
//  * Utility function: Convert a Blob to ArrayBuffer.
//  * @param {Blob} blob - The input Blob.
//  * @returns {Promise<ArrayBuffer>} - The ArrayBuffer.
//  */
// const blobToArrayBuffer = (blob) => {
//     return new Promise((resolve, reject) => {
//         const reader = new FileReader();

//         reader.onloadend = () => {
//             if (reader.result) {
//                 resolve(reader.result);
//             } else {
//                 reject(new Error('FileReader failed to read the Blob.'));
//             }
//         };

//         reader.onerror = (error) => {
//             console.error('FileReader Error:', error);
//             reject(new Error('Failed to convert Blob to ArrayBuffer.'));
//         };

//         reader.readAsArrayBuffer(blob);
//     });
// };


// export const convertToM4A = async (audioBlob: Blob): Promise<Blob> => {
//     const audioContext = new (window.AudioContext)();

//     // Read the Blob as ArrayBuffer
//     const reader = new FileReader();

//     return new Promise((resolve, reject) => {
//         reader.onloadend = async () => {
//             try {
//                 // Decode audio data from ArrayBuffer to AudioBuffer
//                 const arrayBuffer = reader.result as ArrayBuffer;
//                 const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

//                 // Simulate the AAC encoding process
//                 // Here you'd replace this with your actual AAC encoding function
//                 const encodedAudioData = await encodeToAAC(audioBuffer);

//                 // Create a Blob from the encoded AAC data and set MIME type to 'audio/mp4' (M4A container)
//                 const m4aBlob = new Blob([encodedAudioData], { type: 'audio/mp4' });
//                 resolve(m4aBlob);
//             } catch (error) {
//                 reject('Error decoding audio data: ' + error);
//             }
//         };

//         // Start reading the Blob as an ArrayBuffer
//         reader.readAsArrayBuffer(audioBlob);
//     });
// };

// // Simulated AAC encoding function (replace with actual encoding logic)
// const encodeToAAC = async (audioBuffer: AudioBuffer): Promise<Uint8Array> => {
//     return new Promise((resolve) => {
//         // Simulate the encoding process (this is just a placeholder)
//         // In a real case, you could use an actual library or WebAssembly to encode the data
//         console.log('Encoding audio to AAC...');

//         setTimeout(() => {
//             // Returning simulated AAC data
//             resolve(new Uint8Array([/* Placeholder AAC data */]));
//         }, 1000); // Simulate encoding delay
//     });
// };

import ffmpeg from 'ffmpeg.js/ffmpeg-mp4.js';
export const convertToM4A = async (audioBlob: Blob): Promise<Blob> => {
    console.log("🚀 ~ convertToM4A ~ audioBlob:", audioBlob)
    const file = audioBlob;
    if (!file) return;

    try {
        // Initialize AudioContext
        const audioCtx: AudioContext = new (window.AudioContext)();

        // Convert Blob to ArrayBuffer
        const arrayBuffer = await audioBlob.arrayBuffer();
        console.log("🚀 ~ convertToM4A ~ arrayBuffer:", arrayBuffer)

        // Decode the audio data
        audioCtx.decodeAudioData(arrayBuffer, async (buffer) => {
            console.log("🚀 ~ audioCtx.decodeAudioData ~ buffer:", buffer)
            // Handle the decoded audio buffer here
            const audioSource = audioCtx.createBufferSource();
            audioSource.buffer = buffer;
            audioSource.connect(audioCtx.destination);
            audioSource.start();

            // Convert the decoded audio buffer to M4A format using ffmpeg.js
            // const ffmpeg = require('ffmpeg.js/ffmpeg-mp4.js');
            // console.log("🚀 ~ audioCtx.decodeAudioData ~ ffmpeg:", ffmpeg)

            const result = ffmpeg({
                MEMFS: [{ name: 'input.wav', data: arrayBuffer }],
                arguments: ['-i', 'input.wav', 'output.m4a'],
            });

            console.log("🚀 ~ audioCtx.decodeAudioData ~ result:", result)
            // Create a Blob from the output data
            const m4aBlob = new Blob([result.MEMFS[0].data], { type: 'audio/m4a' });
            console.log("🚀 ~ audioCtx.decodeAudioData ~ m4aBlob:", m4aBlob)
            const m4aUrl = URL.createObjectURL(m4aBlob);
            console.log("🚀 ~ audioCtx.decodeAudioData ~ m4aUrl:", m4aUrl)
            return m4aUrl;
            // Set the download link
            // (m4aUrl);
        }, (error) => {
            console.log("🚀 ~ audioCtx.decodeAudioData ~ error:", error)
            console.error('Error decoding audio data:', error);
        });
    } catch (error) {
        console.log("🚀 ~ convertToM4A ~ error:", error)
        console.error('Error processing file:', error);
    }
};