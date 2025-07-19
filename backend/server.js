const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Claude
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());

// Track API usage
let roastCount = 0;

// The savage roasting context for Claude
const ROAST_CONTEXT = `You are a savage LinkedIn post roaster. Your job has two parts:

1. SCORING (Be objective):
Score how much of a "shitpost" this is from 0-100:
- 0-20: Actually valuable content with real insights, data, or useful advice
- 20-40: Decent content with some fluff mixed in
- 40-60: Generic but harmless, some value buried in corporate speak
- 60-80: Classic LinkedIn cringe - humble brags, fake stories, buzzword soup
- 80-95: Weapons-grade corporate theater, pure engagement farming
- 95-100: Crimes against humanity, makes you lose faith in professional networking


2. ROASTING (Be as horrible as possible to EVERYONE):
REGARDLESS of the score, roast the fuck out of this post. Even if it's genuinely helpful content, find something to mock. The humor is in roasting everything:

Especially look for: 
- Generic shit content that people post just to game the algorithm 
- Content people clearly didnt write themselves (look for obvious AI use)
- Posts that arent about someone actually building something, just regurgitating pointless information
- Content that comes across as groundbreaking when its actually not that deep
- People that talk like they are the main character and are overly dramatic

Anything along these lines needs an extra spoonful of roast - if its especially bad give it a #CertifiedShitPost💩 tag at the end
  
Be sarcastic and brutal and dont be afraid to offend anyone - this is the internet, man up.`;

// Roast endpoint
app.post('/roast', async function(req, res) {
  try {
    const { postText } = req.body;
    
    if (!postText || postText.trim().length === 0) {
      return res.status(400).json({ error: 'No post text provided' });
    }
    
    // Track usage
    roastCount++;
    console.log(`🔥 Roast #${roastCount} - ~${(roastCount * 0.0006).toFixed(4)} spent`);
    
    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 400,
      temperature: 0.9,
      system: ROAST_CONTEXT,
      messages: [
        {
          role: 'user',
          content: `Score this LinkedIn post objectively, then roast it savagely no matter how good it is.

Return JSON:
{
  "score": [0-100 based on how much of a shitpost it is],
  "tldr": "[savage roast - be brutal even if it's good content]"
}

The post:
"${postText}"`
        }
      ]
    });
    
    // Parse Claude's response
    try {
      const responseText = message.content[0].text;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const roastData = JSON.parse(jsonMatch[0]);
        return res.json(roastData);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (parseError) {
      console.error('Parse error:', parseError);
      return res.json({
        score: 75,
        tldr: "This post broke my parser. That's how generic it is."
      });
    }
    
  } catch (error) {
    console.error('API Error:', error);
    
    // Check if it's a rate limit error
    if (error.status === 429) {
      return res.status(429).json({
        error: 'Rate limited',
        score: 100,
        tldr: "API budget burned out from too much cringe. Mission accomplished!"
      });
    }
    
    return res.status(500).json({
      error: 'Failed to roast',
      score: 0,
      tldr: "Even I couldn't roast this. That's concerning."
    });
  }
});

// Health check
app.get('/health', function(req, res) {
  res.json({ status: 'Ready to roast! 🔥' });
});

// Start server
app.listen(PORT, function() {
  console.log(`🔥 LinkedIn Roaster backend running on port ${PORT}`);
  console.log(`🔥 Make sure your CLAUDE_API_KEY is set in .env file`);
});