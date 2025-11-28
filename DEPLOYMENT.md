# ⚠️ Cloudflare Worker Removed

As of November 2025, all Cloudflare Worker code, config, and proxy logic have been fully removed from this project. All frontend/backend communication now uses direct Supabase REST calls. Ignore any old references to Cloudflare Worker in docs or code history.

# 🚀 Deployment Guide - Netlify

## Prerequisite: Git Installation

If you haven't installed Git, install it from: https://git-scm.com/download/win

After installation, restart PowerShell and verify:
```powershell
git --version
```

## Step-by-Step Deployment

### 1. Initialize Git Repository

```powershell
cd "C:\Users\zaww1\Desktop\finbot-analytics (4)"
git init
git config user.email "your-email@example.com"
git config user.name "Your Name"
```

### 2. Add All Files

```powershell
git add .
```

### 3. Create Initial Commit

```powershell
git commit -m "Initial commit: Nura Finance App with Telegram Bot integration"
```

### 4. Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository named `finbot-analytics`
3. Do **NOT** initialize with README (we already have files)
4. Click "Create repository"

### 5. Add Remote and Push

After creating the GitHub repo, you'll see commands like:

```powershell
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/finbot-analytics.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

### 6. Connect Netlify to GitHub

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Select "GitHub"
4. Authorize Netlify with GitHub
5. Find and select your `finbot-analytics` repository
6. Click "Deploy site"

### 7. Set Environment Variables (Important!)

In Netlify dashboard:
1. Go to your site
2. Site settings → Build & deploy → Environment
3. Add these variables:
   - `VITE_GEMINI_API_KEY` = your Gemini API key (if needed)

**Note:** Supabase keys are only needed for the frontend if you're using them directly. Otherwise, they stay in the backend bot configuration.

### 8. Auto-Deployment

✅ Now every time you push to GitHub, Netlify automatically:
1. Pulls latest code
2. Runs `npm run build`
3. Deploys to production

## Monitoring

- **Netlify Dashboard**: https://app.netlify.com/
- **See build logs**: Site → Deploys → Click on a deployment
- **View live site**: Your custom domain or Netlify URL

## Telegram Bot Note

The Telegram bot runs separately on your local machine or a server:

```powershell
npm run start-bot
```

To keep it running 24/7, you can:
- Use a VPS (DigitalOcean, AWS, Heroku)
- Use Vercel Serverless Functions
- Run locally with a service like NSSM (Non-Sucking Service Manager)

## Rollback

If something breaks:
1. Go to Netlify Dashboard
2. Deploys tab
3. Click "Restore" on a previous successful deploy

## Build Status Badge (Optional)

Add this to your GitHub README:

```markdown
[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR_SITE_ID/deploy-status)](https://app.netlify.com/sites/YOUR_SITE_NAME/deploys)
```

Find your site ID and name in Netlify Site settings.
