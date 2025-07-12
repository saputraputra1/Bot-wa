module.exports = {
  command: 'tagall',
  groupOnly: true,
  adminOnly: true,
  async execute(sock, msg) {
    const from = msg.key.remoteJid;
    const metadata = await sock.groupMetadata(from);
    const teks = metadata.participants.map(p => `@${p.id.split('@')[0]}`).join(' ');

    await sock.sendMessage(from, { text: teks, mentions: metadata.participants.map(p => p.id) }, { quoted: msg });
  }
};
