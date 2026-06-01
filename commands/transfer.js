const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { transfer } = require('../utils/economy');

module.exports = {
  name: 'transfer',
  data: new SlashCommandBuilder()
    .setName('transfer')
    .setDescription('Send coins to another player')
    .addUserOption((opt) =>
      opt.setName('user').setDescription('Player to send coins to').setRequired(true)
    )
    .addIntegerOption((opt) =>
      opt.setName('amount').setDescription('Amount to send').setRequired(true).setMinValue(1)
    ),
  async execute(ctx) {
    const target = ctx.getUser('user');
    const amount = ctx.getInteger('amount', 1); // args: ['<@id>', '200']

    if (!target || !amount || amount <= 0) {
      return ctx.reply({ content: '❌ Usage: `!transfer @user <amount>` or `/transfer`', ephemeral: true });
    }
    if (target.id === ctx.user.id) {
      return ctx.reply({ content: "❌ You can't transfer coins to yourself.", ephemeral: true });
    }
    if (target.bot) {
      return ctx.reply({ content: "❌ You can't transfer coins to a bot.", ephemeral: true });
    }

    try {
      const { from, to } = transfer(ctx.user.id, target.id, amount);
      const embed = new EmbedBuilder()
        .setTitle('💸 Transfer Complete')
        .setColor(0x9b59b6)
        .setDescription(`**${ctx.user.username}** sent **${amount.toLocaleString()} coins** to **${target.username}**!`)
        .addFields(
          { name: `${ctx.user.username}'s Wallet`, value: `**${from.coins.toLocaleString()}** coins`, inline: true },
          { name: `${target.username}'s Wallet`, value: `**${to.coins.toLocaleString()}** coins`, inline: true },
        )
        .setFooter({ text: 'Chaos Casino V2 🎰' });
      await ctx.reply({ embeds: [embed] });
    } catch {
      await ctx.reply({ content: "❌ You don't have enough coins in your wallet.", ephemeral: true });
    }
  },
};
