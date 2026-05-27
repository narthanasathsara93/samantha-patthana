import fs from "node:fs/promises";
import path from "node:path";

const versionFilePath = path.resolve(process.cwd(), "public/version.json");
const args = new Set(process.argv.slice(2));

const now = new Date();
const year = String(now.getUTCFullYear());
const month = String(now.getUTCMonth() + 1).padStart(2, "0");
const day = String(now.getUTCDate()).padStart(2, "0");
const build = String(now.getUTCHours() * 60 + now.getUTCMinutes());
const nextVersion = `${year}.${month}.${day}.${build}`;

const forceReset = args.has("--force-reset");

const payload = {
  version: nextVersion,
  forceReset,
};

await fs.writeFile(versionFilePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

console.log(`[version] Updated ${versionFilePath}`);
console.log(`[version] version=${nextVersion}`);
console.log(`[version] forceReset=${forceReset}`);
