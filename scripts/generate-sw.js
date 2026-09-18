// Postbuild step: turns src/service-worker.js into a real, offline-capable
// service worker at build/service-worker.js, without ejecting Create React
// App.
//
// Why this is needed: react-scripts only bundles what src/index.js imports.
// src/service-worker.js is a separate entry point (it runs in the service
// worker thread, not the page), so react-scripts never sees it, and its
// `import ... from "workbox-*"` statements would be invalid inside a
// classic (non-module) service worker script as-is.
//
// So this script:
//   1. Bundles src/service-worker.js (and its workbox-* imports) into a
//      single flat script with esbuild, inlining `process.env.PUBLIC_URL`
//      the same way react-scripts resolves it (there's no real `process`
//      global inside a service worker, so this must happen at bundle time,
//      not at runtime).
//   2. Runs workbox-build's injectManifest on that bundled script, which
//      replaces the `self.__WB_MANIFEST` placeholder with the real list of
//      build output files (and their revision hashes) to precache.
//   3. Removes the intermediate bundle, leaving only the final
//      build/service-worker.js that serviceWorkerRegistration.js registers.
const fs = require("fs");
const path = require("path");
const esbuild = require("esbuild");
const { injectManifest } = require("workbox-build");
const getPublicUrlOrPath = require("react-dev-utils/getPublicUrlOrPath");

const config = require("../workbox-config.js");
const packageJson = require("../package.json");

const bundledSwPath = path.resolve(__dirname, "..", config.swSrc);

// Mirrors react-scripts' own PUBLIC_URL resolution (derived from the
// `homepage` field, e.g. "/single"), so cached URLs match the real deployed
// paths instead of a bare "/".
const publicUrl = getPublicUrlOrPath(
  process.env.NODE_ENV === "development",
  packageJson.homepage,
  process.env.PUBLIC_URL
).replace(/\/$/, "");

async function main() {
  await esbuild.build({
    entryPoints: [path.resolve(__dirname, "..", "src", "service-worker.js")],
    bundle: true,
    outfile: bundledSwPath,
    format: "iife",
    target: "es2018",
    minify: true,
    logLevel: "info",
    define: {
      "process.env.PUBLIC_URL": JSON.stringify(publicUrl),
      "process.env.NODE_ENV": JSON.stringify("production"),
    },
  });

  const { count, size, warnings } = await injectManifest(config);
  warnings.forEach((warning) => console.warn("[generate-sw]", warning));
  console.log(`[generate-sw] Precached ${count} files (${(size / 1024).toFixed(1)} KiB).`);

  fs.unlinkSync(bundledSwPath);
}

main().catch((error) => {
  console.error("[generate-sw] Failed to generate the service worker:", error);
  process.exit(1);
});
