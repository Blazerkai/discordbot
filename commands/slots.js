const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser, addCoins, removeCoins, hasItem } = require('../utils/economy');
const { spinSlots } = require('../utils/games');

module.exports = {
  name: 'slots',
  data: new SlashCommandBuilder()
    .setName('slots')
    .setDescription('Spin the slot machine — match symbols to win big')
    .addIntegerOption((opt) =>
      opt.setName('amount').setDescription('Amount to bet').setRequired(true).setMinValue(1)
    ),
  async execute(ctx) {
    const amount = ctx.getInteger('amount', 0);
    if (!amount || amount <= 0) {
      return ctx.reply({ content: '❌ Usage: `!slots <amount>` or `/slots`', ephemeral: true });
    }

    const userId = ctx.user.id;
    const user = getUser(userId);

    if (amount > user.coins) {
      return ctx.reply({
        content: `❌ You only have **${user.coins.toLocaleString()} coins**. Can't bet more than you own.`,
        ephemeral: true,
      });
    }

    const hasCharm = hasItem(userId, 'lucky_charm');
    const hasInsurance = hasItem(userId, 'insurance');
    const { emojis, multiplier, label, resultType } = spinSlots(hasCharm);

    let changeText;
    if (resultType === 'lose') {
      const loss = hasInsurance ? Math.floor(amount * 0.75) : amount;
      removeCoins(userId, loss);
      changeText = `**-${loss.toLocaleString()} coins**${hasInsurance ? ' 🛡️ (Insurance saved 25%)' : ''}`;
    } else {
      const winAmount = Math.floor(amount * multiplier);
      const profit = winAmount - amount;
      addCoins(userId, profit);
      changeText = `**+${profit.toLocaleString()} coins** (${winAmount.toLocaleString()} returned)`;
    }

    const updated = getUser(userId);
    const isWin = resultType !== 'lose';

    const embed = new EmbedBuilder()
      .setTitle('🎰 Slot Machine')
      .setColor(isWin ? 0x2ecc71 : 0xe74c3c)
      .setDescription(`┌──────────────────┐\n│  ${emojis.join('  ┃  ')}  │\n└──────────────────┘\n\n${label}`)
      .addFields(
        { name: isWin ? '🏆 Winnings' : '💸 Lost', value: changeText, inline: true },
        { name: '💰 Balance', value: `**${updated.coins.toLocaleString()}** coins`, inline: true },
      )
      .setFooter({ text: `Bet: ${amount.toLocaleString()}${hasCharm ? ' · 🍀 Lucky Charm' : ''}${hasInsurance ? ' · 🛡️ Insurance' : ''} · Chaos Casino V2 🎰` });

    await ctx.reply({ embeds: [embed] });
  },
};
