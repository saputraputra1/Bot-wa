const { writeFileSync, unlinkSync } = require('fs');
const path = require('path');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
  command: 'toimg',
  async execute(sock, msg) {
    const from = msg.key.remoteJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quoted || !quoted.stickerMessage) {
      return sock.sendMessage(from, { text: '❌ Balas stiker dengan command .toimg' }, { quoted: msg });
    }

    const media = await downloadMediaMessage(
      { message: quoted },
      'buffer',
      {},
      { logger: undefined, reuploadRequest: sock.updateMediaMessage }
    );

    const filePath = path.join(__dirname, '../temp', `img-${Date.now()}.webp`);
    writeFileSync(filePath, media);

    const webp2png = require('webp-converter'); // Pastikan terinstall
    const output = filePath.replace('.webp', '.png');

    await webp2png.dwebp(filePath, output, '-o');
    const image = require('fs').readFileSync(output);

    await sock.sendMessage(from, { image }, { quoted: msg });

    unlinkSync(filePath);
    unlinkSync(output);
  }
};
