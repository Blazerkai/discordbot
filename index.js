require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const Context = require('./utils/context');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath).filter((f) => f.endsWith('.js'))) {
  const command = require(path.join(commandsPath, file));
  const name = command.name || command.data?.name;
  if (name) client.commands.set(name, command);
}

const PREFIX = '!';

client.once('ready', () => {
  console.log(`🎰 Chaos Casino V2 is OPEN — logged in as ${client.user.tag}`);
  console.log(`🃏 Commands: ${[...client.commands.keys()].sort().join(', ')}`);
  console.log(`💡 Run "npm run deploy" once to register slash commands with Discord.`);
});

// Slash commands
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(new Context(interaction));
  } catch (error) {
    console.error(`[ERROR] /${interaction.commandName}:`, error.message);
    const errPayload = { content: '⚠️ Something went wrong. Please try again.', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errPayload).catch(() => {});
    } else {
      await interaction.reply(errPayload).catch(() => {});
    }
  }
});

// Prefix commands
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;
  const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName);
  if (!command) return;
  try {
    await command.execute(new Context(message, args));
  } catch (error) {
    console.error(`[ERROR] !${commandName}:`, error.message);
    await message.reply('⚠️ Something went wrong. Please try again.').catch(() => {});
  }
});

client.login(process.env.DISCORD_TOKEN);
