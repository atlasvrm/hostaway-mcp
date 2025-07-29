import axios, { AxiosInstance } from 'axios';
import { AuthService } from './auth.js';
import type { 
  Listing, 
  ListingsQueryParams, 
  HostawayResponse 
} from '../types/hostaway.js';

export class HostawayApiService {
  private api: AxiosInstance;
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
    this.api = axios.create({
      baseURL: 'https://api.hostaway.com/v1',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth interceptor
    this.api.interceptors.request.use(async (config) => {
      const token = await this.authService.getAccessToken();
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    // Add response interceptor for token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await this.authService.clearToken();
          const token = await this.authService.getAccessToken();
          error.config.headers.Authorization = `Bearer ${token}`;
          return this.api.request(error.config);
        }
        return Promise.reject(error);
      }
    );
  }

  async getListings(params?: ListingsQueryParams): Promise<Listing[]> {
    const response = await this.api.get<HostawayResponse<Listing[]>>('/listings', { params });
    return response.data.result;
  }

  async getListing(listingId: number): Promise<Listing> {
    const response = await this.api.get<HostawayResponse<Listing>>(`/listings/${listingId}`);
    return response.data.result;
  }

  async getPricingSettings(listingId: number): Promise<any> {
    const response = await this.api.get<HostawayResponse<any>>(`/listing/pricingSettings/${listingId}`);
    return response.data.result;
  }

  async getBedTypes(): Promise<any[]> {
    const response = await this.api.get<HostawayResponse<any[]>>('/bedTypes');
    return response.data.result;
  }
}