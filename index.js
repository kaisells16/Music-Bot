const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// Load prefix and commands
client.prefix = '.';
client.commands = new Collection();

// Load all command files
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// DisTube setup
client.distube = new DisTube(client, {
  leaveOnEmpty: true,
  emitNewSongOnly: true,
  plugins: [new SpotifyPlugin()]
});

// Music event logging (optional)
client.distube
  .on('playSong', (queue, song) => {
    queue.textChannel.send(`🎶 Now Playing: \`${song.name}\``);
  })
  .on('addSong', (queue, song) => {
    queue.textChannel.send(`➕ Added: \`${song.name}\``);
  });

// On message command handler
client.on('messageCreate', async (message) => {
  if (!message.content.startsWith(client.prefix) || message.author.bot) return;

  const args = message.content.slice(client.prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName);

  if (!command) return;

  try {
    command.execute(client, message, args);
  } catch (err) {
    console.error(err);
    message.reply('❌ Error executing command.');
  }
});

// Dynamic rotating bot status
client.on('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  const statuses = [
    `🎧 Users: ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)}`,
    `💿 Aryan ki mom`
  ];
  let i = 0;

  setInterval(() => {
    client.user.setActivity(statuses[i % statuses.length], { type: ActivityType.Playing });
    i++;
  }, 5000);
});

// Login with token from Render environment variable
client.login(process.env.DISCORD_TOKEN);
