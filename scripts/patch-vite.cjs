const fs = require('fs');
const path = require('path');

const filesToPatch = [
  'node_modules/vite/dist/client/client.mjs',
  'node_modules/vite/dist/client/bundledDevClient.mjs',
  'node_modules/vite/dist/node/module-runner.js',
];

for (const relPath of filesToPatch) {
  const fullPath = path.resolve(__dirname, '..', relPath);
  if (!fs.existsSync(fullPath)) continue;

  let content = fs.readFileSync(fullPath, 'utf8');
  if (content.includes('ws.send(JSON.stringify(data));')) {
    content = content.replace(
      'ws.send(JSON.stringify(data));',
      'if (ws && typeof ws.send === "function" && ws.readyState === ws.OPEN) { ws.send(JSON.stringify(data)); }'
    );
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`[patch-vite] Patched ${relPath}`);
  }
}
