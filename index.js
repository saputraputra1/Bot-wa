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

// === Handler Otomatis
const handleGroup = require('./handler/group');
const messageFilter = require('./handler/messageFilter');

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

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, pairingCode } = update;
    if (connection === 'close') {
      if ((lastDisconnect.error = new Boom(lastDisconnect.error))?.output?.statusCode !== DisconnectReason.loggedOut) {
        startBot();
      }
    } else if (connection === 'open') {
      console.log('✅ Bot siap digunakan!');
    } else if (pairingCode) {
      console.log('🔗 Kode Pairing (scan di WA Web via kode):', pairingCode);
    }
  });

  sock.ev.on('creds.update', saveCreds);

  // === Event Welcome / Leave Otomatis
  sock.ev.on('group-participants.update', async update => {
    await handleGroup(sock, update);
  });

  // === Filter Otomatis (anti-link, virtex, warning)
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key?.fromMe) return;
    await messageFilter(sock, msg);
  });

  // === Perintah Command Modular
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    const sender = msg.key.participant || msg.key.remoteJid;

    const command = body.startsWith('.') ? body.split(' ')[0].slice(1).toLowerCase() : '';
    const args = body.split(' ').slice(1);

    // === LOAD COMMAND HANDLERS ===
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
