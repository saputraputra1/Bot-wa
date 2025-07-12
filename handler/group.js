const db = require('../lib/database');

module.exports = async (sock, update) => {
  const { id, participants, action } = update;

  if (!db.welcome[id]) return;

  for (const user of participants) {
    if (action === 'add') {
      await sock.sendMessage(id, { text: `👋 Selamat datang @${user.split('@')[0]} di grup ini.`, mentions: [user] });
    } else if (action === 'remove') {
      await sock.sendMessage(id, { text: `👋 Selamat tinggal @${user.split('@')[0]}.`, mentions: [user] });
    }
  }
};
