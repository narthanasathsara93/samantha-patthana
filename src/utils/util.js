export const isMobileContactDevice = () => {
  return window.matchMedia("(max-width: 768px), (pointer: coarse)").matches;
};