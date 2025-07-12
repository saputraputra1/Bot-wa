const { loadData } = require('../lib/simulasiDB');

module.exports = {
  command: 'datasaya',
  async execute(sock, msg) {
    const from = msg.key.remoteJid;
    const user = msg.key.participant || msg.key.remoteJid;

    const db = loadData();
    const saldo = db.users[user]?.saldo || 0;
    const jualanku = db.items.filter(x => x.seller === user);
    const belianku = db.items.filter(x => x.buyer === user);

    let teks = `📊 Data Kamu (@${user.split('@')[0]})\n`;
    teks += `💰 Saldo: Rp${saldo.toLocaleString()}\n\n`;

    teks += `📦 Barang Dijual (${jualanku.length}):\n`;
    jualanku.forEach(x => {
      teks += `- ${x.nama} [${x.sold ? '✅ Terjual' : '❌ Belum Terjual'}]\n`;
    });

    teks += `\n🛒 Barang Dibeli (${belianku.length}):\n`;
    belianku.forEach(x => {
      teks += `- ${x.nama} - Rp${x.harga.toLocaleString()}\n`;
    });

    await sock.sendMessage(from, { text: teks }, { quoted: msg });
  }
};
