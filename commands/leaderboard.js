const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLeaderboard } = require('../utils/economy');

const MEDALS = ['🥇', '🥈', '🥉'];

module.exports = {
  name: 'leaderboard',
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the top 10 richest players'),
  async execute(ctx) {
    await ctx.deferReply(); // sends "Loading..." for prefix, defers for slash

    const top = getLeaderboard();
    if (!top.length) {
      return ctx.editReply('📭 No players yet. Use `/balance` or `!balance` to register!');
    }

    const rows = await Promise.all(
      top.map(async (entry, i) => {
        let name;
        try {
          const member = await ctx.guild.members.fetch(entry.id);
          name = member.displayName;
        } catch {
          name = `User-${entry.id.slice(-4)}`;
        }
        const pos = MEDALS[i] ?? `**${i + 1}.**`;
        return `${pos} **${name}**\n  👛 ${entry.coins.toLocaleString()} + 🏦 ${entry.bank.toLocaleString()} = **${entry.total.toLocaleString()} total**`;
      })
    );

    const embed = new EmbedBuilder()
      .setTitle('🏆 Chaos Casino — Rich List')
      .setColor(0xf39c12)
      .setDescription(rows.join('\n\n'))
      .setFooter({ text: `Ranked by wallet + bank · ${top.length} players · Chaos Casino V2 🎰` })
      .setTimestamp();

    await ctx.editReply({ embeds: [embed] });
  },
};
