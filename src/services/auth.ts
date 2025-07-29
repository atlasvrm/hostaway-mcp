import axios from 'axios';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthCredentials {
  clientId: string;
  clientSecret: string;
}

interface CachedToken {
  token: string;
  expiry: number;
  clientId: string;
}

export class AuthService {
  private clientId: string;
  private clientSecret: string;
  private cacheDir: string;
  private cacheFile: string;

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.cacheDir = path.join(os.homedir(), '.hostaway-mcp');
    this.cacheFile = path.join(this.cacheDir, 'token-cache.json');
  }

  static createInstance(clientId: string, clientSecret: string): AuthService {
    return new AuthService(clientId, clientSecret);
  }

  private async ensureCacheDir(): Promise<void> {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  private getCacheKey(): string {
    // Create a unique cache key based on client ID
    return crypto.createHash('sha256').update(this.clientId).digest('hex').substring(0, 16);
  }

  private async readCache(): Promise<Record<string, CachedToken>> {
    try {
      const data = await fs.readFile(this.cacheFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return {};
    }
  }

  private async writeCache(cache: Record<string, CachedToken>): Promise<void> {
    await this.ensureCacheDir();
    await fs.writeFile(this.cacheFile, JSON.stringify(cache, null, 2), 'utf-8');
  }

  async getAccessToken(): Promise<string> {
    const cacheKey = this.getCacheKey();
    const cache = await this.readCache();
    const cached = cache[cacheKey];

    // Check if we have a valid cached token
    if (cached && cached.clientId === this.clientId && Date.now() < cached.expiry) {
      return cached.token;
    }

    // Request new token
    const tokenData = await this.requestNewToken();
    
    // Cache the token
    const expiryTime = Date.now() + (tokenData.expires_in * 1000) - 300000; // 5 min buffer
    cache[cacheKey] = {
      token: tokenData.access_token,
      expiry: expiryTime,
      clientId: this.clientId,
    };
    await this.writeCache(cache);

    return tokenData.access_token;
  }

  private async requestNewToken(): Promise<TokenResponse> {
    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', this.clientId);
      params.append('client_secret', this.clientSecret);
      params.append('scope', 'general');

      const response = await axios.post(
        'https://api.hostaway.com/v1/accessTokens',
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cache-control': 'no-cache',
          },
        }
      );

      // Hostaway returns the token directly in the response
      if (response.data.access_token) {
        return {
          access_token: response.data.access_token,
          token_type: response.data.token_type,
          expires_in: response.data.expires_in
        };
      }

      throw new Error(`Failed to get access token: ${response.data.message || 'Unknown error'}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Auth request failed: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  async clearToken(): Promise<void> {
    const cacheKey = this.getCacheKey();
    const cache = await this.readCache();
    delete cache[cacheKey];
    await this.writeCache(cache);
  }
}