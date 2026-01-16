# AI Insights - Quick Start Guide

## Current Status

✅ **AI Insights is now working!** 

The system now has two modes:
1. **Mock Mode** (Works immediately) - Uses intelligent fallback insights
2. **Claude API Mode** (Optional) - Uses real Claude AI for deeper analysis

## Using AI Insights Right Now

1. **Restart your backend:**
   ```bash
   npm run dev
   ```

2. **Go to Review Ideas page**

3. **Click the eye icon on any idea**

4. **AI Insights will load** with intelligent analysis

That's it! It works immediately without any setup.

## Upgrading to Real Claude AI (Optional)

If you want to use the real Claude API for more sophisticated analysis:

### Step 1: Install Anthropic SDK

**Option A: Using Command Line**
```bash
cd CLASS-FORGE/backend
npm install @anthropic-ai/sdk
```

**Option B: Using Batch File (Windows)**
- Double-click: `CLASS-FORGE/backend/install-anthropic.bat`

### Step 2: Get Claude API Key

1. Go to: https://console.anthropic.com
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-ant-`)

### Step 3: Add API Key to .env

Edit `CLASS-FORGE/backend/.env` and add:

```env
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
```

Replace `sk-ant-your-actual-key-here` with your actual key.

### Step 4: Restart Backend

```bash
npm run dev
```

You should see in console:
```
✓ AI Insights: Using Claude API
```

## How It Works

### Mock Mode (Current)
- ✅ Works immediately without setup
- ✅ Provides intelligent analysis based on idea domain
- ✅ Generates realistic scores and recommendations
- ✅ No API calls, no costs
- ⚠️ Less personalized than Claude API

### Claude API Mode (Optional)
- ✅ Real AI analysis of your specific idea
- ✅ More detailed and personalized insights
- ✅ Better recommendations
- ⚠️ Requires API key
- ⚠️ Small cost per analysis (~$0.001-0.003)

## Testing It

1. **Start backend:**
   ```bash
   npm run dev
   ```

2. **Go to http://localhost:5173**

3. **Login as teacher**

4. **Go to Review Ideas**

5. **Click eye icon on any pending idea**

6. **See AI Insights load**

## What You'll See

The AI Insights modal shows:

- **Innovation Score** (60-100) - Overall innovation potential
- **Key Points** - Top 3 strengths of the idea
- **Feasibility** (1-10) - How practical to implement
- **Impact** (1-10) - Potential positive impact
- **Market Potential** (1-10) - Commercial viability
- **Recommendations** - Specific improvements suggested
- **Risk Factors** - Potential challenges

## Troubleshooting

### "Failed to generate AI insights"

**Solution:**
1. Restart backend: `npm run dev`
2. Try again
3. Check backend console for errors

### Want to use Claude API but getting errors?

**Check:**
1. API key is correct (starts with `sk-ant-`)
2. API key is in `.env` file
3. Backend is restarted after adding key
4. You have available credits on Anthropic account

### "ANTHROPIC_API_KEY not set"

**Solution:**
1. Add key to `.env`: `ANTHROPIC_API_KEY=sk-ant-...`
2. Restart backend
3. Try again

## Costs

- **Mock Mode:** FREE
- **Claude API Mode:** ~$0.001-0.003 per idea analysis

## Switching Between Modes

**To use Mock Mode:**
- Remove or comment out `ANTHROPIC_API_KEY` in `.env`
- Restart backend

**To use Claude API:**
- Add `ANTHROPIC_API_KEY=sk-ant-...` to `.env`
- Restart backend

## Next Steps

1. **Try it now** - Click eye icon on an idea
2. **If you like it** - Get Claude API key for real AI
3. **Share feedback** - Let us know what you think!

## Support

If you have issues:

1. Check backend console for error messages
2. Verify `.env` file has correct settings
3. Make sure backend is running on port 5001
4. Try restarting backend

## FAQ

**Q: Do I need Claude API to use AI Insights?**
A: No! Mock mode works immediately. Claude API is optional for better analysis.

**Q: How much does Claude API cost?**
A: Very cheap - about $0.001-0.003 per idea analysis.

**Q: Can I switch between modes?**
A: Yes! Just add/remove the API key and restart.

**Q: What if Claude API fails?**
A: System automatically falls back to mock insights.

**Q: Is my data sent to Claude?**
A: Only if you enable Claude API. Mock mode keeps everything local.

---

**Ready to try it?** Restart your backend and click the eye icon on an idea!
