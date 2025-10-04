export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface OAuthProvider {
  provider: 'google' | 'apple' | 'facebook';
  redirectUri: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface OAuthCallbackRequest {
  code: string;
  state?: string;
}
