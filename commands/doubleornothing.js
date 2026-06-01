const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser, addCoins, removeCoins, hasItem } = require('../utils/economy');
const { doubleOrNothing } = require('../utils/games');

const WIN_LINES = ['💥 DOUBLED!', '🔥 ALL IN — WON!', '🎉 DOUBLED UP!', '🤑 EASY MONEY!'];
const LOSE_LINES = ['💀 NOTHING.', '😮 GONE.', '🥶 WIPED OUT.', '☠️ HOUSE WINS.'];

module.exports = {
  name: 'doubleornothing',
  data: new SlashCommandBuilder()
    .setName('doubleornothing')
    .setDescription('50/50 — double your bet or lose it all')
    .addIntegerOption((opt) =>
      opt.setName('amount').setDescription('Amount to bet').setRequired(true).setMinValue(1)
    ),
  async execute(ctx) {
    const amount = ctx.getInteger('amount', 0);
    if (!amount || amount <= 0) {
      return ctx.reply({ content: '❌ Usage: `!doubleornothing <amount>` or `/doubleornothing`', ephemeral: true });
    }

    const userId = ctx.user.id;
    const user = getUser(userId);

    if (amount > user.coins) {
      return ctx.reply({
        content: `❌ You only have **${user.coins.toLocaleString()} coins**.`,
        ephemeral: true,
      });
    }

    const hasCharm = hasItem(userId, 'lucky_charm');
    const won = doubleOrNothing(hasCharm);

    if (won) {
      addCoins(userId, amount);
    } else {
      removeCoins(userId, amount);
    }

    const updated = getUser(userId);
    const lines = won ? WIN_LINES : LOSE_LINES;
    const title = lines[Math.floor(Math.random() * lines.length)];

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setColor(won ? 0x2ecc71 : 0xe74c3c)
      .setDescription(won
        ? `You risked **${amount.toLocaleString()} coins** and doubled it!`
        : `You risked **${amount.toLocaleString()} coins** and lost everything.`
      )
      .addFields(
        { name: won ? '🏆 Gained' : '💸 Lost', value: `**${amount.toLocaleString()} coins**`, inline: true },
        { name: '💰 Balance', value: `**${updated.coins.toLocaleString()} coins**`, inline: true },
      )
      .setFooter({ text: `50/50 odds${hasCharm ? ' · 🍀 +3% from Lucky Charm' : ''} · Chaos Casino V2 🎰` });

    await ctx.reply({ embeds: [embed] });
  },
};
