# Discord Bot Setup for Vercel - Quick Start

## The Problem
Discord bots need persistent WebSocket connections, but Vercel is serverless (functions spin up/down). Solution: Use Discord's **Interactions Webhook** instead.

## Setup (5 steps):

### 1. Add Environment Variables
Add to `.env.local` AND Vercel dashboard:
```
DISCORD_PUBLIC_KEY=your_public_key_here
DISCORD_CLIENT_ID=your_bot_client_id
DISCORD_BOT_TOKEN_MGMT=your_bot_token
DISCORD_GUILD_ID=your_server_id (optional, for faster dev)
```

Get PUBLIC_KEY from: Discord Developer Portal → Your Bot → General Information

### 2. Register Commands
Run locally (one-time):
```bash
node register-commands.js
```

### 3. Set Webhook URL in Discord
1. Go to Discord Developer Portal → Your Bot → General Information
2. Set **INTERACTIONS ENDPOINT URL** to:
   ```
   https://your-app.vercel.app/api/discord/interactions
   ```
3. Click **Save Changes**
4. Discord will test it - if it fails, check your PUBLIC_KEY

### 4. Deploy
```bash
git add .
git commit -m "Add Discord webhook interactions"
git push
```

Vercel will auto-deploy.

### 5. Test
Type `/roblox` or `/update` in your Discord server!

## Commands Available:
- `/roblox lookup <username>` - Player info
- `/roblox kick <target> <reason>` - Kick player
- `/roblox warn <target> <reason>` - Warn player
- `/roblox message <target> <message>` - Message player
- `/roblox shutdown <jobid>` - Shutdown server
- `/update confirm:true` - Deploy update

## Troubleshooting:
- **"Invalid signature"** → Wrong PUBLIC_KEY
- **Commands not showing** → Run `register-commands.js` again
- **"Application did not respond"** → Check Vercel logs
