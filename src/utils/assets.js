const assets = import.meta.glob("../assets/**/*", {
  eager: true,
  query: "?url",
  import: "default",
});

export function getAssetUrl(path) {
  const normalizedPath = path.replace(/^\.?\//, "");
  const assetPath = `../assets/${normalizedPath}`;

  return assets[assetPath];
}
