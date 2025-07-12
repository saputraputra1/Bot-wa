const axios = require('axios');

module.exports = {
  command: 'tw',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const url = args[0];

    if (!url || !url.includes('twitter.com')) {
      await sock.sendMessage(from, { text: '❌ Contoh: .tw https://twitter.com/xyz/status/...' }, { quoted: msg });
      return;
    }

    try {
      const res = await axios.get(`https://api.akuari.my.id/downloader/twitter?link=${encodeURIComponent(url)}`);
      const media = res.data.result?.video || res.data.result?.images;

      if (!media) throw new Error('Media tidak ditemukan.');

      if (Array.isArray(media)) {
        for (const item of media) {
          await sock.sendMessage(from, { image: { url: item } }, { quoted: msg });
        }
      } else {
        await sock.sendMessage(from, {
          video: { url: media },
          caption: '✅ Video berhasil dari Twitter.'
        }, { quoted: msg });
      }

    } catch (err) {
      console.error(err);
      await sock.sendMessage(from, { text: '❌ Gagal mengambil media dari Twitter/X.' }, { quoted: msg });
    }
  }
};
