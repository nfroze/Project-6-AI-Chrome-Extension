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
let tldrCount = 0;
let roastCount = 0;

// The contexts for different modes
const ROAST_CONTEXT = process.env.ROAST_CONTEXT || 'ERROR: No ROAST_CONTEXT set in environment variables!';
const TLDR_CONTEXT = process.env.TLDR_CONTEXT || 'ERROR: No TLDR_CONTEXT set in environment variables!';

// Analyze endpoint (handles both TLDR and ROAST modes)
app.post('/analyze', async function(req, res) {
  try {
    const { postText, mode } = req.body;
    
    if (!postText || postText.trim().length === 0) {
      return res.status(400).json({ error: 'No post text provided' });
    }
    
    if (!mode || !['tldr', 'roast'].includes(mode)) {
      return res.status(400).json({ error: 'Invalid mode. Use "tldr" or "roast"' });
    }
    
    // Track usage based on mode
    if (mode === 'tldr') {
      tldrCount++;
      console.log(`🥱 TLDR #${tldrCount}`);
    } else {
      roastCount++;
      console.log(`🔥 Roast #${roastCount}`);
    }
    
    const totalCalls = tldrCount + roastCount;
    console.log(`💰 Total API calls: ${totalCalls} - ~$${(totalCalls * 0.0006).toFixed(4)} spent`);
    console.log('📝 Post preview:', postText.substring(0, 100) + '...');
    
    // Select context based on mode
    const systemPrompt = mode === 'tldr' ? TLDR_CONTEXT : ROAST_CONTEXT;
    
    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-20250514',
      max_tokens: 400,
      temperature: mode === 'tldr' ? 0.3 : 1.0, // Lower temp for TLDR, higher for creative roasts
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Analyze this LinkedIn post and respond with ONLY valid JSON:
${mode === 'tldr' ? 
`{
  "tldr": "STRING"
}` : 
`{
  "score": NUMBER,
  "roast": "STRING"
}`}

The post:
"${postText}"`
        }
      ]
    });
    
    // Parse Claude's response
    try {
      const responseText = message.content[0].text;
      console.log(`Claude ${mode} response:`, responseText);
      
      // Method 1: Try direct JSON parse first
      try {
        const resultData = JSON.parse(responseText);
        return res.json({ mode, ...resultData });
      } catch (e) {
        // Continue to next method
      }
      
      // Method 2: Extract JSON with regex based on mode
      let jsonMatch;
      if (mode === 'tldr') {
        jsonMatch = responseText.match(/\{[^{}]*"tldr"\s*:\s*"[^"]*"[^{}]*\}/);
      } else {
        jsonMatch = responseText.match(/\{[^{}]*"score"\s*:\s*\d+[^{}]*"roast"\s*:\s*"[^"]*"[^{}]*\}/);
      }
      
      if (jsonMatch) {
        try {
          const resultData = JSON.parse(jsonMatch[0]);
          return res.json({ mode, ...resultData });
        } catch (e) {
          // Continue to next method
        }
      }
      
      // Method 3: Manual extraction based on mode
      if (mode === 'tldr') {
        const tldrMatch = responseText.match(/"tldr"\s*:\s*"([^"]*)"/s);
        if (tldrMatch) {
          return res.json({
            mode: 'tldr',
            tldr: tldrMatch[1].replace(/\n/g, ' ').trim()
          });
        }
      } else {
        const scoreMatch = responseText.match(/"score"\s*:\s*(\d+)/);
        const roastMatch = responseText.match(/"roast"\s*:\s*"([^"]*)"/s);
        
        if (scoreMatch && roastMatch) {
          return res.json({
            mode: 'roast',
            score: parseInt(scoreMatch[1]),
            roast: roastMatch[1].replace(/\n/g, ' ').trim()
          });
        }
      }
      
      throw new Error('Could not parse response');
      
    } catch (parseError) {
      console.error('Parse error:', parseError);
      console.error('Full response was:', message.content[0].text);
      
      if (mode === 'tldr') {
        return res.json({
          mode: 'tldr',
          tldr: "This post was so convoluted even I couldn't summarize it."
        });
      } else {
        return res.json({
          mode: 'roast',
          score: 75,
          roast: "This post broke my parser. That's how generic it is."
        });
      }
    }
    
  } catch (error) {
    console.error('API Error:', error);
    
    // Check if it's a rate limit error
    if (error.status === 429) {
      return res.status(429).json({
        error: 'Rate limited',
        mode: req.body.mode,
        ...(req.body.mode === 'tldr' ? 
          { tldr: "API budget burned out. The $5 challenge is complete!" } :
          { score: 100, roast: "API budget burned out from too much cringe. Mission accomplished!" }
        )
      });
    }
    
    return res.status(500).json({
      error: 'Failed to analyze',
      mode: req.body.mode,
      ...(req.body.mode === 'tldr' ? 
        { tldr: "Failed to process this masterpiece." } :
        { score: 0, roast: "Even I couldn't roast this. That's concerning." }
      )
    });
  }
});

// Keep the old endpoint for backwards compatibility
app.post('/roast', async function(req, res) {
  req.body.mode = 'roast';
  return app._router.handle(req, res);
});

// Health check
app.get('/health', function(req, res) {
  res.json({ 
    status: 'Ready to analyze! 🔥🥱',
    stats: {
      tldrCount,
      roastCount,
      totalCalls: tldrCount + roastCount,
      estimatedCost: `$${((tldrCount + roastCount) * 0.0006).toFixed(4)}`
    }
  });
});

// Start server
app.listen(PORT, function() {
  console.log(`🔥🥱 LinkedIn Analyzer backend running on port ${PORT}`);
  console.log(`🔥 Make sure CLAUDE_API_KEY, ROAST_CONTEXT, and TLDR_CONTEXT are set`);
});

// Export for Vercel
module.exports = app;