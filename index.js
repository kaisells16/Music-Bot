const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');

const PREFIX = '.'; // Custom prefix for commands

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Load command files
client.commands = new Collection();
['play', 'pause', 'resume', 'skip', 'queue', 'stop'].forEach(cmd => {
  client.commands.set(cmd, require(`./commands/${cmd}.js`));
});

// ✅ DisTube setup WITHOUT Spotify API
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

client.distube = distube;

// ✅ DisTube Error Handling
distube.on("error", (channel, error) => {
  console.error("❌ DisTube Error:", error);
  if (channel) channel.send("⚠️ Error while playing music.");
});

// Optional DisTube events
distube.on("playSong", (queue, song) => {
  queue.textChannel.send(`🎶 Now Playing: **${song.name}** - \`${song.formattedDuration}\``);
});
distube.on("addSong", (queue, song) => {
  queue.textChannel.send(`✅ Added to queue: **${song.name}**`);
});
distube.on("finish", queue => {
  queue.textChannel.send("✅ Queue finished.");
});

// Message Command Handler
client.on('messageCreate', async message => {
  if (!message.content.startsWith(PREFIX) || message.author.bot) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (command) {
    try {
      await command.execute(message, args, client);
    } catch (err) {
      console.error(err);
      message.channel.send("❌ Error while executing the command.");
    }
  }
});

// ✅ Rotating Playing Status
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  let index = 0;
  const statuses = [
    () => `Serving ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} users 👥`,
    () => 'Aryan ki mom 👀'
  ];

  setInterval(() => {
    const status = statuses[index % statuses.length]();
    client.user.setActivity(status, { type: 'PLAYING' });
    index++;
  }, 10000); // every 10 seconds
});

// 🔐 Login with environment variable
client.login(process.env.DISCORD_TOKEN);
