# AI Innovation Insights Setup Guide

This guide explains how to set up and use the real AI-powered innovation insights feature in ClassForge.

## Overview

The AI Innovation Insights feature uses Claude 3.5 Sonnet API to analyze student ideas and provide:
- Innovation potential score (60-100)
- Feasibility assessment (1-10)
- Impact potential (1-10)
- Market potential (1-10)
- Key strengths and opportunities
- Recommendations for improvement
- Potential risk factors

## Prerequisites

1. **Claude API Key** - Get one from [Anthropic Console](https://console.anthropic.com)
2. **Node.js** - Backend requires Node.js 14+
3. **npm** - For package management

## Installation Steps

### 1. Install Anthropic SDK

Run this command in the backend directory:

```bash
npm install @anthropic-ai/sdk
```

### 2. Configure Environment Variables

Add your Claude API key to `.env` file in the backend:

```env
ANTHROPIC_API_KEY=sk-ant-your-actual-api-key-here
```

Replace `sk-ant-your-actual-api-key-here` with your actual API key from Anthropic Console.

### 3. Verify Backend Setup

The following files have been updated:
- `backend/services/aiInsightsService.js` - AI analysis service
- `backend/controllers/ideaController.js` - Added `getAiInsights` endpoint
- `backend/routes/ideaRoutes.js` - Added `/ideas/:id/ai-insights` route

### 4. Verify Frontend Setup

The following files have been updated:
- `frontend/src/services/api.js` - Added `getAiInsights` API call
- `frontend/src/pages/TeacherDashboard/ReviewIdeas.jsx` - AI modal display
- `frontend/src/pages/TeacherDashboard/ReviewIdeas.module.css` - Styling for AI insights

## How It Works

### Backend Flow

1. Teacher clicks the eye icon on an idea in the Review Ideas table
2. Frontend calls `GET /api/ideas/:id/ai-insights`
3. Backend fetches the idea from database
4. `aiInsightsService.js` sends the idea details to Claude API
5. Claude analyzes the idea and returns structured insights
6. Backend returns the insights to frontend

### Frontend Flow

1. Modal opens showing the AI insights
2. Displays:
   - Project description
   - AI Innovation Insight with score
   - Key points (3 main strengths)
   - Metrics: Feasibility, Impact, Market Potential
   - Recommendations for improvement
   - Risk factors
   - Submitter information
3. Teacher can add feedback and approve/reject the idea

## API Response Format

The AI insights endpoint returns:

```json
{
  "insight": "Professional analysis of the idea",
  "score": 85,
  "keyPoints": [
    "Strength 1",
    "Strength 2",
    "Strength 3"
  ],
  "feasibility": 8,
  "feasibilityReason": "Why it's feasible",
  "impact": 9,
  "impactReason": "Why it has impact",
  "marketPotential": 7,
  "marketReason": "Market opportunity",
  "recommendations": [
    "Recommendation 1",
    "Recommendation 2",
    "Recommendation 3"
  ],
  "riskFactors": [
    "Risk 1",
    "Risk 2"
  ]
}
```

## Testing the Feature

1. Start the backend server:
   ```bash
   npm run dev
   ```

2. Start the frontend:
   ```bash
   npm run dev
   ```

3. Log in as a teacher
4. Go to "Review Ideas"
5. Click the eye icon on any pending idea
6. Wait for AI analysis to load (first time may take 2-3 seconds)
7. Review the insights and provide feedback
8. Click "Approve Idea" or "Reject Submission"

## Troubleshooting

### "Error generating AI insights"
- Check that `ANTHROPIC_API_KEY` is set in `.env`
- Verify the API key is valid and has available credits
- Check backend console for detailed error messages

### API Key not working
- Ensure the key starts with `sk-ant-`
- Verify it's from [Anthropic Console](https://console.anthropic.com)
- Check that your account has available credits

### Slow response
- First request may take 2-3 seconds due to API latency
- Subsequent requests should be faster
- Check your internet connection

### Module not found error
- Run `npm install @anthropic-ai/sdk` in backend directory
- Restart the backend server

## Cost Considerations

- Claude 3.5 Sonnet API is pay-as-you-go
- Each idea analysis costs approximately $0.001-0.003 USD
- Monitor your usage in [Anthropic Console](https://console.anthropic.com)

## Security Notes

- Never commit your API key to version control
- Use environment variables for sensitive data
- The API key is only used on the backend, never exposed to frontend
- Ideas are sent to Claude API for analysis (ensure compliance with your data policies)

## Future Enhancements

Possible improvements:
- Cache AI insights to reduce API calls
- Batch process multiple ideas
- Add custom analysis prompts per domain
- Store insights in database for historical comparison
- Add sentiment analysis
- Generate comparison reports between similar ideas
