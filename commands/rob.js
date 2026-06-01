const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser, addCoins, removeCoins, hasItem } = require('../utils/economy');
const { robAttempt } = require('../utils/games');

const COOLDOWNS = new Map();
const COOLDOWN_MS = 5 * 60 * 1000;

module.exports = {
  name: 'rob',
  data: new SlashCommandBuilder()
    .setName('rob')
    .setDescription('Attempt to rob a player — 50% fail · 30% half loot · 20% full loot')
    .addUserOption((opt) =>
      opt.setName('user').setDescription('Player to rob').setRequired(true)
    )
    .addIntegerOption((opt) =>
      opt.setName('amount').setDescription('Amount to attempt to steal').setRequired(true).setMinValue(1)
    ),
  async execute(ctx) {
    const target = ctx.getUser('user');
    const amount = ctx.getInteger('amount', 1); // args: ['<@id>', '200']

    if (!target || !amount || amount <= 0) {
      return ctx.reply({ content: '❌ Usage: `!rob @user <amount>` or `/rob`', ephemeral: true });
    }
    if (target.id === ctx.user.id) {
      return ctx.reply({ content: "❌ You can't rob yourself.", ephemeral: true });
    }
    if (target.bot) {
      return ctx.reply({ content: "❌ You can't rob a bot.", ephemeral: true });
    }

    const now = Date.now();
    const lastRob = COOLDOWNS.get(ctx.user.id) ?? 0;
    if (now - lastRob < COOLDOWN_MS) {
      const left = Math.ceil((COOLDOWN_MS - (now - lastRob)) / 60000);
      return ctx.reply({
        content: `🚔 You're still a suspect! Cool down for **${left} more minute${left !== 1 ? 's' : ''}**.`,
        ephemeral: true,
      });
    }

    const targetUser = getUser(target.id);
    if (targetUser.coins < 100) {
      return ctx.reply({
        content: `❌ **${target.username}** doesn't have enough to rob (needs 100+ coins in wallet).`,
        ephemeral: true,
      });
    }

    const maxSteal = Math.floor(targetUser.coins * 0.5);
    const attempted = Math.min(amount, maxSteal);
    COOLDOWNS.set(ctx.user.id, now);

    const result = robAttempt(); // 'fail' | 'partial' | 'full'
    const targetHasInsurance = hasItem(target.id, 'insurance');
    const insuranceNote = targetHasInsurance ? ' 🛡️ (Insurance reduced by 25%)' : '';

    if (result === 'full') {
      const stolen = targetHasInsurance ? Math.floor(attempted * 0.75) : attempted;
      removeCoins(target.id, stolen);
      addCoins(ctx.user.id, stolen);
      const embed = new EmbedBuilder()
        .setTitle('🦹 Full Robbery!')
        .setColor(0x2ecc71)
        .setDescription(`You pulled off a **full heist** on **${target.username}**! 💰`)
        .addFields(
          { name: '💰 Stolen', value: `**${stolen.toLocaleString()} coins**${insuranceNote}`, inline: true },
          { name: 'Your Wallet', value: `**${getUser(ctx.user.id).coins.toLocaleString()}** coins`, inline: true },
        )
        .setFooter({ text: '20% odds for full loot · Chaos Casino V2 🎰' });
      return ctx.reply({ embeds: [embed] });

    } else if (result === 'partial') {
      const baseSteal = Math.floor(attempted * 0.5);
      const stolen = targetHasInsurance ? Math.floor(baseSteal * 0.75) : baseSteal;
      removeCoins(target.id, stolen);
      addCoins(ctx.user.id, stolen);
      const embed = new EmbedBuilder()
        .setTitle('🕵️ Partial Robbery!')
        .setColor(0xf39c12)
        .setDescription(`You grabbed **half the loot** before fleeing from **${target.username}**!`)
        .addFields(
          { name: '💰 Stolen', value: `**${stolen.toLocaleString()} coins** (50% of target)${insuranceNote}`, inline: true },
          { name: 'Your Wallet', value: `**${getUser(ctx.user.id).coins.toLocaleString()}** coins`, inline: true },
        )
        .setFooter({ text: '30% odds for partial loot · Chaos Casino V2 🎰' });
      return ctx.reply({ embeds: [embed] });

    } else {
      const fine = Math.floor(attempted * 0.30);
      removeCoins(ctx.user.id, fine);
      const embed = new EmbedBuilder()
        .setTitle('🚔 Caught Red-Handed!')
        .setColor(0xe74c3c)
        .setDescription(`You got caught trying to rob **${target.username}** and paid a fine!`)
        .addFields(
          { name: '💸 Fine Paid', value: `**${fine.toLocaleString()} coins**`, inline: true },
          { name: 'Your Wallet', value: `**${getUser(ctx.user.id).coins.toLocaleString()}** coins`, inline: true },
        )
        .setFooter({ text: '50% fail odds · Chaos Casino V2 🎰' });
      return ctx.reply({ embeds: [embed] });
    }
  },
};
