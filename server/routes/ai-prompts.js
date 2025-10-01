import express from 'express';
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const router = express.Router();

class GitHubModelService {
  constructor() {
    this.token = process.env.GITHUB_TOKEN || '';
    this.endpoint = "https://models.github.ai/inference";
    this.model = "openai/gpt-4.1-mini";
    
    console.log('🔧 GitHub Models Service initialized');
    console.log('🔑 Token exists:', !!this.token);
    console.log('🔑 Token starts with ghp_:', this.token?.startsWith('ghp_'));
  }

  async generatePrompt(request) {
    console.log('🎯 Server-side GitHub Models - generatePrompt called');
    
    // If no GitHub token or demo mode, use enhanced fallback
    if (!this.token || this.token === 'demo' || this.token === 'your_github_token_here') {
      console.log('⚠️ No valid token, using fallback generation');
      return this.enhancedFallbackGeneration(request);
    }

    try {
      const systemPrompt = this.buildSystemPrompt(request.mode);
      const userPrompt = this.buildUserPrompt(request);

      console.log('🤖 Sending request to GPT-4.1 Mini via GitHub Models...');
      console.log('📨 System prompt length:', systemPrompt.length);
      console.log('📨 User prompt length:', userPrompt.length);
      
      // Create the Azure client following GitHub Models example
      const client = ModelClient(
        this.endpoint,
        new AzureKeyCredential(this.token)
      );

      const response = await client.path("/chat/completions").post({
        body: {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.7,
          top_p: 1.0,
          max_tokens: 1500,
          model: this.model
        }
      });

      console.log('📡 Raw API response received');
      console.log('📡 Response status check - isUnexpected:', isUnexpected(response));

      if (isUnexpected(response)) {
        console.error('❌ GitHub Models API Error - Unexpected response');
        console.error('❌ Error details:', response.body.error);
        throw response.body.error;
      }

      console.log('✅ Response is expected, extracting content...');
      const content = response.body.choices[0]?.message?.content;
      console.log('📝 Raw content received:', content ? 'YES' : 'NO');
      console.log('📝 Content length:', content?.length || 0);
      
      if (!content) {
        console.error('❌ No content in response');
        throw new Error('No response content received from GPT-4.1 Mini');
      }

      console.log('✅ GPT-4.1 Mini response received successfully');
      console.log('🔄 Attempting to parse JSON response...');
      const result = JSON.parse(content);
      console.log('✅ JSON parsed successfully');
      console.log('🔍 Response structure check:', {
        hasPrompt: !!result.prompt,
        hasTool: !!result.tool,
        hasInstructions: !!result.instructions
      });
      
      // Validate the response structure
      if (!result.prompt || !result.tool || !result.instructions) {
        throw new Error('Invalid response structure from AI model');
      }
      
      return result;
    } catch (error) {
      console.error('🔄 GPT-4.1 Mini error, falling back to enhanced generation:', error);
      // Fallback to enhanced local generation if API fails
      return this.enhancedFallbackGeneration(request);
    }
  }

