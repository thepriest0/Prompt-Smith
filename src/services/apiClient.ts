// API client for making requests to our backend
const API_BASE_URL = import.meta.env.MODE === 'production' 
  ? '' // Same domain in production
  : 'http://localhost:3000'; // Backend dev server

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}/api${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for session
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData: { email: string; password: string; name: string }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // User endpoints
  async getUser(id: string) {
    return this.request(`/users/${id}`);
  }

  async updateUser(id: string, userData: { name?: string; email?: string }) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Prompt endpoints
  async getUserPrompts(userId: string) {
    return this.request(`/prompts/user/${userId}`);
  }

  async createPrompt(promptData: {
    userId: string;
    title: string;
    description?: string;
    generatedPrompt: string;
    mode?: 'illustration' | 'image';
    style?: string;
    mood?: string;
    aspectRatio?: string;
    tool?: string;
    isPublic?: boolean;
  }) {
    return this.request('/prompts', {
      method: 'POST',
      body: JSON.stringify(promptData),
    });
  }

  async updatePrompt(id: string, promptData: Partial<{
    title: string;
    description: string;
    isPublic: boolean;
  }>) {
    return this.request(`/prompts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(promptData),
    });
  }

  async deletePrompt(id: string) {
    return this.request(`/prompts/${id}`, {
      method: 'DELETE',
    });
  }

  async getPublicPrompts(limit = 20) {
    return this.request(`/prompts/public?limit=${limit}`);
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiClient = new ApiClient();
export default apiClient;