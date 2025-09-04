# SPARC RPG - Frontend Only Deployment

Since Vercel Python functions are causing issues, let's deploy in two parts:

## Part 1: Deploy Frontend to Vercel (5 minutes)

### Settings for Vercel:
- **Build Command:** `cd archon-ui-main && npm run build`
- **Output Directory:** `archon-ui-main/dist`
- **Install Command:** `cd archon-ui-main && npm install`
- **Environment Variables:** Leave empty for now

This will give you the game interface at `https://your-project.vercel.app`

## Part 2: Backend Options

### Option A: Run Backend Locally
```bash
cd /Users/ross/Documents/GitHub/sparc/python
pip install -r requirements.txt
python -m src.server.main
```
Backend runs at `http://localhost:8181`

### Option B: Deploy Backend to Railway (Free)
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your sparc repository
5. Set these environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY` 
   - `OPENAI_API_KEY`

### Option C: Use Mock Data (Demo Mode)
The frontend can run without a backend using mock data for demonstrations.

## Recommended: Deploy Frontend First
Let's get the frontend working on Vercel first, then worry about the backend separately.

Try deploying with the simplified vercel.json (no Python functions) and these settings:
- Build Command: `cd archon-ui-main && npm run build`
- Output Directory: `archon-ui-main/dist`
- Install Command: `cd archon-ui-main && npm install`