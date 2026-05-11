export function useAudio() {
  function resetAudio(audioRef) {
    if (audioRef?.value) {
      audioRef.value.pause();
      audioRef.value.load();
    }
  }

  function playCurrent(audioRef) {
    if (audioRef?.value) {
      audioRef.value.play().catch(() => {
        // browser autoplay restrictions fallback
        // This will be handled by the component using this composable
      });
    }
  }

  return {
    resetAudio,
    playCurrent,
  };
}
