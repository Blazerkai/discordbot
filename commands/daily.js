const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser, addCoins, setLastDaily, hasItem, removeItem } = require('../utils/economy');

const BASE_REWARD = 500;
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

function formatTimeLeft(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

module.exports = {
  name: 'daily',
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim your daily 500 coin reward (24h cooldown)'),
  async execute(ctx) {
    const userId = ctx.user.id;
    const user = getUser(userId);
    const now = Date.now();

    if (user.lastDaily && now - user.lastDaily < COOLDOWN_MS) {
      const left = COOLDOWN_MS - (now - user.lastDaily);
      const embed = new EmbedBuilder()
        .setTitle('⏳ Already Claimed')
        .setColor(0xe74c3c)
        .setDescription(`Come back in **${formatTimeLeft(left)}**.`)
        .setFooter({ text: 'Chaos Casino V2 🎰' });
      return ctx.reply({ embeds: [embed], ephemeral: true });
    }

    const hasMultiplier = hasItem(userId, 'multiplier_x2');
    const reward = hasMultiplier ? BASE_REWARD * 2 : BASE_REWARD;

    if (hasMultiplier) removeItem(userId, 'multiplier_x2');
    addCoins(userId, reward);
    setLastDaily(userId);

    const updated = getUser(userId);

    const embed = new EmbedBuilder()
      .setTitle('🎁 Daily Reward Claimed!')
      .setColor(0x2ecc71)
      .setDescription(hasMultiplier
        ? `⚡ **2x Multiplier** activated!\nYou received **+${reward.toLocaleString()} coins**!`
        : `You received **+${reward.toLocaleString()} coins**! 🔥`
      )
      .addFields({ name: '💰 New Balance', value: `**${updated.coins.toLocaleString()}** coins` })
      .setFooter({ text: 'Next daily in 24h • Chaos Casino V2 🎰' })
      .setTimestamp();

    await ctx.reply({ embeds: [embed] });
  },
};
