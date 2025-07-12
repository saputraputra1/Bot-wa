const axios = require('axios');

module.exports = {
  command: 'mediafire',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const url = args[0];

    if (!url || !url.includes('mediafire.com')) {
      await sock.sendMessage(from, { text: '❌ Contoh: .mediafire https://www.mediafire.com/file/xyz' }, { quoted: msg });
      return;
    }

    try {
      const res = await axios.get(`https://api.akuari.my.id/downloader/mediafire?link=${encodeURIComponent(url)}`);
      const result = res.data.result;

      if (!result?.url) throw new Error('File tidak ditemukan.');

      await sock.sendMessage(from, {
        document: { url: result.url },
        mimetype: 'application/octet-stream',
        fileName: result.filename,
        caption: `✅ File dari MediaFire\n📦 ${result.filename}\n📁 Ukuran: ${result.size}`
      }, { quoted: msg });

    } catch (err) {
      console.error(err);
      await sock.sendMessage(from, { text: '❌ Gagal download file dari MediaFire.' }, { quoted: msg });
    }
  }
};
