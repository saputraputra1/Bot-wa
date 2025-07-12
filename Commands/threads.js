const axios = require('axios');

module.exports = {
  command: 'threads',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const url = args[0];

    if (!url || !url.includes('threads.net')) {
      await sock.sendMessage(from, { text: '❌ Contoh: .threads https://www.threads.net/xyz' }, { quoted: msg });
      return;
    }

    try {
      const res = await axios.get(`https://api.akuari.my.id/downloader/threads?link=${encodeURIComponent(url)}`);
      const result = res.data.result;

      if (!result?.media?.length) throw new Error('Media tidak ditemukan.');

      for (const media of result.media) {
        const ext = media.includes('.mp4') ? 'video' : 'image';
        await sock.sendMessage(from, { [ext]: { url: media } }, { quoted: msg });
      }

    } catch (err) {
      console.error(err);
      await sock.sendMessage(from, { text: '❌ Gagal mengambil media dari Threads.' }, { quoted: msg });
    }
  }
};
