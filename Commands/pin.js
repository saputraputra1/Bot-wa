const axios = require('axios');

module.exports = {
  command: 'pin',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const url = args[0];

    if (!url || !url.includes('pinterest.')) {
      await sock.sendMessage(from, { text: '❌ Contoh: .pin https://www.pinterest.com/pin/xyz' }, { quoted: msg });
      return;
    }

    try {
      const res = await axios.get(`https://api.akuari.my.id/downloader/pinterestdl?link=${encodeURIComponent(url)}`);
      const result = res.data.result;

      if (!result || !result.url) throw new Error('Link tidak valid.');

      await sock.sendMessage(from, {
        image: { url: result.url },
        caption: '✅ Download dari Pinterest berhasil.'
      }, { quoted: msg });
    } catch (err) {
      console.error(err);
      await sock.sendMessage(from, { text: '❌ Gagal mengambil media dari Pinterest.' }, { quoted: msg });
    }
  }
};
