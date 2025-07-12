const axios = require('axios');

module.exports = {
  command: 'ig',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const url = args[0];

    if (!url || !url.includes('instagram.com')) {
      await sock.sendMessage(from, { text: '❌ Contoh: .ig https://www.instagram.com/reel/xyz' }, { quoted: msg });
      return;
    }

    try {
      const res = await axios.get(`https://api.akuari.my.id/downloader/igdl?link=${encodeURIComponent(url)}`);
      const media = res.data.result;

      if (!media || media.length === 0) {
        throw new Error('Media tidak ditemukan.');
      }

      for (const item of media) {
        const ext = item.includes('.mp4') ? 'video' : 'image';
        await sock.sendMessage(from, { [ext]: { url: item } }, { quoted: msg });
      }
    } catch (err) {
      console.error(err);
      await sock.sendMessage(from, { text: '❌ Gagal mengambil media Instagram.' }, { quoted: msg });
    }
  }
};
