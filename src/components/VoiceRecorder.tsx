import React, { useState } from 'react';
import { Mic, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRecorder } from '@/hooks/useRecorder';
import AudioControls from './AudioControls';

const VoiceRecorder = () => {
  const { isRecording, recordings, startRecording, stopRecording } = useRecorder();
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

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
                <AudioControls
                  recording={recording}
                  isPlaying={isPlaying}
                  onPlayPause={playRecording}
                  onPause={pausePlayback}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceRecorder;