const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();
['play', 'pause', 'resume', 'skip', 'queue', 'stop'].forEach(cmd => {
  client.commands.set(cmd, require(`./commands/${cmd}.js`));
});

const distube = new DisTube(client, {
  emitNewSongOnly: true,
  leaveOnEmpty: true,
  plugins: [new SpotifyPlugin()]
});

client.distube = distube;

client.on('messageCreate', async message => {
  if (!message.content.startsWith('!') || message.author.bot) return;

  const args = message.content.slice(1).split(/ +/);
  const command = args.shift().toLowerCase();

  if (client.commands.has(command)) {
    client.commands.get(command).execute(message, args, client);
  }
});

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// 🔐 Use environment variable directly
client.login(process.env.DISCORD_TOKEN);
