module.exports = {
  name: 'queue',
  async execute(message, args, client) {
    const queue = client.distube.getQueue(message);
    if (!queue) return message.channel.send('❌ Queue is empty!');
    const q = queue.songs
      .map((song, i) => `${i === 0 ? '▶️' : `${i}.`} ${song.name} (${song.formattedDuration})`)
      .join('\n');
    message.channel.send(`🎶 **Current Queue:**\n${q}`);
  }
};
