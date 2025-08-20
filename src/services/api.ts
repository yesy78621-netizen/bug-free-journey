import axios from 'axios';
import { localAuthService } from './authService';

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
    return await localAuthService.login({ username, password });
  },

  async getCurrentUser() {
    return localAuthService.getCurrentUser();
  },

  async getUserInfo(username: string) {
    return await localAuthService.getUserInfo(username);
  },

  async getArchive(type: 'mr' | 'badge', date?: string) {
    return await localAuthService.getArchive(type, date);
  },

  logout() {
    localAuthService.logout();
  },

  async register(data: any) {
    return await localAuthService.register(data);
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

  async register(data: any) {
    return await tohAPI.register(data);
  },
  getCurrentUser() {
    return localAuthService.getCurrentUser();
  },

  logout() {
    tohAPI.logout();
  }
};