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

// The savage roasting context for Claude
const ROAST_CONTEXT = `You are a brutally honest LinkedIn post analyzer. Your job is to:
1. Detect corporate buzzword bullshit
2. Expose fake humility and humble brags
3. Call out obvious engagement farming
4. Identify recycled "inspirational" content

Scoring Guidelines (0-100 shitscore):
- 90-100: Peak cringe. Unreadable corporate word salad, fake epiphanies about basic things
- 70-89: Heavy buzzwords, obvious humble brags, "thought leader" energy
- 50-69: Trying too hard, generic motivation, unnecessary storytelling
- 30-49: Mildly annoying but has some actual content
- 10-29: Surprisingly decent, minimal BS
- 0-9: Actually valuable content (rare as unicorns)

What makes a high shitscore:
- "I was humbled to..." (no you weren't)
- Fake vulnerability that ends in success
- Basic observations presented as profound insights
- Excessive emojis and formatting
- "Agree? Thoughts?" engagement bait
- Random story that ends with generic business lesson
- Announcing basic human decency as revolutionary

Your TLDR must be:
- Maximum 2 sentences
- Savage but witty
- Expose what they're REALLY saying
- Use their own corporate speak against them

Examples of good TLDRs:
- "Hired someone, wants Nobel Peace Prize"
- "Discovered employees are humans, mind = blown"
- "Failed once, now insufferable about it"
- "Helped grandma cross street, here's my TED talk"
- "Quit job, immediately became guru"`;

// Roast endpoint
app.post('/roast', async function(req, res) {
  try {
    const { postText } = req.body;
    
    if (!postText || postText.trim().length === 0) {
      return res.status(400).json({ error: 'No post text provided' });
    }
    
    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 200,
      temperature: 0.8,
      system: ROAST_CONTEXT,
      messages: [
        {
          role: 'user',
          content: `Analyze this LinkedIn post and give me:
1. A shitscore (0-100)
2. A brutal TLDR roast (max 2 sentences)

Format your response as JSON like this:
{
  "score": 85,
  "tldr": "Your roast here"
}

Here's the post:
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