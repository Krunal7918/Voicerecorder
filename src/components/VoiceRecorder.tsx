import React, { useState, useRef } from 'react';
import { Mic, Square, Download, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const VoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<{ url: string; name: string }[]>([]);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Using WAV format for better compatibility
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/wav'
      });
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
        setRecordings(prev => [...prev, { url, name: `Recording ${timestamp}` }]);
        toast.success('Recording saved!');
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      toast.error('Error accessing microphone');
      console.error('Error:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
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

  const downloadRecording = (url: string, name: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.wav`;
    a.click();
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
                    onClick={() => downloadRecording(recording.url, recording.name)}
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