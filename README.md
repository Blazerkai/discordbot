# 🎰 Chaos Casino Bot V2

A fully offline Discord economy + casino bot. No database, no APIs — just Node.js and a JSON file.

---

## Commands

### 💰 Economy
| Command | Description |
|---|---|
| `!balance` | Wallet + bank + net worth |
| `!daily` | Claim 500 free coins (24h cooldown) |
| `!deposit <amount>` | Move coins to your bank (safe from gambling/robbery) |
| `!withdraw <amount>` | Pull coins from bank to wallet |
| `!transfer @user <amount>` | Send coins to another player |

### 🎰 Casino
| Command | Odds | Payout |
|---|---|---|
| `!coinflip <heads/tails> <amount>` | 50/50 | 2x |
| `!doubleornothing <amount>` | 50/50 | 2x |
| `!dice <1-6> <amount>` | 1 in 6 | 6x |
| `!slots <amount>` | Weighted | 1.5x – 15x |

### 🛒 Shop
| Command | Description |
|---|---|
| `!shop` | View available items |
| `!buy <item_id>` | Purchase an item |
| `!inventory` | View your owned items |

**Shop items:**
- `🍀 lucky_charm` — 500 coins · Boosts win chances
- `🛡️ insurance` — 800 coins · Reduces all losses by 25%
- `⚡ multiplier_x2` — 1000 coins · Doubles your next `!daily` (one-time)

### 🏆 Competitive
| Command | Description |
|---|---|
| `!leaderboard` | Top 10 richest players (wallet + bank) |
| `!rob @user <amount>` | 40% chance to steal, 60% chance to get fined |

### 🧨 Chaos
| Command | Description |
|---|---|
| `!chaos` | Triggers a random server-wide event (30 min cooldown) |

**Chaos events:**
- 💸 **Windfall** — Everyone gains 50–300 coins
- 💀 **Market Crash** — Everyone loses 10–25% of wallet
- 🏦 **Robin Hood Tax** — Richest player taxed 20%, given to a random player
- 🎰 **Jackpot Event** — One random player wins 500–3000 coins

---

## Setup

### 1. Get your Discord Bot Token
1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. **New Application** → name it → **Bot** tab → **Reset Token** → copy it
3. Enable **Message Content Intent** under Privileged Gateway Intents
4. **OAuth2 → URL Generator** → scope: `bot` → permissions: `Send Messages`, `Read Message History`, `Embed Links`
5. Open the generated URL to invite the bot to your server

### 2. Install Node.js
Download [Node.js v18+ LTS](https://nodejs.org/)

### 3. Install dependencies
Open this folder in VS Code, open the terminal (`Ctrl+` `` ` ``):
```bash
npm install
```

### 4. Configure your token
```bash
cp .env.example .env
```
Open `.env` and paste your token:
```env
DISCORD_TOKEN=your_token_here
```

### 5. Run the bot
```bash
npm start
# or for auto-reload:
npm run dev
```

---

## How the Economy System Works

```
Users start with 1000 coins in their wallet.

Wallet (coins)
  ↕ !deposit / !withdraw
Bank (bank)
  → Safe from gambling and robbery
  → Counts toward leaderboard net worth

Gambling only uses wallet coins.
Robbery only targets wallet coins.
```

Player data is saved to `data/users.json` automatically. New users are created on their first command.

---

## File Structure

```
discord bot/
├── index.js                    # Bot entry point
├── commands/
│   ├── balance.js
│   ├── daily.js
│   ├── deposit.js
│   ├── withdraw.js
│   ├── transfer.js
│   ├── slots.js
│   ├── dice.js
│   ├── coinflip.js
│   ├── doubleornothing.js
│   ├── shop.js
│   ├── buy.js
│   ├── inventory.js
│   ├── chaos.js
│   ├── leaderboard.js
│   └── rob.js
├── utils/
│   ├── economy.js              # JSON read/write, all account helpers
│   └── games.js                # Slot machine, dice, coin flip logic
├── data/
│   └── users.json              # Player data
├── .env                        # Your token (never commit this)
├── .env.example
└── package.json
```
