const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('../utils/economy');

module.exports = {
  name: 'balance',
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your wallet, bank, and net worth'),
  async execute(ctx) {
    const user = getUser(ctx.user.id);
    const total = user.coins + user.bank;

    const embed = new EmbedBuilder()
      .setTitle(`💰 ${ctx.user.username}'s Account`)
      .setColor(0xf1c40f)
      .setThumbnail(ctx.user.displayAvatarURL())
      .addFields(
        { name: '👛 Wallet', value: `**${user.coins.toLocaleString()}** coins`, inline: true },
        { name: '🏦 Bank', value: `**${user.bank.toLocaleString()}** coins`, inline: true },
        { name: '💎 Net Worth', value: `**${total.toLocaleString()}** coins`, inline: false },
      )
      .setFooter({ text: 'Chaos Casino V2 🎰' })
      .setTimestamp();

    await ctx.reply({ embeds: [embed] });
  },
};
