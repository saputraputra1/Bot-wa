module.exports = {
  command: 'requestsaldo',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const jumlah = parseInt(args[0]);

    if (!jumlah) return sock.sendMessage(from, { text: '❌ Contoh: .requestsaldo 50000' }, { quoted: msg });

    const admin = '628xxx@s.whatsapp.net'; // Ganti dengan nomor admin
    await sock.sendMessage(admin, {
      text: `📥 Permintaan saldo sebesar Rp${jumlah.toLocaleString()} dari @${sender.split('@')[0]}`,
      mentions: [sender]
    });

    await sock.sendMessage(from, { text: '✅ Permintaan saldo sudah dikirim ke admin.' }, { quoted: msg });
  }
};
