const { loadData, saveData } = require('../lib/simulasiDB');

module.exports = {
  command: 'beli',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const buyer = msg.key.participant || msg.key.remoteJid;

    if (!args[0]) return sock.sendMessage(from, {
      text: '❌ Contoh: .beli <id_barang>'
    }, { quoted: msg });

    const id = parseInt(args[0]);
    const db = loadData();
    const item = db.items.find(x => x.id === id && !x.sold);

    if (!item) {
      return sock.sendMessage(from, {
        text: '❌ Barang tidak ditemukan atau sudah terjual'
      }, { quoted: msg });
    }

    // Inisialisasi user jika belum ada
    db.users[buyer] = db.users[buyer] || { saldo: 0 };
    db.users[item.seller] = db.users[item.seller] || { saldo: 0 };

    // Validasi saldo
    if (db.users[buyer].saldo < item.harga) {
      return sock.sendMessage(from, {
        text: `❌ Saldo kamu tidak cukup!\n💰 Saldo kamu: Rp${db.users[buyer].saldo.toLocaleString()}\n💸 Harga barang: Rp${item.harga.toLocaleString()}`
      }, { quoted: msg });
    }

    try {
      // Potong saldo buyer, transfer ke seller
      db.users[buyer].saldo -= item.harga;
      db.users[item.seller].saldo += item.harga;

      // Tandai barang terjual
      item.sold = true;
      item.buyer = buyer;

      saveData(db); // Simpan semua data

      // Kirim konfirmasi ke pembeli
      await sock.sendMessage(from, {
        text: `🎉 Barang *"${item.nama}"* berhasil dibeli seharga Rp${item.harga.toLocaleString()}`,
        image: Buffer.from(item.photo, 'base64')
      }, { quoted: msg });

      // Kirim notifikasi ke penjual
      await sock.sendMessage(item.seller, {
        text: `📦 Barang kamu *"${item.nama}"* telah dibeli oleh @${buyer.split('@')[0]}\n💰 Kamu menerima Rp${item.harga.toLocaleString()}`,
        mentions: [buyer]
      });

    } catch (err) {
      // Jika gagal di tengah jalan, refund saldo
      db.users[buyer].saldo += item.harga;
      db.users[item.seller].saldo -= item.harga;
      item.sold = false;
      item.buyer = null;
      saveData(db);

      await sock.sendMessage(from, {
        text: '❌ Terjadi kesalahan saat proses transaksi. Saldo kamu telah dikembalikan.'
      }, { quoted: msg });
    }
  }
};
