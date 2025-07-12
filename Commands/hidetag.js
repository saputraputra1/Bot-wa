module.exports = {
  command: 'hidetag',
  groupOnly: true,
  adminOnly: true,
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const text = args.join(' ') || '(Kosong)';
    const metadata = await sock.groupMetadata(from);
    const member = metadata.participants.map(p => p.id);

    await sock.sendMessage(from, {
      text,
      mentions: member
    });
  }
};
