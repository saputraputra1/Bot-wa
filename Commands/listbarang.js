const { loadData } = require('../lib/simulasiDB');

module.exports = {
  command: 'listbarang',
  async execute(sock, msg) {
    const from = msg.key.remoteJid;
    const db = loadData();
    const items = db.items.filter(x => !x.sold);

    if (!items.length) {
      return sock.sendMessage(from, { text: '📦 Tidak ada barang tersedia.' }, { quoted: msg });
    }

    let teks = '📦 Daftar Barang Tersedia:\n\n';
    for (const item of items) {
      teks += `🆔 ID: ${item.id}\n📌 ${item.nama} - Rp${item.harga.toLocaleString()}\n\n`;
    }

    sock.sendMessage(from, { text: teks }, { quoted: msg });
  }
};
