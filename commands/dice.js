const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser, addCoins, removeCoins, hasItem } = require('../utils/economy');
const { rollDice, DICE_EMOJIS } = require('../utils/games');

module.exports = {
  name: 'dice',
  data: new SlashCommandBuilder()
    .setName('dice')
    .setDescription('Guess the dice roll — correct guess pays 6x your bet')
    .addIntegerOption((opt) =>
      opt.setName('number').setDescription('Your guess (1–6)').setRequired(true).setMinValue(1).setMaxValue(6)
    )
    .addIntegerOption((opt) =>
      opt.setName('amount').setDescription('Amount to bet').setRequired(true).setMinValue(1)
    ),
  async execute(ctx) {
    const guess = ctx.getInteger('number', 0); // !dice 4 200 → args[0]=4, args[1]=200
    const amount = ctx.getInteger('amount', 1);

    if (!guess || guess < 1 || guess > 6 || !amount || amount <= 0) {
      return ctx.reply({ content: '❌ Usage: `!dice <1-6> <amount>` or `/dice`', ephemeral: true });
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
    const roll = rollDice();
    const won = roll === guess;

    if (won) {
      addCoins(userId, amount * 5);
    } else {
      const loss = hasInsurance ? Math.floor(amount * 0.75) : amount;
      removeCoins(userId, loss);
    }

    const updated = getUser(userId);
    const lossAmt = hasInsurance ? Math.floor(amount * 0.75) : amount;

    const embed = new EmbedBuilder()
      .setTitle(`🎲 Dice Roll — ${DICE_EMOJIS[roll]}`)
      .setColor(won ? 0x2ecc71 : 0xe74c3c)
      .addFields(
        { name: 'Your Guess', value: `${DICE_EMOJIS[guess]} **${guess}**`, inline: true },
        { name: 'Rolled', value: `${DICE_EMOJIS[roll]} **${roll}**`, inline: true },
        { name: won ? '🏆 Won!' : '💀 Lost', value: won
          ? `**+${(amount * 5).toLocaleString()} coins** (6x payout)`
          : `**-${lossAmt.toLocaleString()} coins**${hasInsurance ? ' 🛡️' : ''}`,
          inline: false,
        },
        { name: '💰 Balance', value: `**${updated.coins.toLocaleString()}** coins`, inline: false },
      )
      .setFooter({ text: 'Correct guess = 6x payout · 1 in 6 chance · Chaos Casino V2 🎰' });

    await ctx.reply({ embeds: [embed] });
  },
};
