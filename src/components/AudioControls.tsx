import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Download } from 'lucide-react';
import { toast } from 'sonner';
import { convertToMp3 } from '@/utils/audioConverter';

interface AudioControlsProps {
  recording: { url: string; name: string; blob: Blob };
  isPlaying: boolean;
  onPlayPause: (url: string) => void;
  onPause: () => void;
}

const AudioControls: React.FC<AudioControlsProps> = ({
  recording,
  isPlaying,
  onPlayPause,
  onPause
}) => {
  const downloadRecording = async () => {
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
      toast.error('Error converting to MP3. Please try again.');
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={() => isPlaying ? onPause() : onPlayPause(recording.url)}
        variant="outline"
        size="icon"
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </Button>
      <Button
        onClick={downloadRecording}
        variant="outline"
        size="icon"
      >
        <Download className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default AudioControls;