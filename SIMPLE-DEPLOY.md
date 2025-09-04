# How to Deploy SPARC RPG - Simple Guide

## What You'll Need
- A computer with internet
- About 30 minutes
- Your credit card (for free accounts, no charges)

---

## Step 1: Create Accounts (5 minutes)

### A) Create GitHub Account
1. Go to [github.com](https://github.com)
2. Click "Sign up" (green button)
3. Enter your email, create a password
4. Choose a username (like "yourname-sparc")
5. Click "Create account"
6. Check your email and click the verification link

### B) Create Vercel Account  
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" 
3. Click "Continue with GitHub" (easier than email)
4. Click "Authorize Vercel" when GitHub asks

### C) Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Click "Sign in with GitHub"
4. Click "Authorize Supabase"

### D) Create OpenAI Account
1. Go to [platform.openai.com](https://platform.openai.com)
2. Click "Sign up"
3. Enter your phone number when asked
4. Add a payment method (they give you $5 free credit)

---

## Step 2: Upload Your Code to GitHub (5 minutes)

### Option A: If you have the code on your computer
1. Go to [github.com](https://github.com)
2. Click the green "New" button (or the "+" icon)
3. Name your repository "sparc-rpg"
4. Click "Create repository"
5. Follow the instructions to upload your code files

### Option B: If you don't have the code yet
1. Download the code from wherever you got it
2. Unzip the folder if needed
3. Follow Option A above

---

## Step 3: Set Up Your Database (10 minutes)

### A) Create Database Project
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New project"
3. Choose your organization (probably just your name)
4. Project name: "SPARC RPG"
5. Database password: Create a strong password (WRITE IT DOWN!)
6. Region: Choose closest to you
7. Click "Create new project"
8. Wait 2-3 minutes for setup

### B) Set Up Database Tables
1. On the left sidebar, click "SQL Editor"
2. Click "New query"
3. Open the file `python/src/server/database/characters_schema.sql` from your code
4. Copy ALL the text from that file
5. Paste it into the SQL Editor
6. Click "Run" (play button)
7. You should see "Success. No rows returned"

### C) Get Your Database Keys
1. Click "Settings" on left sidebar
2. Click "API"
3. Copy the "URL" - save it somewhere
4. Copy the "service_role secret" - save it somewhere
5. Copy the "anon public" key - save it somewhere

---

## Step 4: Get Your OpenAI Key (5 minutes)

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Name it "SPARC RPG"
4. Click "Create secret key"
5. Copy the key that appears (starts with "sk-")
6. SAVE THIS KEY - you can't see it again!

---

## Step 5: Deploy to Vercel (5 minutes)

### A) Import Your Project
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Find your "sparc-rpg" repository
4. Click "Import"

### B) Configure Build Settings
1. Framework Preset: Leave as "Other"
2. Root Directory: Leave blank
3. Build Command: Type exactly: `cd archon-ui-main && npm run build`
4. Output Directory: Type exactly: `archon-ui-main/dist`
5. Install Command: Type exactly: `cd archon-ui-main && npm install`

### C) Add Your Secret Keys
1. Click "Environment Variables" 
2. Add these one by one (Name → Value):

   **Name:** `SUPABASE_URL`
   **Value:** The URL you copied from Supabase

   **Name:** `SUPABASE_SERVICE_KEY`  
   **Value:** The service_role secret from Supabase

   **Name:** `SUPABASE_ANON_KEY`
   **Value:** The anon public key from Supabase

   **Name:** `OPENAI_API_KEY`
   **Value:** The OpenAI key you created (starts with sk-)

   **Name:** `NODE_ENV`
   **Value:** `production`

3. Click "Deploy"

---

## Step 6: Wait and Test (5 minutes)

### A) Wait for Deployment
1. You'll see a progress screen
2. Wait for "Building" to finish (2-3 minutes)
3. Wait for "Deploying" to finish (1 minute)
4. You'll see "🎉 Your project has been deployed"

### B) Test Your Game
1. Click "Visit" button
2. Your game should load!
3. Try creating a character
4. Try rolling dice
5. Chat with the AI assistant

---

## Step 7: Get Your Game URL

1. In Vercel dashboard, you'll see your project
2. The URL will be something like: `https://sparc-rpg-abc123.vercel.app`
3. Share this URL with players!

---

## Common Problems & Solutions

### "Build Failed"
- Check that you typed the build commands exactly as shown
- Make sure your code files are all uploaded to GitHub

### "Database Connection Error"  
- Double-check you copied the Supabase keys correctly
- Make sure the database setup (Step 3B) was completed

### "AI Assistant Not Working"
- Verify your OpenAI key starts with "sk-"
- Check you have credit in your OpenAI account

### "Page Won't Load"
- Wait 5 minutes and try again (sometimes takes time)
- Check Vercel dashboard for error messages

---

## You're Done! 🎉

Your SPARC RPG game is now live on the internet! Players can:
- Create characters in under 5 minutes
- Roll dice with realistic physics
- Get help from an AI Game Master
- Play together in real-time

**Your game URL:** Check your Vercel dashboard for the exact link

**Cost:** Free for small groups (under 100 players)

**Support:** If something breaks, check the Vercel dashboard for error logs

---

## Next Steps (Optional)

### Custom Domain
- Buy a domain like "mysparcgame.com" 
- In Vercel, go to Settings → Domains
- Follow the instructions to connect it

### Player Management
- Players don't need accounts to play
- Share your game URL with friends
- Each player can create multiple characters

### Game Master Tools
- You can see all player activity in the game
- The AI assistant helps with rules and story
- Add your own adventures in the game interface