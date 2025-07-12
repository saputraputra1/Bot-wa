const db = require('../lib/database');

module.exports = async (sock, msg) => {
  try {
    const from = msg.key.remoteJid;
    const isGroup = from.endsWith('@g.us');
    if (!isGroup) return;

    const sender = msg.key.participant || msg.key.remoteJid;
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;

    // 🔗 Anti-Link
    if (db.antilink[from] && text?.match(/(https?:\/\/)?chat\.whatsapp\.com\//gi)) {
      await sock.sendMessage(from, { text: `🚫 Link grup terdeteksi, @${sender.split('@')[0]} dikeluarkan!`, mentions: [sender] });
      await sock.groupParticipantsUpdate(from, [sender], 'remove');
      return;
    }

    // 🧨 Anti-Virtex
    if (text?.length > 1000) {
      await sock.sendMessage(from, { text: `🚫 Pesan terlalu panjang, @${sender.split('@')[0]} dikeluarkan!`, mentions: [sender] });
      await sock.groupParticipantsUpdate(from, [sender], 'remove');
      return;
    }

    // ⚠️ Auto Warning
    db.warn[from] = db.warn[from] || {};
    db.warn[from][sender] = db.warn[from][sender] || 0;

    const bannedWords = ['anjing', 'kontol', 'tolol']; // bisa kamu tambah
    if (bannedWords.some(word => text?.toLowerCase().includes(word))) {
      db.warn[from][sender]++;
      const count = db.warn[from][sender];

      if (count >= 3) {
        await sock.sendMessage(from, { text: `🚫 @${sender.split('@')[0]} sudah melanggar 3x. Dikeluarkan.`, mentions: [sender] });
        await sock.groupParticipantsUpdate(from, [sender], 'remove');
      } else {
        await sock.sendMessage(from, { text: `⚠️ @${sender.split('@')[0]} diberi peringatan ke-${count}/3`, mentions: [sender] });
      }
    }

  } catch (e) {
    console.log('AutoProtect Error:', e);
  }
};

