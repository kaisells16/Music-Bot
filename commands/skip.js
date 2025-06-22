module.exports = {
  name: 'skip',
  async execute(message, args, client) {
    const queue = client.distube.getQueue(message);
    if (!queue) return message.channel.send('❌ Nothing to skip!');
    queue.skip();
    message.channel.send('⏭️ Skipped to the next song!');
  }
};
