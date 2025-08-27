# Project 6: AI Chrome Extension

## Overview

Chrome extension that analyses LinkedIn posts using AI. Provides summaries and satirical commentary.

## Features

### TLDR Mode
- Summarises LinkedIn posts
- Extracts key points
- Reduces lengthy content

### Roast Mode
- Generates spam score (0-100)
- Provides satirical commentary
- Flags high-scoring posts

## How It Works

1. User navigates to LinkedIn post
2. Clicks extension button (TLDR or Roast)
3. Extension extracts post text
4. Sends to backend server
5. Server queries Claude AI API
6. Returns summary or commentary
7. Results display under post

Processing time: approximately 2 seconds. No data storage.

## Installation

Manual installation:
1. Download repository
2. Enable Chrome developer mode
3. Load unpacked extension from `extension` folder
4. Extension available on LinkedIn

## Technical Stack

- Frontend: JavaScript Chrome Extension
- Backend: Express.js on Vercel
- AI: Claude 3.5 Sonnet API
- Architecture: Extension → Vercel → Claude API

## API Usage

Uses Anthropic API with pay-per-use pricing. Limited by API budget.

## Privacy

- No data storage
- No user tracking
- Stateless operation

## Project Structure

```
Project-6-Chrome-Extension/
├── extension/
│   ├── manifest.json
│   ├── content.js
│   └── popup.html
├── backend/
│   └── server.js
└── screenshots/
```

## Screenshots

Available in repository screenshots folder.