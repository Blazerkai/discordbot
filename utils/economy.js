const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'users.json');
const DEFAULT_COINS = 1000;

const SHOP_ITEMS = {
  lucky_charm: {
    id: 'lucky_charm',
    name: 'Lucky Charm',
    emoji: '🍀',
    description: 'Slightly boosts your win chances in all casino games',
    price: 500,
    consumable: false,
  },
  insurance: {
    id: 'insurance',
    name: 'Insurance',
    emoji: '🛡️',
    description: 'Reduces your gambling and rob losses by 25%',
    price: 800,
    consumable: false,
  },
  multiplier_x2: {
    id: 'multiplier_x2',
    name: '2x Daily Multiplier',
    emoji: '⚡',
    description: 'Your next !daily reward is doubled (consumed on use)',
    price: 1000,
    consumable: true,
  },
};

function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function getUser(userId) {
  const db = readDB();
  const defaults = { coins: DEFAULT_COINS, bank: 0, lastDaily: 0, inventory: [] };

  if (!db[userId]) {
    db[userId] = { ...defaults };
    writeDB(db);
    return db[userId];
  }

  // Migrate old user records that are missing fields
  let changed = false;
  for (const [key, val] of Object.entries(defaults)) {
    if (db[userId][key] === undefined) {
      db[userId][key] = val;
      changed = true;
    }
  }
  if (changed) writeDB(db);
  return db[userId];
}

function saveUser(userId, userData) {
  const db = readDB();
  db[userId] = userData;
  writeDB(db);
}

function addCoins(userId, amount) {
  const user = getUser(userId);
  user.coins = Math.max(0, Math.round(user.coins + amount));
  saveUser(userId, user);
  return user;
}

function removeCoins(userId, amount) {
  return addCoins(userId, -amount);
}

function deposit(userId, amount) {
  const user = getUser(userId);
  if (amount > user.coins) throw new Error('NOT_ENOUGH_COINS');
  user.coins -= amount;
  user.bank += amount;
  saveUser(userId, user);
  return user;
}

function withdraw(userId, amount) {
  const user = getUser(userId);
  if (amount > user.bank) throw new Error('NOT_ENOUGH_BANK');
  user.bank -= amount;
  user.coins += amount;
  saveUser(userId, user);
  return user;
}

function transfer(fromId, toId, amount) {
  const db = readDB();
  const defaults = { coins: DEFAULT_COINS, bank: 0, lastDaily: 0, inventory: [] };
  if (!db[fromId]) db[fromId] = { ...defaults };
  if (!db[toId]) db[toId] = { ...defaults };
  if (amount > db[fromId].coins) throw new Error('NOT_ENOUGH_COINS');
  db[fromId].coins -= amount;
  db[toId].coins += amount;
  writeDB(db);
  return { from: db[fromId], to: db[toId] };
}

function setLastDaily(userId) {
  const user = getUser(userId);
  user.lastDaily = Date.now();
  saveUser(userId, user);
  return user;
}

function addItem(userId, itemId) {
  const user = getUser(userId);
  user.inventory.push(itemId);
  saveUser(userId, user);
  return user;
}

function hasItem(userId, itemId) {
  const user = getUser(userId);
  return user.inventory.includes(itemId);
}

function removeItem(userId, itemId) {
  const user = getUser(userId);
  const idx = user.inventory.indexOf(itemId);
  if (idx !== -1) user.inventory.splice(idx, 1);
  saveUser(userId, user);
  return user;
}

function getLeaderboard() {
  const db = readDB();
  return Object.entries(db)
    .map(([id, d]) => ({
      id,
      total: (d.coins || 0) + (d.bank || 0),
      coins: d.coins || 0,
      bank: d.bank || 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
}

module.exports = {
  readDB, writeDB,
  getUser, saveUser,
  addCoins, removeCoins,
  deposit, withdraw, transfer,
  setLastDaily,
  addItem, hasItem, removeItem,
  getLeaderboard,
  SHOP_ITEMS, DEFAULT_COINS,
};
