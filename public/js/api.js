class APIClient {
  constructor() {
    this.baseURL = '';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}/api${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...auth.getAuthHeaders(),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async saveGameSession(gameData) {
    return this.request('/game/session', {
      method: 'POST',
      body: JSON.stringify(gameData)
    });
  }

  async getGameHistory(gameType, page = 1, limit = 10) {
    const endpoint = gameType 
      ? `/game/history/${gameType}?page=${page}&limit=${limit}`
      : `/game/history?page=${page}&limit=${limit}`;
    
    return this.request(endpoint);
  }

  async getLeaderboard(gameType, limit = 10) {
    return this.request(`/leaderboard/${gameType}?limit=${limit}`);
  }

  async getUserProfile() {
    return this.request('/user/profile');
  }
}

// Initialize API client
const api = new APIClient();