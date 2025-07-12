module.exports = {
  command: 'add',
  groupOnly: true,
  adminOnly: true,
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const number = args[0]?.replace(/[^0-9]/g, '');

    if (!number) {
      await sock.sendMessage(from, { text: '❌ Masukkan nomor yang ingin ditambahkan.\nContoh: .add 628xxxx' }, { quoted: msg });
      return;
    }

    try {
      await sock.groupParticipantsUpdate(from, [`${number}@s.whatsapp.net`], 'add');
      await sock.sendMessage(from, { text: `✅ Berhasil menambahkan @${number}`, mentions: [`${number}@s.whatsapp.net`] }, { quoted: msg });
    } catch {
      await sock.sendMessage(from, { text: '❌ Gagal menambahkan user ke grup.' }, { quoted: msg });
    }
  }
};

