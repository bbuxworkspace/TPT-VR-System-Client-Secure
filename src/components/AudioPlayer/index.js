// AudioPlayer.js
import React, { useRef, useState, useEffect } from 'react';

const AudioPlayer = ({ url, isPlaying, onEnded }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  return (
    <audio
      ref={audioRef}
      src={url}
      onEnded={onEnded}
      preload="auto"
      id="audioPlayer" // Set the ID here

    />
  );
};

export default AudioPlayer;