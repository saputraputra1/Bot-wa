module.exports = {
  command: 'kick',
  groupOnly: true,
  adminOnly: true,
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;

    if (!msg.message.extendedTextMessage?.mentionedJid?.length) {
      await sock.sendMessage(from, { text: '❌ Tag member yang ingin di-kick.\nContoh: .kick @user' }, { quoted: msg });
      return;
    }

    const target = msg.message.extendedTextMessage.mentionedJid;
    await sock.groupParticipantsUpdate(from, target, 'remove');
    await sock.sendMessage(from, { text: '✅ Member berhasil di-kick.' }, { quoted: msg });
  }
};
