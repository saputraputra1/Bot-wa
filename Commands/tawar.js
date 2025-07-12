const { loadData } = require('../lib/simulasiDB');

module.exports = {
  command: 'tawar',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const id = parseInt(args[0]);
    const hargaBaru = parseInt(args[1]);

    const db = loadData();
    const item = db.items.find(x => x.id === id && !x.sold);

    if (!item) return sock.sendMessage(from, { text: '❌ Barang tidak ditemukan atau sudah terjual' }, { quoted: msg });

    await sock.sendMessage(item.seller, {
      text: `💬 @${sender.split('@')[0]} menawar barang "${item.nama}" seharga Rp${hargaBaru.toLocaleString()}\nGunakan .beli ${item.id} jika setuju.`,
      mentions: [sender]
    });

    await sock.sendMessage(from, { text: '✅ Tawar harga sudah dikirim ke penjual.' }, { quoted: msg });
  }
};
