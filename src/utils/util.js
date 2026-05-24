export const isMobileContactDevice = () => {
  return window.matchMedia("(max-width: 870px), (pointer: coarse)").matches;
};