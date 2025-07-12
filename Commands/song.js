const axios = require('axios');

module.exports = {
  command: 'song',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const query = args.join(' ');

    if (!query) {
      await sock.sendMessage(from, { text: '❌ Contoh: .song alan walker faded' }, { quoted: msg });
      return;
    }

    try {
      const res = await axios.get(`https://api.akuari.my.id/downloader/lagu2?query=${encodeURIComponent(query)}`);
      const result = res.data.result;

      if (!result?.url) throw new Error('Lagu tidak ditemukan.');

      await sock.sendMessage(from, {
        audio: { url: result.url },
        mimetype: 'audio/mpeg',
        fileName: `${result.title}.mp3`
      }, { quoted: msg });

    } catch (err) {
      console.error(err);
      await sock.sendMessage(from, { text: '❌ Gagal mencari atau memutar lagu.' }, { quoted: msg });
    }
  }
};
