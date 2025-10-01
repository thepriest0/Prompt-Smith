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
    const basePrompt = `You are a professional prompt engineer with expertise in AI image generation. Create highly effective, detailed prompts that produce exceptional results.

CRITICAL: Always respond with valid JSON in this exact format:
{
  "prompt": "detailed prompt text here",
  "tool": "recommended AI tool name", 
  "instructions": ["step 1", "step 2", "step 3", "step 4", "step 5"]
}

Do not include any text outside of this JSON format.`;

    if (mode === 'illustration') {
      return basePrompt + `

Create professional illustration prompts focused on:
- Clean, minimal design aesthetics
- Precise geometric compositions
- Professional color schemes and contrast
- Modern visual hierarchy
- Scalable vector-style artwork
- Interface elements and iconography

TOOL RECOMMENDATION LOGIC FOR ILLUSTRATIONS:
- For experimental, remix, creative blending: Recommend "Google Whisk" (FREE/EXPERIMENTAL)
- For flat vector, minimal, geometric styles: Recommend "ChatGPT with DALL-E 3" (FREE)
- For technical diagrams, isometric: Recommend "Microsoft Copilot with DALL-E 3" (FREE)
- For character design, fantasy (advanced): Recommend "Leonardo AI" (FREEMIUM) only when specifically needed
- For text-heavy designs, logos: Recommend "Ideogram" (FREEMIUM) only when text integration is critical
- For 3D renders, complex gradients: Recommend "Midjourney" (PAID) only when free tools insufficient

Always prioritize FREE tools first, then suggest premium options only when style specifically requires advanced features.`;
    } else {
      return basePrompt + `

Create professional photography prompts focused on:
- Realistic lighting and composition
- Professional camera settings and techniques
- Natural environments and subjects
- Photographic style specifications
- Color grading and post-processing details

TOOL RECOMMENDATION LOGIC FOR PHOTOGRAPHY:
- For ultra-realistic, professional photography: Recommend "Google Whisk" (FREE/EXPERIMENTAL)
- For portraits, lifestyle, nature: Recommend "ChatGPT with DALL-E 3" (FREE)
- For product photography, studio work: Recommend "Microsoft Copilot with DALL-E 3" (FREE)
- For artistic, creative photography: Recommend "Leonardo AI" (FREEMIUM) only when artistic style critical
- For high-fashion, commercial, cinematic: Recommend "Midjourney" (PAID) only when commercial quality essential
- For fine-art, custom styles: Recommend "Stable Diffusion via ComfyUI" (FREE but technical) for advanced users

Always start with FREE tools and only suggest premium options when free alternatives cannot achieve the desired quality.`;
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
    
    // Enhanced fallback with better tool recommendations based on 2024 AI landscape
    let recommendedTool;
    if (mode === 'illustration') {
      if (description.toLowerCase().includes('experimental') || description.toLowerCase().includes('remix') || description.toLowerCase().includes('creative blend')) {
        recommendedTool = 'Google Whisk';
      } else if (description.toLowerCase().includes('text') || description.toLowerCase().includes('logo')) {
        recommendedTool = 'Ideogram';
      } else if (description.toLowerCase().includes('character') || description.toLowerCase().includes('fantasy')) {
        recommendedTool = 'ChatGPT with DALL-E 3';
      } else {
        recommendedTool = 'ChatGPT with DALL-E 3';
      }
    } else {
      if (description.toLowerCase().includes('ultra realistic') || description.toLowerCase().includes('professional photo') || description.toLowerCase().includes('realistic picture')) {
        recommendedTool = 'Google Whisk';
      } else if (description.toLowerCase().includes('artistic') || description.toLowerCase().includes('creative')) {
        recommendedTool = 'ChatGPT with DALL-E 3';
      } else {
        recommendedTool = 'ChatGPT with DALL-E 3';
      }
    }
    
    return {
      prompt: prompt,
      tool: recommendedTool,
      instructions: [
        `Open ${recommendedTool} in your browser`,
        'Copy the generated prompt above',
        'Paste it into the chat interface',
        'Review and refine the generated image',
        'Download your final result'
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