const { loadData, saveData } = require('../lib/simulasiDB');

module.exports = {
  command: 'beli',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const buyer = msg.key.participant || msg.key.remoteJid;

    if (!args[0]) return sock.sendMessage(from, { text: '❌ Contoh: .beli <id_barang>' }, { quoted: msg });

    const id = parseInt(args[0]);
    const db = loadData();
    const item = db.items.find(x => x.id === id && !x.sold);

    if (!item) return sock.sendMessage(from, { text: '❌ Barang tidak ditemukan atau sudah terjual' }, { quoted: msg });

    item.sold = true;
    saveData(db);

    await sock.sendMessage(from, {
      text: `🎉 Barang "${item.nama}" berhasil dibeli!`,
      image: Buffer.from(item.photo, 'base64')
    }, { quoted: msg });

    await sock.sendMessage(item.seller, {
      text: `📦 Barang kamu "${item.nama}" dibeli oleh @${buyer.split('@')[0]}`,
      mentions: [buyer]
    });
  }
};
