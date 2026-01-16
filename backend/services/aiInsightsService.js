let client;
let useRealAI = false;

try {
  const Anthropic = require('@anthropic-ai/sdk');
  if (process.env.ANTHROPIC_API_KEY) {
    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    useRealAI = true;
    console.log('✓ AI Insights: Using Claude API');
  } else {
    console.warn('⚠️  ANTHROPIC_API_KEY not set. Using mock AI insights.');
  }
} catch (error) {
  console.warn('⚠️  Anthropic SDK not installed. Using mock AI insights.');
  console.warn('    Run: npm install @anthropic-ai/sdk');
  client = null;
}

// Mock AI insights generator for when API is not available
const generateMockInsights = (idea) => {
  const domainInsights = {
    'Technology': {
      insight: `"${idea.title}" is a technology-focused innovation that leverages modern computing principles. The solution demonstrates practical application potential with clear implementation pathways and scalability considerations.`,
      feasibility: 8,
      feasibilityReason: 'Technology solutions are generally feasible with proper resources and expertise',
      impact: 8,
      impactReason: 'Technology innovations typically have broad reach and transformative potential',
      marketPotential: 8,
      marketReason: 'Tech market is growing with strong demand for innovative solutions'
    },
    'Healthcare': {
      insight: `"${idea.title}" addresses healthcare challenges with a thoughtful approach. The idea shows potential to improve patient outcomes or healthcare delivery efficiency with appropriate regulatory considerations.`,
      feasibility: 7,
      feasibilityReason: 'Healthcare solutions require regulatory compliance but are achievable',
      impact: 9,
      impactReason: 'Healthcare innovations directly improve lives and have significant social impact',
      marketPotential: 8,
      marketReason: 'Healthcare market is substantial with consistent demand for improvements'
    },
    'Education': {
      insight: `"${idea.title}" presents an educational innovation with potential to enhance learning outcomes. The concept demonstrates understanding of pedagogical principles and practical implementation feasibility.`,
      feasibility: 8,
      feasibilityReason: 'Educational solutions are generally feasible with institutional support',
      impact: 8,
      impactReason: 'Education innovations create long-term positive effects on learners',
      marketPotential: 7,
      marketReason: 'Education sector values innovative solutions for improved learning'
    },
    'Infrastructure': {
      insight: `"${idea.title}" tackles infrastructure challenges with a systematic approach. The solution shows potential for significant operational improvements and resource optimization.`,
      feasibility: 7,
      feasibilityReason: 'Infrastructure projects require planning but are implementable',
      impact: 9,
      impactReason: 'Infrastructure improvements benefit large populations and communities',
      marketPotential: 8,
      marketReason: 'Infrastructure investment is a priority in many sectors'
    },
    'Environment': {
      insight: `"${idea.title}" addresses environmental concerns with a sustainable approach. The idea demonstrates commitment to ecological responsibility and practical environmental stewardship.`,
      feasibility: 7,
      feasibilityReason: 'Environmental solutions require coordination but are achievable',
      impact: 9,
      impactReason: 'Environmental innovations create lasting positive ecological impact',
      marketPotential: 7,
      marketReason: 'Sustainability is increasingly valued across industries'
    }
  };

  const domain = idea.domain || 'Technology';
  const baseInsight = domainInsights[domain] || domainInsights['Technology'];

  return {
    insight: baseInsight.insight,
    score: Math.floor(Math.random() * 20) + 75, // 75-95
    keyPoints: [
      'Clear problem identification and solution approach',
      'Practical implementation feasibility with available resources',
      'Potential for meaningful impact and real-world application'
    ],
    feasibility: baseInsight.feasibility,
    feasibilityReason: baseInsight.feasibilityReason,
    impact: baseInsight.impact,
    impactReason: baseInsight.impactReason,
    marketPotential: baseInsight.marketPotential,
    marketReason: baseInsight.marketReason,
    recommendations: [
      'Develop a detailed implementation roadmap with clear milestones',
      'Identify and secure necessary resources and stakeholder support',
      'Create a prototype or pilot program to validate core assumptions'
    ],
    riskFactors: [
      'Resource constraints may impact implementation timeline',
      'Market adoption may require additional awareness and education'
    ]
  };
};

const generateAiInsights = async (idea) => {
  // If real AI is available, use it
  if (useRealAI && client) {
    try {
      const prompt = `You are an expert innovation analyst. Analyze the following student idea submission and provide detailed insights about its potential, feasibility, and impact.

IDEA DETAILS:
Title: ${idea.title}
Domain: ${idea.domain}
Description: ${idea.description}
Tags: ${idea.tags?.join(', ') || 'None'}

Please provide a comprehensive analysis in the following JSON format (respond ONLY with valid JSON, no markdown):
{
  "insight": "A 2-3 sentence professional analysis of the idea's potential and innovation value",
  "score": <number between 60-100 representing innovation potential>,
  "keyPoints": [
    "First key strength or opportunity",
    "Second key strength or opportunity", 
    "Third key strength or opportunity"
  ],
  "feasibility": <number between 1-10>,
  "feasibilityReason": "Brief explanation of feasibility rating",
  "impact": <number between 1-10>,
  "impactReason": "Brief explanation of potential impact",
  "marketPotential": <number between 1-10>,
  "marketReason": "Brief explanation of market potential",
  "recommendations": [
    "First recommendation for improvement",
    "Second recommendation for improvement",
    "Third recommendation for improvement"
  ],
  "riskFactors": [
    "First potential risk or challenge",
    "Second potential risk or challenge"
  ]
}`;

      const message = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const responseText = message.content[0].text;
      const insights = JSON.parse(responseText);
      
      return {
        success: true,
        insights,
        source: 'claude'
      };
    } catch (error) {
      console.error('Claude API error:', error.message);
      // Fall back to mock insights
      console.log('Falling back to mock insights...');
      return {
        success: true,
        insights: generateMockInsights(idea),
        source: 'mock'
      };
    }
  }

  // Use mock insights if real AI is not available
  return {
    success: true,
    insights: generateMockInsights(idea),
    source: 'mock'
  };
};

module.exports = { generateAiInsights };
