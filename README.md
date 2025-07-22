# 🌐 Project 6: Full Stack Chrome Extension with AI Integration

A Chrome extension that uses AI to analyze LinkedIn posts for spam and quality metrics in one click

## What It Does

One-click AI analysis of any LinkedIn post:
- **SpamScore™** (0-100): How spammy is it?
- **Savage TLDR**: What they're really saying
- **#CertifiedSpamPost📧**: Badge for 80+ scores

## Screenshots

<div align="center">
  <img src="screenshots/1.png" width="400" alt="1">
  <img src="screenshots/2.png" width="400" alt="2">
  <img src="screenshots/3.png" width="400" alt="3">
  <img src="screenshots/4.png" width="400" alt="4">
</div>

## How It Works

1. **Click** the analyze button on any LinkedIn post
2. **Extension** grabs the post text from the page
3. **Sends** it to my server
4. **Server** asks AI to analyze the post
5. **AI** scores the spam level and writes an analysis
6. **Results** sent back to your browser
7. **Display** the analysis right on the LinkedIn post
8. **Review** the quality assessment

All in ~2 seconds. No data stored. Pure stateless analysis.

## Installation

**Chrome Web Store**: [Pending Approval]

**Manual Install**:
1. Download this repo
2. Chrome → Extensions → Developer mode ON
3. Load unpacked → Select the `extension` folder
4. Go analyze some LinkedIn posts

## Tech Stack

- **Frontend**: Vanilla JS Chrome Extension
- **Backend**: Express.js on Vercel  
- **AI**: Claude 3.5 Sonnet (Anthropic)
- **Architecture**: Extension → Vercel → Claude API → Quality analysis

## The $5 Challenge 🔥

Using my personal API budget. Once it burns out, the extension dies.

Let's see how fast the internet can analyze $5 worth of posts!

## Privacy

- No data stored
- No tracking
- No BS
- [Privacy Policy](./PRIVACY.md)

---

**Built by nfroze** | [GitHub](https://github.com/nfroze)

*Currently seeking opportunities in DevSecOps & Full-Stack Development*