  buildSystemPrompt(mode) {
    const basePrompt = `You are a professional prompt engineer and AI tool expert with deep knowledge of all current AI image generation platforms, their capabilities, pricing, and optimal use cases.

CRITICAL: Always respond with valid JSON in this exact format:
{
  "prompt": "detailed prompt text here",
  "primaryTool": {
    "name": "Best AI tool name",
    "reasoning": "Why this tool is optimal for this specific request",
    "cost": "Free/Paid/Credits",
    "strengths": ["strength1", "strength2", "strength3"]
  },
  "alternativeTools": [
    {
      "name": "Alternative tool name",
      "reasoning": "Why this is a good alternative",
      "cost": "Free/Paid/Credits",
      "strengths": ["strength1", "strength2"]
    },
    {
      "name": "Another alternative",
      "reasoning": "Why this could work",
      "cost": "Free/Paid/Credits", 
      "strengths": ["strength1", "strength2"]
    }
  ],
  "instructions": {
    "primaryTool": [
      "Step 1: Detailed action with URLs if needed",
      "Step 2: Specific instructions for this tool",
      "Step 3: Platform-specific tips",
      "Step 4: How to optimize results",
      "Step 5: Download and refinement steps"
    ],
    "alternatives": {
      "toolName1": ["step1", "step2", "step3", "step4", "step5"],
      "toolName2": ["step1", "step2", "step3", "step4", "step5"]
    }
  },
  "tips": [
    "Advanced tip for better results",
    "Optimization suggestion",
    "Alternative approach if first attempt fails"
  ]
}

IMPORTANT AI TOOL KNOWLEDGE:
- ChatGPT with DALL-E 3: Free with account, excellent for creative/artistic styles, good prompt following
- Microsoft Copilot with DALL-E 3: Free, same DALL-E 3 engine, good for technical/realistic work
- Midjourney: Paid subscription, superior artistic quality, best for high-end creative work
- Leonardo AI: Freemium, good for specific styles, fine-tuned models
- Stable Diffusion (via Stability AI): Pay-per-use, highly customizable, technical control
- Adobe Firefly: Integrated with Creative Suite, commercial safe, good for business use
- Runway ML: Video + image generation, unique capabilities
- Playground AI: Freemium, multiple model access
- Ideogram: Free tier, excellent text generation in images
- Flux: Open source, high quality, various platforms

SELECTION CRITERIA:
1. Match tool capabilities to specific style requirements
2. Consider user's likely budget (prioritize free when quality is comparable)
3. Factor in ease of use and accessibility
4. Consider commercial usage rights if relevant
5. Recommend 3 total options: 1 primary + 2 alternatives with different strengths

Do not include any text outside of this JSON format.`;

    if (mode === 'illustration') {
      return basePrompt + `

FOCUS: Professional illustration creation including:
- Vector graphics, flat design, minimal aesthetics
- Technical diagrams, infographics, UI elements
- Character design, concept art, digital paintings
- Logo design, branding materials
- Scientific and medical illustrations
- Architectural and engineering drawings

EVALUATION PRIORITIES FOR ILLUSTRATIONS:
1. Style precision and control
2. Vector-friendly output quality
3. Text rendering capabilities (if needed)
4. Scalability and resolution
5. Iteration and refinement ease`;
    } else {
      return basePrompt + `

FOCUS: Realistic photography and photo-style generation including:
- Portrait photography, lifestyle shots
- Product photography, commercial imagery
- Landscape and nature photography
- Fashion and editorial photography
- Documentary and journalistic style
- Architectural and interior photography

EVALUATION PRIORITIES FOR PHOTOGRAPHY:
1. Photorealistic quality and lighting
2. Composition and camera angle control
3. Skin tone and human feature accuracy
4. Environmental and atmospheric effects
5. Commercial usage rights and quality`;
    }
  }

  buildUserPrompt(request) {
    const { description, styles, aspectRatio, colors } = request;
    
    let prompt = `Generate a professional AI image prompt for the following:

Description: ${description}

Mode: ${request.mode === 'illustration' ? 'Professional Illustration' : 'Realistic Photography'}

Requirements:
1. Create a detailed, technical prompt focusing on quality and precision
2. Include specific style and composition details
3. Incorporate aspect ratio and technical specifications`;

    if (colors && colors.length > 0) {
      prompt += `
4. Limit color palette to the specified colors for cohesive design
5. Recommend the best AI tool and provide clear implementation steps`;
    } else {
      prompt += `
4. Recommend the best AI tool and provide clear implementation steps
5. Include professional color guidance if no specific colors are provided`;
    }

    prompt += `

Focus on technical accuracy and professional results rather than overly descriptive language.`;
    
    if (styles.length > 0) {
      prompt += `\n\nStyles requested: ${styles.join(', ')}`;
    }
    
    if (aspectRatio) {
      prompt += `\nAspect ratio: ${aspectRatio}`;
    }
    
    if (colors && colors.length > 0) {
      prompt += `\nColor restrictions: ${colors.join(', ')}`;
    }
    
    return prompt;
  }

