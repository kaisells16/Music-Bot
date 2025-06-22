const { Client, GatewayIntentBits, ActivityType } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  // Rotate bot status between user count and funny line
  let statuses = [
    `👥 Users: ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)}`,
    `👑 Aryan ki mom`
  ];
  let i = 0;

  setInterval(() => {
    client.user.setActivity(statuses[i % statuses.length], {
      type: ActivityType.Playing
    });
    i++;
  }, 5000); // rotates every 5 seconds
});

// Login using token from Render environment variable
client.login(process.env.DISCORD_TOKEN);
