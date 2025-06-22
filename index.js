const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 🎵 Initialize DisTube with Spotify (no API keys needed)
const distube = new DisTube(client, {
  emitNewSongOnly: true,
  leaveOnEmpty: true,
  plugins: [
    new SpotifyPlugin({
      parallel: true,
      emitEventsAfterFetching: true
    })
  ],
  youtubeDL: false
});

// ✅ On Ready
client.once('ready', () => {
  console.log(`${client.user.tag} is online!`);

  // Dynamic status showing total server count
  let statuses = [
    () => `🎧 In ${client.guilds.cache.size} servers`,
    () => `🎶 Aryan ki mom`
  ];
  let i = 0;
  setInterval(() => {
    client.user.setActivity(statuses[i % statuses.length](), {
      type: ActivityType.Playing
    });
    i++;
  }, 10000);
});

// 📥 On Message Command (Basic play support)
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;
  const prefix = '.';

  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  if (cmd === 'play') {
    if (!args.length) return message.channel.send('Please provide a song name or URL.');
    distube.play(message.member.voice.channel, args.join(' '), {
      textChannel: message.channel,
      member: message.member
    });
  }

  if (cmd === 'stop') {
    distube.stop(message);
    message.channel.send('⏹️ Music stopped!');
  }

  if (cmd === 'skip') {
    distube.skip(message);
    message.channel.send('⏭️ Skipped!');
  }
});

// 🪵 DisTube Events (optional)
distube
  .on('playSong', (queue, song) =>
    queue.textChannel.send(`▶️ Now playing: \`${song.name}\``)
  )
  .on('addSong', (queue, song) =>
    queue.textChannel.send(`➕ Added to queue: \`${song.name}\``)
  )
  .on('error', (channel, error) => {
    console.error(error);
    if (channel) channel.send(`❌ Error: \`${error.message}\``);
  });

client.login(process.env.DISCORD_TOKEN);
