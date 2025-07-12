// Commands/menu.js
module.exports = {
  name: 'menu',
  run: async (sock, msg, text) => {
    const menu = `
📜 *MENU BOT WHATSAPP* 
╭───────────────╮
│👮 *Grup Admin*
│• .kick @tag
│• .add 628xxx
│• .tagall
│• .hidetag
│
│🎵 *Downloader*
│• .yt <link>
│• .ig <link>
│• .tt <link>
│• .tw <link>
│• .fb <link>
│• .vk <link>
│• .threads <link>
│• .mediafire <link>
│
│🛒 *Simulasi Jual Beli*
│• .jual
│• .beli
│• .tawar
│• .listbarang
│• .pin
│
│🎮 *Tools*
│• .stiker
│• .toimg
│• .ping
╰───────────────╯
`.trim();

    await sock.sendMessage(msg.key.remoteJid, { text: menu }, { quoted: msg });
  }
};
