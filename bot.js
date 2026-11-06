const mineflayer = require('mineflayer');

const {
  MC_HOST,
  MC_PORT = '25565',
  MC_VERSION = '1.21.11',
  MC_PASSWORD,
  DURATION_SEC = '3',
  DEBUG,
} = process.env;

if (!MC_HOST) {
  console.error('MC_HOST is not set');
  process.exit(1);
}

const randomName = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_';
  const length = 3 + Math.floor(Math.random() * 14);
  let name = '';
  for (let i = 0; i < length; i++) {
    name += chars[Math.floor(Math.random() * chars.length)];
  }
  return name;
};

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
  username: randomName(),
  auth: 'offline',
  version: MC_VERSION || false,
  hideErrors: true,
});

const connectTimeout = setTimeout(() => finish(1, 'Timed out waiting to join'), 45_000);

bot.once('spawn', () => {
  clearTimeout(connectTimeout);
  console.log('Joined');

  if (MC_PASSWORD) {
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
  console.error(`Connection error: ${err.code || 'unknown'}`);
  if (DEBUG) console.error(err.message);
  finish(1);
});

bot.on('end', () => finish(finished ? 0 : 1, finished ? undefined : 'Disconnected early'));
