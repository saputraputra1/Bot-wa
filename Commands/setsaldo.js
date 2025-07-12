const { loadData, saveData } = require('../lib/simulasiDB');

module.exports = {
  command: 'setsaldo',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const admin = '6281234567890@s.whatsapp.net'; // GANTI dengan nomor kamu

    if (sender !== admin) {
      return sock.sendMessage(from, { text: '❌ Kamu bukan admin.' }, { quoted: msg });
    }

    const target = msg.message?.extendedTextMessage?.contextInfo?.participant;
    const amount = parseInt(args[0]);

    if (!target || isNaN(amount)) {
      return sock.sendMessage(from, {
        text: '❌ Format salah.\nBalas pesan user dengan: .setsaldo <jumlah>'
      }, { quoted: msg });
    }

    const db = loadData();
    db.users[target] = db.users[target] || { saldo: 0 };
    db.users[target].saldo = amount;
    saveData(db);

    await sock.sendMessage(from, {
      text: `✅ Saldo user @${target.split('@')[0]} di-set ke Rp${amount.toLocaleString()}`,
      mentions: [target]
    }, { quoted: msg });
  }
};
