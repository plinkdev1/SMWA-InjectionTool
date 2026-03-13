/**
 * scripts/package-extension.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Packages the /extension directory into a distributable .zip file
 * suitable for Chrome Web Store upload or GitHub release attachment.
 *
 * USAGE:
 *   node scripts/package-extension.mjs
 *   → creates dist/smwa-injection-tool-extension-v1.0.0.zip
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { execSync }                     from 'child_process';
import { mkdirSync, existsSync }        from 'fs';
import { resolve, dirname }             from 'path';
import { fileURLToPath }                from 'url';

const __dir    = dirname(fileURLToPath(import.meta.url));
const ROOT     = resolve(__dir, '..');
const EXT_DIR  = resolve(ROOT, 'extension');
const DIST_DIR = resolve(ROOT, 'dist');
const VERSION  = '1.0.0';
const OUT_FILE = resolve(DIST_DIR, `smwa-injection-tool-extension-v${VERSION}.zip`);

mkdirSync(DIST_DIR, { recursive: true });

// Check if zip is available
let zipCmd;
try {
  execSync('zip --version', { stdio: 'ignore' });
  zipCmd = `cd "${EXT_DIR}" && zip -r "${OUT_FILE}" . -x "*.DS_Store" "*.map" "__MACOSX/*"`;
} catch (_) {
  // Fallback: use python zipfile
  zipCmd = `python3 -c "
import zipfile, os, sys
ext_dir = '${EXT_DIR}'
out = '${OUT_FILE}'
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(ext_dir):
        dirs[:] = [d for d in dirs if not d.startswith('.')]
        for file in files:
            if file.endswith('.map') or file.startswith('.'):
                continue
            fp = os.path.join(root, file)
            arcname = os.path.relpath(fp, ext_dir)
            zf.write(fp, arcname)
print('Zipped', out)
"`;
}

console.log('[package] Packaging extension...');
try {
  execSync(zipCmd, { stdio: 'inherit', timeout: 30000 });
  console.log(`[package] ✅ Created: dist/smwa-injection-tool-extension-v${VERSION}.zip`);
  console.log('\n[package] Upload to Chrome Web Store:');
  console.log('  https://chrome.google.com/webstore/devconsole');
  console.log('\n[package] Or attach to GitHub release:');
  console.log(`  git tag v${VERSION} && git push --tags`);
  console.log('  → upload the .zip as a release asset on GitHub');
} catch (e) {
  console.error('[package] ❌ Packaging failed:', e.message);
  process.exit(1);
}
