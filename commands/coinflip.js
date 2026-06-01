const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser, addCoins, removeCoins, hasItem } = require('../utils/economy');
const { flipCoin } = require('../utils/games');

module.exports = {
  name: 'coinflip',
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Flip a coin — 50/50 chance to double your bet')
    .addStringOption((opt) =>
      opt.setName('side').setDescription('Pick a side').setRequired(true)
        .addChoices(
          { name: '🟡 Heads', value: 'heads' },
          { name: '⚪ Tails', value: 'tails' },
        )
    )
    .addIntegerOption((opt) =>
      opt.setName('amount').setDescription('Amount to bet').setRequired(true).setMinValue(1)
    ),
  async execute(ctx) {
    const side = ctx.getString('side', 0); // !coinflip heads 200 → args[0]=heads
    const amount = ctx.getInteger('amount', 1);

    if (!side || (side !== 'heads' && side !== 'tails') || !amount || amount <= 0) {
      return ctx.reply({ content: '❌ Usage: `!coinflip <heads/tails> <amount>` or `/coinflip`', ephemeral: true });
    }

    const userId = ctx.user.id;
    const user = getUser(userId);

    if (amount > user.coins) {
      return ctx.reply({
        content: `❌ You only have **${user.coins.toLocaleString()} coins**.`,
        ephemeral: true,
      });
    }

    const hasInsurance = hasItem(userId, 'insurance');
    const result = flipCoin();
    const won = result === side;
    const coinEmoji = result === 'heads' ? '🟡' : '⚪';

    if (won) {
      addCoins(userId, amount);
    } else {
      const loss = hasInsurance ? Math.floor(amount * 0.75) : amount;
      removeCoins(userId, loss);
    }

    const updated = getUser(userId);
    const lossAmt = hasInsurance ? Math.floor(amount * 0.75) : amount;

    const embed = new EmbedBuilder()
      .setTitle(`${coinEmoji} Coin Flip — ${result.toUpperCase()}`)
      .setColor(won ? 0x2ecc71 : 0xe74c3c)
      .addFields(
        { name: 'Your Pick', value: `**${side}**`, inline: true },
        { name: 'Result', value: `**${result}**`, inline: true },
        { name: won ? '🏆 Won!' : '💀 Lost', value: won
          ? `**+${amount.toLocaleString()} coins**`
          : `**-${lossAmt.toLocaleString()} coins**${hasInsurance ? ' 🛡️' : ''}`,
          inline: false,
        },
        { name: '💰 Balance', value: `**${updated.coins.toLocaleString()}** coins`, inline: false },
      )
      .setFooter({ text: '50/50 odds · Chaos Casino V2 🎰' });

    await ctx.reply({ embeds: [embed] });
  },
};
