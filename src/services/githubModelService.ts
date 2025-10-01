import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

// GitHub Model Marketplace API service for GPT-4.1 Mini
export interface PromptGenerationRequest {
  mode: 'illustration' | 'image';
  description: string;
  styles: string[];
  aspectRatio: string;
  colors?: string[];
}

export interface PromptGenerationResponse {
  prompt: string;
  tool: string;
  instructions: string[];
}

class GitHubModelService {
  private token: string;
  private endpoint: string;
  private model: string;

  constructor() {
    // Use GitHub token from environment
    this.token = import.meta.env.VITE_GITHUB_TOKEN || '';
    this.endpoint = "https://models.github.ai/inference";
    this.model = "openai/gpt-4.1-mini";
  }

  async generatePrompt(request: PromptGenerationRequest): Promise<PromptGenerationResponse> {
    console.log('🎯 GitHub Models Service - generatePrompt called');
    console.log('🔑 Token exists:', !!this.token);
    console.log('🔑 Token starts with ghp_:', this.token?.startsWith('ghp_'));
    
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

  private buildSystemPrompt(mode: 'illustration' | 'image'): string {
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
- For flat vector, minimal, geometric, material design styles: Recommend "ChatGPT with DALL-E 3" (FREE)
- For 3D renders, complex gradients, glassmorphism: Recommend "Midjourney" (PAID but superior)
- For hand-drawn, sketchy, organic styles: Recommend "ChatGPT with DALL-E 3" (FREE)
- For technical diagrams, isometric: Recommend "Microsoft Copilot with DALL-E 3" (FREE)

Always prioritize free tools unless the style specifically requires advanced 3D rendering or complex artistic effects.
Focus on technical precision over flowery descriptions.`;
    } else {
      return basePrompt + `

Create realistic image prompts focused on:
- Authentic photographic quality
- Natural lighting and composition  
- Rich environmental details
- Professional photography techniques
- Cinematic visual storytelling
- High-quality textures and materials

TOOL RECOMMENDATION LOGIC FOR REALISTIC IMAGES:
- For photorealistic, portraits, nature: Recommend "Microsoft Copilot with DALL-E 3" (FREE, excellent for realism)
- For cinematic, dramatic, artistic photography: Recommend "ChatGPT with DALL-E 3" (FREE)
- For anime, cartoon, stylized art: Recommend "ChatGPT with DALL-E 3" (FREE)
- For oil painting, watercolor, traditional art: Recommend "Microsoft Copilot with DALL-E 3" (FREE)
- For highly detailed, complex scenes: Recommend "Midjourney" (PAID but superior quality)

Always prioritize free Microsoft Copilot or ChatGPT unless the request specifically needs ultra-high artistic quality.
Focus on photorealistic execution and technical camera settings.`;
    }
  }

  private buildUserPrompt(request: PromptGenerationRequest): string {
    const { mode, description, styles, aspectRatio, colors } = request;
    
    let prompt = `Generate a professional ${mode} prompt with these specifications:

Description: ${description}
Selected Styles: ${styles.length > 0 ? styles.join(', ') : 'None specified'}
Aspect Ratio: ${aspectRatio}`;

    if (colors && colors.length > 0) {
      prompt += `
Primary Colors: ${colors.join(', ')} (limit palette to these colors)`;
    }

    prompt += `
Mode: ${mode === 'illustration' ? 'Professional Illustration' : 'Realistic Photography'}

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
    
    return prompt;
  }

  private enhancedFallbackGeneration(request: PromptGenerationRequest): PromptGenerationResponse {
    console.log('🔄 USING FALLBACK GENERATION - NOT REAL AI!');
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
    
    // Add aspect ratio specification
    if (aspectRatio !== '1:1') {
      prompt += `, ${aspectRatio} aspect ratio`;
    }
    
    // Add professional mode-specific enhancements
    if (mode === 'illustration') {
      prompt += ', clean composition, minimal design, professional illustration, precise geometry, modern aesthetic';
      if (!colors || colors.length === 0) {
        prompt += ', balanced color scheme';
      }
    } else {
      prompt += ', professional photography, natural lighting, high detail, photorealistic quality';
      if (!colors || colors.length === 0) {
        prompt += ', natural color grading';
      }
    }

    // Intelligent tool recommendations based on style and mode
    const recommendedTool = this.getBestFreeToolForRequest(mode, styles, description);
    const instructions = this.getToolInstructions(recommendedTool, aspectRatio, colors);

    return {
      prompt,
      tool: recommendedTool,
      instructions
    };
  }

  private getBestFreeToolForRequest(mode: 'illustration' | 'image', styles: string[], description: string): string {
    const desc = description.toLowerCase();
    const styleSet = new Set(styles);
    
    if (mode === 'illustration') {
      // For 3D renders, complex gradients, or glassmorphism - Midjourney is superior but paid
      if (styleSet.has('3d-render') || styleSet.has('glassmorphism') || styleSet.has('gradient-mesh') || desc.includes('3d') || desc.includes('complex gradient')) {
        return 'ChatGPT with DALL-E 3'; // Free alternative for most users
      }
      
      // For technical diagrams, isometric - Copilot is excellent
      if (styleSet.has('isometric') || desc.includes('technical') || desc.includes('diagram') || desc.includes('blueprint')) {
        return 'Microsoft Copilot with DALL-E 3';
      }
      
      // Default to ChatGPT for illustrations
      return 'ChatGPT with DALL-E 3';
    } else {
      // For realistic images
      if (styleSet.has('photorealistic') || desc.includes('photo') || desc.includes('realistic') || desc.includes('portrait')) {
        return 'Microsoft Copilot with DALL-E 3';
      }
      
      // For cinematic or dramatic scenes
      if (styleSet.has('cinematic') || desc.includes('cinematic') || desc.includes('dramatic') || desc.includes('movie')) {
        return 'ChatGPT with DALL-E 3';
      }
      
      // For artistic styles
      if (styleSet.has('oil-painting') || styleSet.has('watercolor') || styleSet.has('anime')) {
        return 'ChatGPT with DALL-E 3';
      }
      
      // Default to Copilot for realistic images
      return 'Microsoft Copilot with DALL-E 3';
    }
  }

  private getToolInstructions(tool: string, aspectRatio: string, colors?: string[]): string[] {
    const colorGuidance = colors && colors.length > 0 ? `Include color preferences: ${colors.join(', ')}` : 'Let AI choose appropriate colors';
    
    switch (tool) {
      case 'ChatGPT with DALL-E 3':
        return [
          'Go to ChatGPT (chat.openai.com) - it\'s free with account!',
          'Paste the prompt and ask DALL-E 3 to generate the image',
          `Specify "${aspectRatio} aspect ratio" in your request`,
          colorGuidance,
          'Download the result and refine with follow-up prompts if needed'
        ];
        
      case 'Microsoft Copilot with DALL-E 3':
        return [
          'Go to Microsoft Copilot (copilot.microsoft.com) - it\'s free!',
          'Paste the prompt and request image generation',
          `Ask for "${aspectRatio} aspect ratio" in your message`,
          colorGuidance,
          'Generate multiple variations and choose the best result'
        ];
        
      default:
        return [
          'Copy the prompt to your preferred AI image generator',
          `Set aspect ratio to ${aspectRatio}`,
          colorGuidance,
          'Generate and iterate as needed'
        ];
    }
  }

  async generateText(prompt: string): Promise<string> {
    // If no GitHub token or demo mode, return a basic response
    if (!this.token || this.token === 'demo' || this.token === 'your_github_token_here') {
      return 'AI analysis is not available in demo mode. Please configure your GitHub token to enable image analysis.';
    }

    try {
      console.log('🤖 Sending text generation request to GPT-4.1 Mini...');
      
      // Create the Azure client
      const client = ModelClient(
        this.endpoint,
        new AzureKeyCredential(this.token)
      );

      const response = await client.path("/chat/completions").post({
        body: {
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          model: this.model,
          max_tokens: 1000,
          temperature: 0.7,
        },
      });

      if (isUnexpected(response)) {
        throw new Error(`API call failed: ${response.status}`);
      }

      const responseBody = response.body;
      if (!responseBody?.choices?.[0]?.message?.content) {
        throw new Error('No content in response');
      }

      return responseBody.choices[0].message.content;
    } catch (error) {
      console.error('🔄 GPT-4.1 Mini text generation error:', error);
      throw new Error('Failed to generate text response');
    }
  }
}

export const githubModelService = new GitHubModelService();