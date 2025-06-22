module.exports = {
  name: 'resume',
  async execute(message, args, client) {
    const queue = client.distube.getQueue(message);
    if (!queue) return message.channel.send('❌ Nothing is paused!');
    queue.resume();
    message.channel.send('▶️ Music resumed!');
  }
};
