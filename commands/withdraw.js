const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { withdraw } = require('../utils/economy');

module.exports = {
  name: 'withdraw',
  data: new SlashCommandBuilder()
    .setName('withdraw')
    .setDescription('Move coins from your bank to your wallet')
    .addIntegerOption((opt) =>
      opt.setName('amount').setDescription('Amount to withdraw').setRequired(true).setMinValue(1)
    ),
  async execute(ctx) {
    const amount = ctx.getInteger('amount', 0);
    if (!amount || amount <= 0) {
      return ctx.reply({ content: '❌ Usage: `!withdraw <amount>` or `/withdraw`', ephemeral: true });
    }

    try {
      const user = withdraw(ctx.user.id, amount);
      const embed = new EmbedBuilder()
        .setTitle('🏦 Withdrawal Successful')
        .setColor(0x3498db)
        .addFields(
          { name: '📤 Withdrawn', value: `**${amount.toLocaleString()}** coins`, inline: true },
          { name: '👛 Wallet', value: `**${user.coins.toLocaleString()}** coins`, inline: true },
          { name: '🏦 Bank', value: `**${user.bank.toLocaleString()}** coins`, inline: true },
        )
        .setFooter({ text: 'Chaos Casino V2 🎰' });
      await ctx.reply({ embeds: [embed] });
    } catch {
      await ctx.reply({ content: "❌ You don't have enough coins in your bank.", ephemeral: true });
    }
  },
};
