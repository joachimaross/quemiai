export type Platform = 'instagram' | 'tiktok' | 'facebook' | 'x';

export interface PlatformConnection {
  id: string;
  userId: string;
  platform: Platform;
  platformUserId: string;
  platformUsername?: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlatformConfig {
  platform: Platform;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}
