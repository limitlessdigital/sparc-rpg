# SPARC RPG Deployment Guide

## Vercel Deployment

This guide explains how to deploy the SPARC RPG application to Vercel.

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Supabase Project**: Set up at [supabase.com](https://supabase.com)
4. **OpenAI API Key**: Get from [platform.openai.com](https://platform.openai.com)

### Step 1: Database Setup

1. **Create Supabase Project**
   - Go to [supabase.com/dashboard](https://supabase.com/dashboard)
   - Click "New Project"
   - Choose organization and set database password

2. **Run Database Schema**
   ```bash
   # In Supabase SQL Editor, run:
   cat python/src/server/database/characters_schema.sql
   ```

3. **Get Connection Details**
   - Go to Settings → API
   - Copy `URL` and `service_role key`

### Step 2: Deploy to Vercel

1. **Import Project**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings**
   - Framework Preset: `Other`
   - Root Directory: `./` (keep default)
   - Build Command: `cd archon-ui-main && npm run build`
   - Output Directory: `archon-ui-main/dist`
   - Install Command: `cd archon-ui-main && npm install`

3. **Set Environment Variables**
   Add these in Vercel project settings:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your-service-key-here
   SUPABASE_ANON_KEY=your-anon-key-here
   OPENAI_API_KEY=your-openai-api-key-here
   NODE_ENV=production
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete

### Step 3: Configure Domain (Optional)

1. Go to project settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Architecture Notes

- **Frontend**: React app served from Vercel CDN
- **Backend**: Python FastAPI functions running serverlessly
- **Database**: Supabase PostgreSQL with Row Level Security
- **Caching**: Vercel Edge caching for static assets

### API Endpoints

After deployment, your APIs will be available at:
- `https://your-app.vercel.app/api/sparc/characters/`
- `https://your-app.vercel.app/api/sparc/dice/`
- `https://your-app.vercel.app/api/sparc/sessions/`

### Performance Considerations

1. **Cold Starts**: First API call may take 1-2 seconds
2. **Caching**: Static assets cached at edge
3. **Database**: Connection pooling handled by Supabase

### Monitoring

1. **Vercel Dashboard**: View deployment logs and metrics
2. **Supabase Dashboard**: Monitor database performance
3. **OpenAI Usage**: Track API usage in OpenAI dashboard

### Troubleshooting

**Common Issues:**

1. **Build Fails**
   - Check Node.js version (use 18.x)
   - Verify all dependencies in package.json

2. **API Errors**
   - Check environment variables are set
   - Verify Supabase connection string
   - Check function logs in Vercel dashboard

3. **Database Connection Issues**
   - Verify Supabase URL and keys
   - Check RLS policies are enabled
   - Ensure schema is deployed

**Debug Steps:**
```bash
# Local testing
cd archon-ui-main
npm run dev

# Check API locally
curl http://localhost:3737/api/sparc/characters/templates
```

### Production Checklist

- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] RLS policies enabled
- [ ] OpenAI API key valid
- [ ] Custom domain configured (optional)
- [ ] Error monitoring setup
- [ ] Performance testing completed

### Cost Estimation

**Vercel:**
- Hobby: Free for personal projects
- Pro: $20/month for team features

**Supabase:**
- Free tier: 500MB database, 2GB bandwidth
- Pro: $25/month for production features

**OpenAI:**
- Pay-per-use: ~$0.002 per 1K tokens
- Estimated: $10-50/month depending on usage

### Support

- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Supabase**: [supabase.com/support](https://supabase.com/support)
- **Project Issues**: Create GitHub issue in your repository