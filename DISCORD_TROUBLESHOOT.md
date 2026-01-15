# Fix "interactions endpoint url could not be verified"

## The Issue
Discord is trying to verify your webhook endpoint but it's failing. Here's how to fix it:

## Step-by-Step Fix:

### Step 1: Get Your Discord Public Key
1. Go to https://discord.com/developers/applications
2. Select your Management Bot application
3. Go to **General Information**
4. Copy the **PUBLIC KEY** (NOT the token!)

### Step 2: Add to Vercel Environment Variables
1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:
   - `DISCORD_PUBLIC_KEY` = (paste the public key from Step 1)
   - `DISCORD_CLIENT_ID` = (your bot's client ID)
   - `DISCORD_BOT_TOKEN_MGMT` = (your bot token)
   - `ROBLOX_OPEN_CLOUD_KEY` = (your existing Roblox key)
   - `ROBLOX_UNIVERSE_ID` = (your existing universe ID)
5. Click **Save**

### Step 3: Deploy to Vercel
```bash
git add .
git commit -m "Add Discord webhook endpoint"
git push
```

Wait for Vercel to finish deploying (check the dashboard).

### Step 4: Set the Webhook URL in Discord
1. Go back to Discord Developer Portal → Your Bot → **General Information**
2. In **INTERACTIONS ENDPOINT URL**, enter:
   ```
   https://pushback-interactive-core.vercel.app/api/discord/interactions
   ```
3. Click **Save Changes**
4. Discord will send a test request
5. If it works, you'll see "All your edits have been carefully recorded"

### Step 5: Register Commands
Run locally:
```bash
node register-commands.js
```

## Still Not Working?

### Test Locally First:
```bash
node test-webhook.js
```

This will tell you if the endpoint is responding.

### Check Vercel Logs:
1. Go to Vercel Dashboard → Your Project → **Logs**
2. Look for errors when Discord tries to verify
3. Common issues:
   - `DISCORD_PUBLIC_KEY` not set
   - Wrong public key
   - Endpoint returning 500 error

### Verify Environment Variables:
Make sure `DISCORD_PUBLIC_KEY` is set in **both**:
- `.env.local` (for local dev)
- Vercel dashboard (for production)

## Quick Debug:
Visit this URL in your browser:
```
https://pushback-interactive-core.vercel.app/api/discord/interactions
```

You should see: `{"error":"Unknown interaction type"}` or similar.
If you see a 404 or 500, there's a deployment issue.