  enhancedFallbackGeneration(request) {
    console.log('🔄 USING SERVER-SIDE FALLBACK GENERATION - NOT REAL AI!');
    console.log('🔄 This means the GitHub Models API failed or token is invalid');
    const { mode, description, styles, aspectRatio, colors } = request;
    
    let prompt = description;
    
    // Add styles with professional integration
    if (styles.length > 0) {
      const styleNames = styles.map(style => {
        return style.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      });
      prompt += `, ${styleNames.join(' and ')} style`;
    }
    
    // Add color limitations if specified
    if (colors && colors.length > 0) {
      prompt += `, limited color palette: ${colors.join(', ')}`;
    }
    
    // Add aspect ratio consideration
    if (aspectRatio) {
      const ratioText = aspectRatio.replace(':', ' by ');
      prompt += `, ${ratioText} aspect ratio`;
    }
    
    // Add mode-specific enhancement
    if (mode === 'illustration') {
      prompt += ', professional illustration style, clean and modern design, vector-like quality';
    } else {
      prompt += ', photorealistic, professional photography, high quality, detailed';
    }
    
    // Enhanced fallback with AI-style structure but basic logic
    const primaryTool = mode === 'illustration' ? 'ChatGPT with DALL-E 3' : 'Microsoft Copilot with DALL-E 3';
    
    return {
      prompt: prompt,
      primaryTool: {
        name: primaryTool,
        reasoning: "Fallback recommendation - reliable free option",
        cost: "Free",
        strengths: ["Accessible", "Good quality", "Easy to use"]
      },
      alternativeTools: [
        {
          name: "Midjourney",
          reasoning: "Higher artistic quality for professional work",
          cost: "Paid",
          strengths: ["Superior quality", "Artistic excellence"]
        },
        {
          name: "Leonardo AI", 
          reasoning: "Good alternative with multiple model options",
          cost: "Freemium",
          strengths: ["Model variety", "Fine-tuned options"]
        }
      ],
      instructions: {
        primaryTool: [
          `Open ${primaryTool.includes('ChatGPT') ? 'ChatGPT (chat.openai.com)' : 'Microsoft Copilot (copilot.microsoft.com)'} - it's free!`,
          'Copy the generated prompt above',
          'Paste it into the chat interface',
          `Specify "${aspectRatio} aspect ratio" in your request`,
          'Download and refine the result as needed'
        ],
        alternatives: {
          "Midjourney": [
            "Subscribe to Midjourney (midjourney.com)",
            "Join their Discord server",
            "Use /imagine command with the prompt",
            "Specify aspect ratio with --ar parameter",
            "Upscale and download your favorite result"
          ],
          "Leonardo AI": [
            "Create account at Leonardo.ai",
            "Select appropriate model for your style",
            "Input the prompt in the generation interface", 
            "Set aspect ratio and other parameters",
            "Generate and download results"
          ]
        }
      },
      tips: [
        "Try multiple variations of the prompt for better results",
        "Experiment with different aspect ratios",
        "Add style-specific keywords if results aren't matching expectations"
      ]
    };
  }
}

// Initialize the service
const githubModelService = new GitHubModelService();

// POST /api/ai-prompts/generate
router.post('/generate', async (req, res) => {
  try {
    console.log('🎯 AI Prompt generation endpoint called');
    console.log('📝 Request body:', req.body);
    
    const { mode, description, styles, aspectRatio, colors } = req.body;
    
    // Validate required fields
    if (!mode || !description) {
      return res.status(400).json({
        error: 'Missing required fields: mode and description are required'
      });
    }
    
    const request = {
      mode,
      description,
      styles: styles || [],
      aspectRatio: aspectRatio || '1:1',
      colors: colors || []
    };
    
    const result = await githubModelService.generatePrompt(request);
    
    console.log('✅ AI Prompt generation completed successfully');
    res.json(result);
    
  } catch (error) {
    console.error('❌ AI Prompt generation error:', error);
    res.status(500).json({
      error: 'Failed to generate AI prompt',
      details: error.message
    });
  }
});

export default router;