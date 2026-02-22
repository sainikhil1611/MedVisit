# Get Your FREE Gemini API Key

## Step 1: Visit Google AI Studio
Go to: **https://makersuite.google.com/app/apikey**

Or search for "Google AI Studio API Key"

## Step 2: Sign in with Google Account
Use any Google account (Gmail, etc.)

## Step 3: Create API Key
1. Click "Create API Key" button
2. Select "Create API key in new project" (or use existing project)
3. Copy the generated API key

## Step 4: Add to .env File
Open `backend/twelvelabs/.env` and add:

```
GEMINI_API_KEY=AIzaSy...your_key_here
```

## Step 5: Restart Backend

```bash
cd backend/twelvelabs
uvicorn main:app --reload --port 8000
```

## That's it! 🎉

Now upload your After Visit Summary document on the Dashboard!

## Free Tier Limits

Gemini 1.5 Flash (what we're using):
- ✅ **FREE** up to 1500 requests per day
- ✅ **FREE** up to 1 million tokens per minute
- ✅ **FREE** up to 15 requests per minute

More than enough for your hackathon needs! 🚀

## Troubleshooting

If you get rate limit errors:
- Wait a few seconds between uploads
- The free tier resets daily

If API key doesn't work:
- Make sure you copied the full key (starts with `AIzaSy`)
- Check there are no extra spaces
- Verify the key is enabled in Google Cloud Console
