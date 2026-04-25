import { ref } from 'vue'

export function useAutoplay(playCurrent) {
  const isAutoPlaying = ref(false)

  function toggleAutoplay(audioRef) {
    isAutoPlaying.value = !isAutoPlaying.value

    if (isAutoPlaying.value) {
      playCurrent(audioRef)
    } else {
      // Stop currently playing audio when disabling autoplay
      if (audioRef?.value) {
        audioRef.value.pause()
      }
    }
  }

  function onAudioEnded(nextFunc, lessonsLength, currentIndex, audioRef) {
    if (!isAutoPlaying.value) return

    if (currentIndex.value < lessonsLength - 1) {
      nextFunc()

      // wait for DOM/audio to update
      setTimeout(() => {
        playCurrent(audioRef)
      }, 200)
    } else {
      // reached end → stop autoplay
      isAutoPlaying.value = false
    }
  }

  return {
    isAutoPlaying,
    toggleAutoplay,
    onAudioEnded
  }
}