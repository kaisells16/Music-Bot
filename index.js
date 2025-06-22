const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');

const PREFIX = '.'; // Custom command prefix

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Load commands
client.commands = new Collection();
['play', 'pause', 'resume', 'skip', 'queue', 'stop'].forEach(cmd => {
  client.commands.set(cmd, require(`./commands/${cmd}.js`));
});

// DisTube setup with Spotify support
const distube = new DisTube(client, {
  emitNewSongOnly: true,
  leaveOnEmpty: true,
  plugins: [new SpotifyPlugin()],
  youtubeDL: false
});

client.distube = distube;

// ✅ DisTube error handler
distube.on("error", (channel, error) => {
  console.error("❌ DisTube Error:", error);
  if (channel) channel.send("⚠️ Error while playing music.");
});

// Optional: Logs
distube.on("playSong", (queue, song) => {
  queue.textChannel.send(`🎶 Now Playing: **${song.name}** - \`${song.formattedDuration}\``);
});
distube.on("addSong", (queue, song) => {
  queue.textChannel.send(`✅ Added to queue: **${song.name}**`);
});
distube.on("finish", queue => {
  queue.textChannel.send("✅ Queue finished.");
});

// Handle messages
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
      message.channel.send("❌ There was an error executing that command.");
    }
  }
});

// ✅ Bot status rotation
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

client.login(process.env.DISCORD_TOKEN);
