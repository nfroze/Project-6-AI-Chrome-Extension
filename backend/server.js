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
const ROAST_CONTEXT = process.env.ROAST_CONTEXT || 'ERROR: No ROAST_CONTEXT set in environment variables!';

// Roast endpoint
app.post('/roast', async function(req, res) {
  try {
    const { postText } = req.body;
    
    if (!postText || postText.trim().length === 0) {
      return res.status(400).json({ error: 'No post text provided' });
    }
    
    // Track usage
    roastCount++;
    console.log(`🔥 Roast #${roastCount} - ~$${(roastCount * 0.0006).toFixed(4)} spent`);
    console.log('📝 Post preview:', postText.substring(0, 100) + '...');
    
    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 400,
      temperature: 0.9,
      system: ROAST_CONTEXT,
      messages: [
        {
          role: 'user',
          content: `Analyze this LinkedIn post and respond with ONLY valid JSON:
{
  "score": NUMBER,
  "tldr": "STRING"
}

The post:
"${postText}"`
        }
      ]
    });
    
    // Parse Claude's response
    try {
      const responseText = message.content[0].text;
      console.log('Claude raw response:', responseText);
      
      // Method 1: Try direct JSON parse first
      try {
        const roastData = JSON.parse(responseText);
        return res.json(roastData);
      } catch (e) {
        // Continue to next method
      }
      
      // Method 2: Extract JSON with better regex
      const jsonMatch = responseText.match(/\{[^{}]*"score"\s*:\s*\d+[^{}]*"tldr"\s*:\s*"[^"]*"[^{}]*\}/);
      if (jsonMatch) {
        try {
          const roastData = JSON.parse(jsonMatch[0]);
          return res.json(roastData);
        } catch (e) {
          // Continue to next method
        }
      }
      
      // Method 3: Manual extraction
      const scoreMatch = responseText.match(/"score"\s*:\s*(\d+)/);
      const tldrMatch = responseText.match(/"tldr"\s*:\s*"([^"]*)"/s);
      
      if (scoreMatch && tldrMatch) {
        return res.json({
          score: parseInt(scoreMatch[1]),
          tldr: tldrMatch[1].replace(/\n/g, ' ').trim()
        });
      }
      
      throw new Error('Could not parse response');
      
    } catch (parseError) {
      console.error('Parse error:', parseError);
      console.error('Full response was:', message.content[0].text);
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

// Export for Vercel
module.exports = app;