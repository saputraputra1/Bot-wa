const axios = require('axios');

module.exports = {
  command: 'vk',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const url = args[0];

    if (!url || !url.includes('vk.com')) {
      await sock.sendMessage(from, { text: '❌ Contoh: .vk https://vk.com/video/xyz' }, { quoted: msg });
      return;
    }

    try {
      const res = await axios.get(`https://api.akuari.my.id/downloader/vkdl?link=${encodeURIComponent(url)}`);
      const result = res.data.result;

      if (!result?.video) throw new Error('Video tidak tersedia.');

      await sock.sendMessage(from, {
        video: { url: result.video },
        caption: '✅ Video berhasil diunduh dari VK.'
      }, { quoted: msg });

    } catch (err) {
      console.error(err);
      await sock.sendMessage(from, { text: '❌ Gagal mengambil media dari VKontakte.' }, { quoted: msg });
    }
  }
};

