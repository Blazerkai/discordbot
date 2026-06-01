const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser, removeCoins, addItem, SHOP_ITEMS } = require('../utils/economy');

module.exports = {
  name: 'buy',
  data: new SlashCommandBuilder()
    .setName('buy')
    .setDescription('Purchase an item from the shop')
    .addStringOption((opt) =>
      opt.setName('item').setDescription('Item to purchase').setRequired(true)
        .addChoices(
          { name: '🍀 Lucky Charm — 500 coins (boosts win odds)', value: 'lucky_charm' },
          { name: '🛡️ Insurance — 800 coins (reduces losses 25%)', value: 'insurance' },
          { name: '⚡ 2x Daily Multiplier — 1000 coins (one-time use)', value: 'multiplier_x2' },
        )
    ),
  async execute(ctx) {
    const itemId = ctx.getString('item', 0);
    if (!itemId) {
      return ctx.reply({ content: '❌ Usage: `!buy <item_id>` or `/buy`\nIDs: `lucky_charm`, `insurance`, `multiplier_x2`', ephemeral: true });
    }

    const item = SHOP_ITEMS[itemId];
    if (!item) {
      return ctx.reply({
        content: `❌ Unknown item **"${itemId}"**. Use \`!shop\` or \`/shop\` to see available items.`,
        ephemeral: true,
      });
    }

    const userId = ctx.user.id;
    const user = getUser(userId);

    if (user.coins < item.price) {
      return ctx.reply({
        content: `❌ **${item.name}** costs **${item.price.toLocaleString()} coins** but you only have **${user.coins.toLocaleString()}**.`,
        ephemeral: true,
      });
    }

    removeCoins(userId, item.price);
    addItem(userId, item.id);
    const updated = getUser(userId);

    const embed = new EmbedBuilder()
      .setTitle(`${item.emoji} Purchase Successful!`)
      .setColor(0x2ecc71)
      .setDescription(`You bought **${item.name}**!`)
      .addFields(
        { name: 'Effect', value: item.description, inline: false },
        { name: '💸 Paid', value: `${item.price.toLocaleString()} coins`, inline: true },
        { name: '💰 Remaining', value: `${updated.coins.toLocaleString()} coins`, inline: true },
      )
      .setFooter({ text: 'Chaos Casino V2 🎰' });

    await ctx.reply({ embeds: [embed] });
  },
};
