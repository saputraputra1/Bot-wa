// === WhatsApp Bot Siap Jalan di Pterodactyl ===
// Menggunakan Baileys + Pairing Code


const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const pino = require('pino');
const path = require('path');
const readline = require('readline');

// Handler Otomatis
const handleGroup = require('./handler/group');
const messageFilter = require('./handler/messageFilter');

// Fungsi input terminal
const promptInput = (question) => new Promise((resolve) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question(question, (answer) => {
    rl.close();
    resolve(answer.trim());
  });
});

const startBot = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
    },
    logger: pino({ level: 'silent' }),
    browser: ['Bot WhatsApp', 'Chrome', '110.0']
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;

    if (connection === 'close') {
      if (reason !== DisconnectReason.loggedOut) {
        console.log('⚠️ Koneksi terputus, mencoba ulang...');
        startBot();
      } else {
        console.log('🚪 Terlogout. Hapus folder "auth" untuk pairing ulang.');
      }
    }

    if (connection === 'connecting') {
      try {
        const number = await promptInput('📲 Masukkan nomor Anda (format internasional, contoh: 628xxxx): ');
        const pairingCode = await sock.requestPairingCode(number);
        console.log('\n✅ Kode Pairing Anda:\n🔗', pairingCode, '\nSilakan buka https://web.whatsapp.com dan masukkan kode di sana.');
      } catch (err) {
        console.error('❌ Gagal mendapatkan pairing code:', err.message || err);
      }
    }

    if (connection === 'open') {
      console.log('✅ Bot berhasil tersambung dan siap digunakan!');
    }
  });

  sock.ev.on('creds.update', saveCreds);

  // Welcome / Leave
  sock.ev.on('group-participants.update', async update => {
    await handleGroup(sock, update);
  });

  // Filter Otomatis
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key?.fromMe) return;
    await messageFilter(sock, msg);
  });

  // Modular Command
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    const sender = msg.key.participant || msg.key.remoteJid;

    const command = body.startsWith('.') ? body.split(' ')[0].slice(1).toLowerCase() : '';
    const args = body.split(' ').slice(1);

    const commandsPath = path.join(__dirname, 'commands');
    if (fs.existsSync(commandsPath)) {
      const files = fs.readdirSync(commandsPath);
      for (const file of files) {
        const cmd = require(`./commands/${file}`);
        if (cmd.command === command) {
          await cmd.execute(sock, msg, args);
        }
      }
    }
  });
};

startBot();
