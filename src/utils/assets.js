const assets = require.context("@/assets", true);

export function getAssetUrl(path) {
  const normalizedPath = path.startsWith("./") ? path : `./${path}`;

  return assets(normalizedPath);
}


export const isMobileContactDevice = () => {
  return window.matchMedia("(max-width: 768px), (pointer: coarse)").matches;
};
