const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { readDB, writeDB } = require('../utils/economy');

const COOLDOWNS = new Map();
const COOLDOWN_MS = 30 * 60 * 1000;

const EVENTS = [
  {
    name: '💸 WINDFALL',
    color: 0x2ecc71,
    description: 'The Casino is feeling generous tonight!',
    run(db) {
      const bonus = Math.floor(Math.random() * 251) + 50;
      for (const id of Object.keys(db)) db[id].coins = (db[id].coins || 0) + bonus;
      return `🎉 Everyone received **+${bonus.toLocaleString()} coins**!`;
    },
  },
  {
    name: '💀 MARKET CRASH',
    color: 0xe74c3c,
    description: 'The economy is in freefall. Everyone suffers.',
    run(db) {
      const pct = Math.floor(Math.random() * 16) + 10;
      for (const id of Object.keys(db)) {
        const loss = Math.floor((db[id].coins || 0) * (pct / 100));
        db[id].coins = Math.max(0, db[id].coins - loss);
      }
      return `📉 Everyone lost **${pct}%** of their wallet coins!`;
    },
  },
  {
    name: '🏦 ROBIN HOOD TAX',
    color: 0x9b59b6,
    description: 'From the richest, to a lucky soul.',
    run(db) {
      const sorted = Object.entries(db).sort(
        ([, a], [, b]) => ((b.coins || 0) + (b.bank || 0)) - ((a.coins || 0) + (a.bank || 0))
      );
      if (sorted.length < 2) return 'Not enough players for this event.';
      const [richId, richData] = sorted[0];
      const tax = Math.floor(((richData.coins || 0) + (richData.bank || 0)) * 0.20);
      const fromCoins = Math.min(tax, richData.coins || 0);
      db[richId].coins = Math.max(0, db[richId].coins - fromCoins);
      db[richId].bank = Math.max(0, (db[richId].bank || 0) - Math.max(0, tax - fromCoins));
      const recipientId = sorted[Math.floor(Math.random() * (sorted.length - 1)) + 1][0];
      db[recipientId].coins = (db[recipientId].coins || 0) + tax;
      return `<@${richId}> was taxed **${tax.toLocaleString()} coins** (20% of wealth)!\n💸 It all went to <@${recipientId}>!`;
    },
  },
  {
    name: '🎰 JACKPOT EVENT',
    color: 0xf1c40f,
    description: 'The Casino picks one lucky winner at random.',
    run(db) {
      const ids = Object.keys(db);
      if (!ids.length) return 'No players found.';
      const winnerId = ids[Math.floor(Math.random() * ids.length)];
      const jackpot = Math.floor(Math.random() * 2501) + 500;
      db[winnerId].coins = (db[winnerId].coins || 0) + jackpot;
      return `🎉 <@${winnerId}> won the jackpot of **${jackpot.toLocaleString()} coins**!`;
    },
  },
];

module.exports = {
  name: 'chaos',
  data: new SlashCommandBuilder()
    .setName('chaos')
    .setDescription('Trigger a random server-wide chaos event (30 min cooldown)'),
  async execute(ctx) {
    const guildId = ctx.guild?.id ?? 'dm';
    const now = Date.now();
    const lastChaos = COOLDOWNS.get(guildId) ?? 0;

    if (now - lastChaos < COOLDOWN_MS) {
      const left = Math.ceil((COOLDOWN_MS - (now - lastChaos)) / 60000);
      return ctx.reply({
        content: `🧨 Chaos is cooling down! Try again in **${left} minute${left !== 1 ? 's' : ''}**.`,
        ephemeral: true,
      });
    }

    COOLDOWNS.set(guildId, now);
    const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    const db = readDB();
    const outcome = event.run(db);
    writeDB(db);

    const embed = new EmbedBuilder()
      .setTitle(`🧨 CHAOS EVENT — ${event.name}`)
      .setColor(event.color)
      .setDescription(`*${event.description}*\n\n${outcome}`)
      .setFooter({ text: 'Next chaos event in 30 minutes · Chaos Casino V2 🎰' })
      .setTimestamp();

    await ctx.reply({ embeds: [embed] });
  },
};
