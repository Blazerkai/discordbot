const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { deposit } = require('../utils/economy');

module.exports = {
  name: 'deposit',
  data: new SlashCommandBuilder()
    .setName('deposit')
    .setDescription('Move coins from your wallet into your bank')
    .addIntegerOption((opt) =>
      opt.setName('amount').setDescription('Amount to deposit').setRequired(true).setMinValue(1)
    ),
  async execute(ctx) {
    const amount = ctx.getInteger('amount', 0);
    if (!amount || amount <= 0) {
      return ctx.reply({ content: '❌ Usage: `!deposit <amount>` or `/deposit`', ephemeral: true });
    }

    try {
      const user = deposit(ctx.user.id, amount);
      const embed = new EmbedBuilder()
        .setTitle('🏦 Deposit Successful')
        .setColor(0x3498db)
        .addFields(
          { name: '📥 Deposited', value: `**${amount.toLocaleString()}** coins`, inline: true },
          { name: '👛 Wallet', value: `**${user.coins.toLocaleString()}** coins`, inline: true },
          { name: '🏦 Bank', value: `**${user.bank.toLocaleString()}** coins`, inline: true },
        )
        .setFooter({ text: 'Bank coins are safe from gambling & robbery • Chaos Casino V2 🎰' });
      await ctx.reply({ embeds: [embed] });
    } catch {
      await ctx.reply({ content: "❌ You don't have enough coins in your wallet.", ephemeral: true });
    }
  },
};
