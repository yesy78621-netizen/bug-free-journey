import axios from 'axios';

const API_BASE_URL = 'https://api.toh.com/api/v1'; // Gerçek API URL'ini buraya koy
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1395886160248574084/FMhfMB2C1cZvlNYlfbeczZpg5FRtxgvA10gjxYtuhpuStIpr9EhDcQVxbNMhlayTqsSK';

// API Client with token management
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('toh_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// TÖH API Service
export const tohAPI = {
  async login(username: string, password: string) {
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const response = await axios.post(`${API_BASE_URL}/auth/login`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success === 1) {
        localStorage.setItem('toh_token', response.data.token);
        return response.data;
      } else {
        throw new Error('Giriş başarısız');
      }
    } catch (error: any) {
      console.error('Login Error:', error);
      throw new Error(error.response?.data?.message || 'Giriş yapılamadı');
    }
  },

  async getCurrentUser() {
    try {
      const response = await apiClient.get('/users/me');
      return response.data;
    } catch (error: any) {
      console.error('Get Current User Error:', error);
      throw new Error('Kullanıcı bilgileri alınamadı');
    }
  },

  async getUserInfo(username: string) {
    try {
      const response = await apiClient.get(`/users/${username}`);
      return response.data;
    } catch (error: any) {
      console.error('Get User Info Error:', error);
      throw new Error('Kullanıcı bulunamadı');
    }
  },

  async getArchive(type: 'mr' | 'badge', date?: string) {
    try {
      const params = new URLSearchParams({ type });
      if (date) params.append('date', date);
      
      const response = await apiClient.post(`/archive/?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Archive Error:', error);
      throw new Error('Arşiv verisi alınamadı');
    }
  },

  logout() {
    localStorage.removeItem('toh_token');
  }
};

// Habbo API Service (kept for additional features)
export const habboAPI = {
  async getUserProfile(username: string) {
    try {
      const response = await axios.get(`https://www.habbo.com.tr/api/public/users?name=${username}`);
      return response.data;
    } catch (error) {
      console.error('Habbo API Error:', error);
      throw new Error('Kullanıcı bulunamadı');
    }
  }
};

// Discord Webhook Service
export const discordAPI = {
  async sendLog(data: {
    title: string;
    description: string;
    color?: number;
    fields?: Array<{ name: string; value: string; inline?: boolean }>;
    username?: string;
    avatar?: string;
  }) {
    try {
      const embed = {
        title: data.title,
        description: data.description,
        color: data.color || 0xc8102e,
        timestamp: new Date().toISOString(),
        footer: {
          text: 'TÖH Yönetim Sistemi',
          icon_url: 'https://images.habbo.com/c_images/album1584/TUR44.gif'
        },
        fields: data.fields || []
      };

      if (data.username) {
        embed.fields?.push({
          name: 'Kullanıcı',
          value: data.username,
          inline: true
        });
      }

      await axios.post(DISCORD_WEBHOOK_URL, {
        embeds: [embed],
        username: 'TÖH Bot',
        avatar_url: 'https://images.habbo.com/c_images/album1584/TUR44.gif'
      });
    } catch (error) {
      console.error('Discord Webhook Error:', error);
    }
  }
};

// Legacy auth API (will be replaced with tohAPI)
export const authAPI = {
  async login(username: string, password: string) {
    return await tohAPI.login(username, password);
  },

  getCurrentUser() {
    const token = localStorage.getItem('toh_token');
    return token ? { token } : null;
  },

  logout() {
    tohAPI.logout();
  }
};