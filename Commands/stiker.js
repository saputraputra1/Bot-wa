const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
  command: 'stiker',
  async execute(sock, msg) {
    const from = msg.key.remoteJid;

    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const hasImage = msg.message?.imageMessage || quoted?.imageMessage;

    if (!hasImage) {
      return sock.sendMessage(from, { text: '❌ Kirim atau balas gambar dengan .stiker' }, { quoted: msg });
    }

    const mediaMsg = quoted?.imageMessage ? { message: quoted } : msg;
    const buffer = await downloadMediaMessage(mediaMsg, 'buffer', {}, {
      logger: undefined,
      reuploadRequest: sock.updateMediaMessage,
    });

    await sock.sendMessage(from, { sticker: buffer }, { quoted: msg });
  }
};
