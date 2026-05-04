const assets = require.context("@/assets", true);

export function getAssetUrl(path) {
  const normalizedPath = path.startsWith("./") ? path : `./${path}`;

  return assets(normalizedPath);
}
