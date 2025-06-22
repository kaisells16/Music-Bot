module.exports = {
  name: 'play',
  async execute(message, args, client) {
    const song = args.join(' ');
    if (!song) return message.channel.send('❌ Please provide a song name or link!');
    if (!message.member.voice.channel) return message.channel.send('🎧 Join a voice channel first!');
    client.distube.play(message.member.voice.channel, song, {
      member: message.member,
      textChannel: message.channel,
      message
    });
  }
};
