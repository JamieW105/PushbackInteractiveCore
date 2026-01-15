# Discord Webhook Setup for Vercel

Since Vercel is serverless and can't maintain persistent WebSocket connections, we need to use Discord's **Interactions Webhook** instead.

## Setup Steps:

### 1. Get Your Public Key
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your **Management Bot**
3. Go to **General Information**
4. Copy the **PUBLIC KEY**

### 2. Add to Environment Variables
Add to your `.env.local` and Vercel:
```
DISCORD_PUBLIC_KEY=your_public_key_here
```

### 3. Register Commands (One-time setup)
Run this script locally to register your slash commands:

```bash
node register-commands.js
```

### 4. Set Interactions Endpoint URL
1. Go to Discord Developer Portal → Your Bot → **General Information**
2. Set **INTERACTIONS ENDPOINT URL** to:
   ```
   https://your-app.vercel.app/api/discord/interactions
   ```
3. Click **Save Changes**
4. Discord will send a test request - if it fails, check your PUBLIC_KEY is correct

### 5. Deploy to Vercel
```bash
git add .
git commit -m "Add Discord webhook interactions"
git push
```

Vercel will auto-deploy. Once deployed, your slash commands will work!

## How It Works:
- **Old way (doesn't work on Vercel)**: Bot maintains WebSocket connection
- **New way (works on Vercel)**: Discord sends HTTP requests to your API endpoint
- Your commands will appear and work the same way in Discord!

## Troubleshooting:
- **"Invalid request signature"** → Check your PUBLIC_KEY
- **Commands not showing** → Run `register-commands.js` again
- **"Application did not respond"** → Check Vercel logs for errors
