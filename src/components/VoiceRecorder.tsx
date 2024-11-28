import React, { useState, useRef } from 'react';
import { Mic, Square, Download, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import lamejs from 'lamejs';

const VoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<{ url: string; name: string; blob: Blob }[]>([]);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('Your browser does not support audio recording');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: false
      }).catch((err) => {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          toast.error('Microphone permission was denied. Please allow microphone access and try again.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          toast.error('No microphone found. Please connect a microphone and try again.');
        } else {
          toast.error('Error accessing microphone: ' + err.message);
        }
        throw err;
      });

      if (!stream) return;

      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
        setRecordings(prev => [...prev, { url, name: `Recording ${timestamp}`, blob }]);
        toast.success('Recording saved!');
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.success('Recording started!');
    } catch (error) {
      console.error('Recording error:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const convertToMp3 = async (blob: Blob): Promise<Blob> => {
    const audioContext = new AudioContext();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    const mp3Encoder = new lamejs.Mp3Encoder(1, audioBuffer.sampleRate, 128);
    const samples = new Int16Array(audioBuffer.length);
    const leftChannel = audioBuffer.getChannelData(0);
    
    // Convert Float32Array to Int16Array
    for (let i = 0; i < audioBuffer.length; i++) {
      samples[i] = leftChannel[i] < 0 ? leftChannel[i] * 0x8000 : leftChannel[i] * 0x7FFF;
    }
    
    const mp3Data = [];
    const blockSize = 1152;
    
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
    
    const mp3Blob = new Blob(mp3Data, { type: 'audio/mp3' });
    return mp3Blob;
  };

  const playRecording = (url: string) => {
    if (currentAudio) {
      currentAudio.pause();
      setIsPlaying(false);
    }
    
    const audio = new Audio(url);
    setCurrentAudio(audio);
    
    audio.onended = () => {
      setIsPlaying(false);
    };
    
    audio.play().catch(error => {
      toast.error('Error playing audio');
      console.error('Playback error:', error);
    });
    setIsPlaying(true);
  };

  const pausePlayback = () => {
    if (currentAudio) {
      currentAudio.pause();
      setIsPlaying(false);
    }
  };

  const downloadRecording = async (recording: { blob: Blob; name: string }) => {
    try {
      toast.info('Converting to MP3...');
      const mp3Blob = await convertToMp3(recording.blob);
      const url = URL.createObjectURL(mp3Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${recording.name}.mp3`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Download complete!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Error converting to MP3');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-primary mb-8 text-center">Voice Recorder</h1>
          
          <div className="flex justify-center mb-12">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-full flex items-center gap-2 text-lg"
              >
                <Mic className="w-6 h-6" />
                Start Recording
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                className="bg-destructive hover:bg-destructive/90 text-white px-6 py-3 rounded-full flex items-center gap-2 text-lg"
              >
                <Square className="w-6 h-6" />
                Stop Recording
              </Button>
            )}
          </div>

          {isRecording && (
            <div className="flex justify-center mb-8">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
            </div>
          )}

          <div className="space-y-4">
            {recordings.map((recording, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
              >
                <span className="text-gray-700 font-medium">{recording.name}</span>
                <div className="flex gap-2">
                  <Button
                    onClick={() => isPlaying ? pausePlayback() : playRecording(recording.url)}
                    variant="outline"
                    size="icon"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    onClick={() => downloadRecording(recording)}
                    variant="outline"
                    size="icon"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceRecorder;