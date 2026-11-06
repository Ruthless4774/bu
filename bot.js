// Joins a cracked (offline-mode) Minecraft server, stays briefly, then leaves.
// Built for public repos: never logs the host, port, chat, or kick text.

const mineflayer = require('mineflayer');

const {
  MC_HOST,
  MC_PORT = '25565',
  MC_USERNAME = 'ActionsBot',
  MC_VERSION,
  MC_PASSWORD,            // optional: AuthMe-style /login (keep in secrets)
  DURATION_SEC = '3',     // seconds to stay after spawning
  DEBUG,                  // set to "1" to print kick reasons / error messages
} = process.env;

if (!MC_HOST) {
  console.error('MC_HOST is not set');
  process.exit(1);
}

let finished = false;
const finish = (code, msg) => {
  if (finished) return;
  finished = true;
  if (msg) console.log(msg);
  try { bot.quit(); } catch {}
  setTimeout(() => process.exit(code), 500);
};

const bot = mineflayer.createBot({
  host: MC_HOST,
  port: parseInt(MC_PORT, 10),
  username: MC_USERNAME,
  auth: 'offline',               // cracked
  version: MC_VERSION || false,  // false = auto-detect
  hideErrors: true,
});

// Safety net in case we never manage to spawn
const connectTimeout = setTimeout(() => finish(1, 'Timed out waiting to join'), 45_000);

bot.once('spawn', () => {
  clearTimeout(connectTimeout);
  console.log('Joined');

  if (MC_PASSWORD) {
    // Works with common AuthMe setups; harmless if the server ignores it
    setTimeout(() => bot.chat(`/login ${MC_PASSWORD}`), 500);
  }

  setTimeout(() => finish(0, 'Done, leaving'), parseInt(DURATION_SEC, 10) * 1000);
});

bot.on('kicked', (reason) => {
  console.error('Kicked from server');
  if (DEBUG) console.error(typeof reason === 'string' ? reason : JSON.stringify(reason));
  finish(1);
});

bot.on('error', (err) => {
  // err.message often contains host:port, so only print the code unless DEBUG
  console.error(`Connection error: ${err.code || 'unknown'}`);
  if (DEBUG) console.error(err.message);
  finish(1);
});

bot.on('end', () => finish(finished ? 0 : 1, finished ? undefined : 'Disconnected early'));
