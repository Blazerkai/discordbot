const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser, SHOP_ITEMS } = require('../utils/economy');

module.exports = {
  name: 'inventory',
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('View your owned items'),
  async execute(ctx) {
    const user = getUser(ctx.user.id);

    if (!user.inventory.length) {
      return ctx.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`🎒 ${ctx.user.username}'s Inventory`)
            .setColor(0x95a5a6)
            .setDescription('Your inventory is empty.\nVisit `/shop` or use `!shop` to buy items!')
            .setFooter({ text: 'Chaos Casino V2 🎰' }),
        ],
        ephemeral: true,
      });
    }

    const counts = user.inventory.reduce((acc, id) => {
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});

    const embed = new EmbedBuilder()
      .setTitle(`🎒 ${ctx.user.username}'s Inventory`)
      .setColor(0x9b59b6)
      .setThumbnail(ctx.user.displayAvatarURL())
      .setFooter({ text: 'Chaos Casino V2 🎰' });

    for (const [id, count] of Object.entries(counts)) {
      const item = SHOP_ITEMS[id];
      if (!item) continue;
      embed.addFields({
        name: `${item.emoji} ${item.name}${count > 1 ? `  ×${count}` : ''}`,
        value: `${item.description}\n${item.consumable ? '🔁 Consumed on next use' : '♾️ Always active'}`,
        inline: false,
      });
    }

    await ctx.reply({ embeds: [embed], ephemeral: true });
  },
};
