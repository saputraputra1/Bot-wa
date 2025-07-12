const { loadData, saveData } = require('../lib/simulasiDB');

module.exports = {
  command: 'jual',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    if (!args.length || !msg.message?.imageMessage) {
      return sock.sendMessage(from, {
        text: '❌ Kirim foto barang + caption: .jual <nama barang>|<harga>'
      }, { quoted: msg });
    }

    const [nama, harga] = args.join(' ').split('|');
    if (!nama || !harga) return sock.sendMessage(from, { text: '❌ Format salah. Contoh: .jual Mouse Logitech|50000' }, { quoted: msg });

    const media = await sock.downloadMediaMessage(msg, 'buffer');
    const item = {
      id: Date.now(),
      seller: sender,
      nama: nama.trim(),
      harga: parseInt(harga.trim()),
      photo: media.toString('base64'),
      sold: false
    };

    const db = loadData();
    db.items.push(item);
    saveData(db);

    await sock.sendMessage(from, {
      text: `✅ Barang "${item.nama}" dijual seharga Rp${item.harga.toLocaleString()}`,
      image: Buffer.from(item.photo, 'base64')
    }, { quoted: msg });
  }
};
