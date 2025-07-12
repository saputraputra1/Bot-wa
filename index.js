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

// Handler Otomatis
const handleGroup = require('./handler/group');
const messageFilter = require('./handler/messageFilter');

// Nomor Bot (tanpa input manual)
const BOT_NUMBER = '62895335107865';

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
    const { connection, lastDisconnect, isNewLogin } = update;
    const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;

    if (connection === 'close') {
      if (reason !== DisconnectReason.loggedOut) {
        console.log('⚠️ Koneksi terputus, mencoba ulang...');
        startBot();
      } else {
        console.log('🚪 Terlogout. Hapus folder "auth" untuk pairing ulang.');
      }
    }

    if (connection === 'connecting' && isNewLogin) {
      try {
        const pairingCode = await sock.requestPairingCode(BOT_NUMBER);
        console.log('\n✅ Kode Pairing Anda:\n🔗', pairingCode, '\nSilakan buka https://web.whatsapp.com dan masukkan kode tersebut.');
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
          try {
            await cmd.execute(sock, msg, args);
          } catch (err) {
            console.error(`❌ Error pada command .${command}:`, err.message);
          }
        }
      }
    }
  });
};

startBot();
