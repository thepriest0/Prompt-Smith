// Server-side AI prompt generation API service
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

class AIPromptService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  }

  async generatePrompt(request: PromptGenerationRequest): Promise<PromptGenerationResponse> {
    console.log('🎯 AI Prompt Service - calling server endpoint');
    console.log('📡 Request to:', `${this.baseUrl}/api/ai-prompts/generate`);
    console.log('📝 Request data:', request);

    try {
      const response = await fetch(`${this.baseUrl}/api/ai-prompts/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      console.log('📡 Server response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Server error response:', errorData);
        throw new Error(`Server error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const result = await response.json();
      console.log('✅ Server response received:', result);
      
      return result;
    } catch (error) {
      console.error('❌ AI Prompt Service error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const aiPromptService = new AIPromptService();
export default aiPromptService;