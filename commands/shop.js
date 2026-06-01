const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { SHOP_ITEMS, getUser } = require('../utils/economy');

module.exports = {
  name: 'shop',
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Browse the Chaos Casino shop'),
  async execute(ctx) {
    const user = getUser(ctx.user.id);

    const embed = new EmbedBuilder()
      .setTitle('🛒 Chaos Casino Shop')
      .setColor(0x3498db)
      .setDescription(`Your wallet: **${user.coins.toLocaleString()} coins**\nUse \`/buy\` or \`!buy <item_id>\` to purchase.`)
      .setFooter({ text: 'Chaos Casino V2 🎰' });

    for (const item of Object.values(SHOP_ITEMS)) {
      embed.addFields({
        name: `${item.emoji} ${item.name} — ${item.price.toLocaleString()} coins`,
        value: `${item.description}\n\`ID: ${item.id}\`  ·  ${item.consumable ? '🔁 One-time use' : '♾️ Permanent passive'}`,
        inline: false,
      });
    }

    await ctx.reply({ embeds: [embed], ephemeral: true });
  },
};
