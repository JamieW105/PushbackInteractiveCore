# Discord Bot Setup for Slash Commands

## Required Bot Permissions & Scopes

Your Management Bot needs the following **OAuth2 Scopes**:
1. `bot`
2. `applications.commands` ← **CRITICAL FOR SLASH COMMANDS**

## How to Add the Scope:

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your **Management Bot** application
3. Go to **OAuth2** → **URL Generator**
4. Check these scopes:
   - ✅ `bot`
   - ✅ `applications.commands`
5. Under **Bot Permissions**, select:
   - ✅ Manage Server
   - ✅ Kick Members
   - ✅ Ban Members
   - ✅ Send Messages
6. Copy the generated URL
7. Open it in your browser and **re-invite** the bot to your server

## Verify Commands Are Registered:

After restarting your Next.js server, check the terminal for:
```
[BOT] Initializing Management Bot...
[BOT] Management Bot logged in as YourBot#1234
[BOT] Refreshing MGMT (/) commands.
[BOT] Successfully registered MGMT (/) commands.
```

## Troubleshooting:

- **Commands not showing?** → Re-invite bot with `applications.commands` scope
- **"Application did not respond"?** → Check server logs for errors
- **Global commands take 1 hour to update** → Add `DISCORD_GUILD_ID` to `.env.local` for instant updates during development

## Optional: Fast Development Mode

Add to `.env.local`:
```
DISCORD_GUILD_ID=your_server_id_here
```

This registers commands to a specific server instantly instead of globally (which takes up to 1 hour).
