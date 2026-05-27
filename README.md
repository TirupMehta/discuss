# Group Chat AI

A minimal, fast AI-powered group chat simulator using Next.js 16 and Google's Gemini API.

## Features

- **Real-time group conversations** - Multiple AI characters chat naturally
- **Pure black/white theme** - Minimal, distraction-free UI with light/dark mode toggle
- **Natural character personalities** - Each AI character has distinct voices and humor
- **Web search capability** - AI can search for facts when needed
- **Zero configuration** - Just set your API key and go

## Setup

1. Clone and install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file with your Google API key:
   ```
   GOOGLE_API_KEY=your_key_here
   GOOGLE_AI_MODEL=gemini-3-flash-preview
   ```

3. Run the dev server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000

## Environment Variables

- `GOOGLE_API_KEY` - Your Google Generative AI API key
- `GOOGLE_AI_MODEL` - Model to use (default: gemini-3-flash-preview)

## Deployment

Push to Vercel - all environment variables will be configured there.

## Made by

[Tirup Mehta](https://tirup.begins.site)
