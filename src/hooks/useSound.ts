import { useRef, useEffect } from 'react';

export const useSound = (soundSrc: string) => {
  // Store the Audio object in a ref so it persists across renders
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Pre-load the audio when the component using the hook mounts
  useEffect(() => {
    // Create the Audio object only once
    if (!audioRef.current) {
      audioRef.current = new Audio(soundSrc);
      audioRef.current.load(); // Explicitly tell the browser to start loading
    }
  }, [soundSrc]); // Re-run if the sound source changes

  const play = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Rewind to the start
      audioRef.current.play().catch(error => console.error("Audio playback failed:", error));
    }
  };

  return play;
};