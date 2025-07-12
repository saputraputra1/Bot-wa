const axios = require('axios');

module.exports = {
  command: 'tt',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const url = args[0];

    if (!url || !url.includes('tiktok.com')) {
      await sock.sendMessage(from, { text: '❌ Contoh: .tt https://www.tiktok.com/@user/video/xyz' }, { quoted: msg });
      return;
    }

    try {
      const res = await axios.get(`https://api.akuari.my.id/downloader/tiktok?link=${encodeURIComponent(url)}`);
      const result = res.data.result;

      if (!result?.nowm) throw new Error('Video tidak ditemukan.');

      await sock.sendMessage(from, {
        video: { url: result.nowm },
        caption: '✅ Berhasil ambil video TikTok tanpa watermark.'
      }, { quoted: msg });
    } catch (err) {
      console.error(err);
      await sock.sendMessage(from, { text: '❌ Gagal download video dari TikTok.' }, { quoted: msg });
    }
  }
};
