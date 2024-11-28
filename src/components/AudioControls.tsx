import React from "react";
import {Button} from "@/components/ui/button";
import {Play, Pause, Download} from "lucide-react";
import {toast} from "sonner";
import {convertAudio} from "@/utils/audioConverter";
import {createAppleMusicWav} from "@/utils/convertToAppleMusicWav";
import {convertToAudioFormat} from "@/utils/convertToAudioFormat";

interface AudioControlsProps {
  recording: {url: string; name: string; blob: Blob};
  isPlaying: boolean;
  onPlayPause: (url: string) => void;
  onPause: () => void;
}

const AudioControls: React.FC<AudioControlsProps> = ({
  recording,
  isPlaying,
  onPlayPause,
  onPause,
}) => {
  const downloadRecording = async () => {
    try {
      toast.info("Converting to MP3...");
      console.log("🚀 ~ downloadRecording ~ recording.blob:", recording.blob);
      // const mp3Blob = await convertAudio(recording.blob, "wav");
      const mp3Blob = await convertToAudioFormat(recording.blob, "m4a");
      // const mp3Blob = await createAppleMusicWav(recording.blob);
      const url = URL.createObjectURL(mp3Blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${recording.name}.wav`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Download complete!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Error converting to MP3. Please try again.");
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={() => (isPlaying ? onPause() : onPlayPause(recording.url))}
        variant="outline"
        size="icon"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </Button>
      <Button onClick={downloadRecording} variant="outline" size="icon">
        <Download className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default AudioControls;
