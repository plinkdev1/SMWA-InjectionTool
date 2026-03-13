#!/usr/bin/env node
/**
 * scripts/inject.mjs — ADB + Chrome DevTools Protocol Injector
 * ─────────────────────────────────────────────────────────────────────────────
 * Automates MWA injection via ADB + Chrome DevTools Protocol (CDP).
 * No manual console pasting required.
 *
 * USAGE:
 *   node scripts/inject.mjs                  # inject into first HTTPS tab
 *   node scripts/inject.mjs --list           # list open Chrome tabs
 *   node scripts/inject.mjs --tab 2          # inject into tab index 2
 *   node scripts/inject.mjs --url solana.com # inject into tab matching URL
 *   node scripts/inject.mjs --verbose        # show full CDP traffic
 *
 * PREREQUISITES:
 *   1. ADB installed (Android Platform Tools) and on PATH
 *   2. Android device connected via USB, USB debugging enabled
 *   3. Chrome open on device with at least one HTTPS tab
 *   (Port forwarding is handled automatically)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { execSync }   from 'child_process';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import http from 'http';

const __dir      = dirname(fileURLToPath(import.meta.url));
const PAYLOAD_JS = resolve(__dir, '../payload/mwa-inject.js');
const CDP_PORT   = 9222;
const CDP_HOST   = 'localhost';

// ── CLI ──────────────────────────────────────────────────────────────────────
const args     = process.argv.slice(2);
const VERBOSE  = args.includes('--verbose');
const LIST     = args.includes('--list');
const TAB_IDX  = args.includes('--tab')
  ? parseInt(args[args.indexOf('--tab') + 1], 10)
  : null;
const MATCH_URL = args.includes('--url')
  ? args[args.indexOf('--url') + 1]
  : null;

// ── Logging ──────────────────────────────────────────────────────────────────
const c = {
  reset: '\x1b[0m', purple: '\x1b[35m', green: '\x1b[32m',
  yellow: '\x1b[33m', red: '\x1b[31m',
};
const log  = (...a) => console.log(`${c.purple}[MWA-ADB]${c.reset}`, ...a);
const ok   = (...a) => console.log(`${c.green}[MWA-ADB] ✅${c.reset}`, ...a);
const warn = (...a) => console.warn(`${c.yellow}[MWA-ADB] ⚠️${c.reset}`, ...a);
const err  = (...a) => console.error(`${c.red}[MWA-ADB] ❌${c.reset}`, ...a);

// ── HTTP helper ───────────────────────────────────────────────────────────────
function httpGet(path) {
  return new Promise((res, rej) => {
    http.get({ host: CDP_HOST, port: CDP_PORT, path }, (r) => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } });
    }).on('error', rej);
  });
}

// ── CDP via WebSocket ─────────────────────────────────────────────────────────
function cdpExec(wsUrl, expression) {
  return new Promise((resolve, reject) => {
    const id  = 1;
    const msg = JSON.stringify({
      id, method: 'Runtime.evaluate',
      params: {
        expression,
        awaitPromise:  true,
        returnByValue: true,
      },
    });

    // Use python3 websocket as reliable cross-platform CDP client
    const pyScript = `
import asyncio, json, sys

async def run():
    try:
        import websockets
    except ImportError:
        print(json.dumps({"error": "pip install websockets"}))
        return
    async with websockets.connect(sys.argv[1]) as ws:
        await ws.send(sys.argv[2])
        while True:
            raw = await ws.recv()
            data = json.loads(raw)
            if data.get('id') == 1:
                print(json.dumps(data.get('result', {})))
                return

asyncio.run(run())
`.trim();

    try {
      const out = execSync(
        `python3 -c "${pyScript.replace(/\n/g, '; ').replace(/"/g, '\\"')}" "${wsUrl}" '${msg.replace(/'/g, "\\'")}'`,
        { timeout: 20000, encoding: 'utf8' }
      ).trim();
      if (VERBOSE) log('CDP raw result:', out.slice(0, 300));
      resolve(JSON.parse(out || '{}'));
    } catch (e) {
      reject(new Error('CDP exec failed: ' + e.message));
    }
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  log('MWA Injector — ADB Automation');
  log('='.repeat(40));

  // 1. Check ADB + device
  log('Step 1/4  Checking ADB and device...');
  try {
    const out     = execSync('adb devices', { timeout: 5000, encoding: 'utf8' });
    const devices = out.split('\n').filter(l => l.includes('\tdevice'));
    if (devices.length === 0) {
      err('No Android device detected by ADB.');
      err('  → Enable USB debugging: Settings → Developer Options → USB Debugging');
      err('  → Reconnect USB and run: adb devices');
      process.exit(1);
    }
    ok(`Device: ${devices[0].split('\t')[0].trim()}`);
  } catch (e) {
    err('adb not found:', e.message);
    err('Install: https://developer.android.com/tools/releases/platform-tools');
    process.exit(1);
  }

  // 2. Port forward
  log('Step 2/4  Port forwarding CDP...');
  try {
    execSync(`adb forward tcp:${CDP_PORT} localabstract:chrome_devtools_remote`, { timeout: 5000 });
    ok(`localhost:${CDP_PORT} → Android Chrome DevTools`);
  } catch (e) {
    err('Port forward failed:', e.message);
    err('Is Chrome open on the Android device?');
    process.exit(1);
  }

  // 3. Get tab list
  log('Step 3/4  Fetching tab list...');
  let tabs;
  try {
    const all = await httpGet('/json');
    tabs = all.filter(t => t.type === 'page' && t.url?.startsWith('https://'));
  } catch (e) {
    err('Cannot reach Chrome DevTools:', e.message);
    err('Make sure Chrome is in the foreground on the device.');
    process.exit(1);
  }

  if (tabs.length === 0) {
    err('No HTTPS tabs found. Open a Solana dApp (must be HTTPS) first.');
    process.exit(1);
  }

  console.log('');
  log(`Found ${tabs.length} HTTPS tab(s):`);
  tabs.forEach((t, i) => {
    const mark = i === 0 ? '  ← will use by default' : '';
    console.log(`  [${i}] ${(t.title || 'Untitled').slice(0, 55)}${mark}`);
    console.log(`      ${(t.url || '').slice(0, 70)}`);
  });
  console.log('');

  if (LIST) { log('(--list mode, done)'); return; }

  // 4. Select tab
  let target = tabs[0];
  if (TAB_IDX !== null) {
    if (TAB_IDX < 0 || TAB_IDX >= tabs.length) {
      err(`--tab ${TAB_IDX} is out of range (0–${tabs.length - 1})`);
      process.exit(1);
    }
    target = tabs[TAB_IDX];
  } else if (MATCH_URL) {
    const found = tabs.find(t => t.url?.includes(MATCH_URL));
    if (!found) {
      warn(`No tab matched --url "${MATCH_URL}", using first tab.`);
    } else {
      target = found;
    }
  }

  log('Step 4/4  Injecting into:');
  log(`  Title: ${target.title}`);
  log(`  URL:   ${target.url}`);

  // Load payload
  let payload;
  try {
    payload = readFileSync(PAYLOAD_JS, 'utf8');
    ok(`Payload loaded: ${payload.length.toLocaleString()} chars`);
  } catch (e) {
    err('Could not read payload:', e.message);
    process.exit(1);
  }

  // Execute via CDP
  log('Executing via CDP Runtime.evaluate...');
  try {
    const cdpResult = await cdpExec(target.webSocketDebuggerUrl, payload);
    const mwa = cdpResult?.result?.value ?? cdpResult?.value;

    if (mwa?.registered) {
      console.log('');
      ok('━'.repeat(42));
      ok('MWA wallet injected successfully!');
      ok(`Package:  wallet-standard-mobile@${mwa.version}`);
      ok(`Type:     ${mwa.walletType}`);
      ok(`Android:  ${mwa.isAndroid}`);
      ok('Open the dApp wallet picker → "Mobile Wallet Adapter"');
      ok('━'.repeat(42));
    } else if (mwa?.error) {
      err('Injection failed:', mwa.error);
      process.exit(1);
    } else {
      warn('Payload executed. Check DevTools on device for output.');
      warn('window.__mwa should contain the result.');
      if (VERBOSE) log('Raw CDP:', JSON.stringify(cdpResult, null, 2));
    }
  } catch (e) {
    err('CDP execution error:', e.message);
    if (e.message.includes('websockets')) {
      err('Install websockets for Python: pip install websockets');
    }
    process.exit(1);
  }
}

main().catch(e => { err('Fatal:', e.message); process.exit(1); });
