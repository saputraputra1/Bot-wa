
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const path = require('path');

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    browser: ['BotPtero', 'Chrome', 'Linux'],
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      if (reason === DisconnectReason.loggedOut) {
        console.log('❌ Session expired. Hapus folder auth/ untuk pairing ulang.');
        fs.rmSync('auth', { recursive: true, force: true });
      }
      console.log('🔁 Reconnecting...');
      start();
    }

    if (connection === 'open') {
      console.log('✅ Bot berhasil tersambung dan siap menerima command!');
    }

    if (qr) {
      const link = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qr)}`;
      console.log('📎 QR tersedia, buka dan scan:');
      console.log(link);
    }
  });

  // ⬇️ Auto-load semua file dari folder Commands
  const commands = new Map();
  fs.readdirSync('./Commands').forEach(file => {
    const cmdPath = path.join(__dirname, 'Commands', file);
    const cmd = require(cmdPath);
    if (cmd.name && typeof cmd.run === 'function') {
      commands.set(cmd.name.toLowerCase(), cmd.run);
    }
  });

  // ⬇️ Handler pesan
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    if (from.endsWith('@broadcast') || from.includes('newsletter') || from.includes('@status')) return;

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      '';

    if (!text) return;

    const args = text.trim().split(/ +/);
    const command = args[0].toLowerCase().replace('.', '');

    if (commands.has(command)) {
      try {
        await commands.get(command)(sock, msg, text);
      } catch (err) {
        console.log(`❌ Gagal jalankan command .${command}:`, err);
      }
    }
  });
}

start();
