const axios = require('axios');

module.exports = {
  command: 'fb',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const url = args[0];

    if (!url || !url.includes('facebook.com')) {
      await sock.sendMessage(from, { text: '❌ Contoh: .fb https://www.facebook.com/video/xyz' }, { quoted: msg });
      return;
    }

    try {
      const res = await axios.get(`https://api.akuari.my.id/downloader/fbdl?link=${encodeURIComponent(url)}`);
      const result = res.data.result;

      if (!result || !result.video_hd) throw new Error('Video tidak ditemukan.');

      await sock.sendMessage(from, {
        video: { url: result.video_hd },
        caption: '✅ Video berhasil diunduh dari Facebook (HD).'
      }, { quoted: msg });

    } catch (err) {
      console.error(err);
      await sock.sendMessage(from, { text: '❌ Gagal mengunduh video dari Facebook.' }, { quoted: msg });
    }
  }
};
