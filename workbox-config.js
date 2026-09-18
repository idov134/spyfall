// Config for workbox-build's injectManifest, run by scripts/generate-sw.js
// after `react-scripts build`. This is what lets the service worker keep
// working without ejecting CRA: react-scripts never touches
// src/service-worker.js (it's not imported from src/index.js's module
// graph), so we bundle it ourselves (esbuild) and then inject the
// generated precache manifest into the bundled output.
module.exports = {
  // The already-esbuild-bundled service worker (see scripts/generate-sw.js).
  swSrc: "build/sw-bundled.js",
  swDest: "build/service-worker.js",
  globDirectory: "build",
  // Precache the entire game: JS/CSS bundles, the HTML shell, and every
  // icon/image/font so the app loads and functions fully offline after one
  // successful visit.
  globPatterns: ["**/*.{js,css,html,json,ico,png,jpg,jpeg,svg,gif,woff,woff2,ttf,eot}"],
  globIgnores: ["sw-bundled.js", "service-worker.js", "**/*.map"],
  // manifest.json's start_url is "." — make sure the generated manifest
  // entry for index.html matches how the app is actually requested.
  modifyURLPrefix: {},
};
