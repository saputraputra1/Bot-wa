const ytdl = require('ytdl-core');
const { downloadContentFromMessage, proto } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { exec } = require('child_process');

module.exports = {
  command: 'yt',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const url = args[0];

    if (!url || !url.startsWith('http')) {
      await sock.sendMessage(from, { text: '❌ Contoh: .yt https://youtube.com/...' }, { quoted: msg });
      return;
    }

    try {
      const info = await ytdl.getInfo(url);
      const title = info.videoDetails.title;

      const videoPath = path.join(__dirname, '../temp', `${Date.now()}.mp4`);
      const stream = ytdl(url, { quality: '18' }).pipe(fs.createWriteStream(videoPath));

      stream.on('finish', async () => {
        const buffer = fs.readFileSync(videoPath);
        await sock.sendMessage(from, {
          video: buffer,
          mimetype: 'video/mp4',
          caption: `✅ *${title}*\nSukses download dari YouTube`
        }, { quoted: msg });
        fs.unlinkSync(videoPath);
      });

    } catch (err) {
      console.error(err);
      await sock.sendMessage(from, { text: '❌ Gagal mendownload video.' }, { quoted: msg });
    }
  }
};
