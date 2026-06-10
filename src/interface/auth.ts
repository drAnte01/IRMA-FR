export type LoginCredentials = {
  username: string;
  password: string;
};

export type LogoutRequest = {
  refreshToken: string;
};

export type AuthUser = {
  id?: number;
  firstName?: string;
  lastName?: string;
  username: string;
  role: string;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresAtUtc?: string;
  refreshTokenExpiresAtUtc?: string;
  user: AuthUser | null;
};

export type LoginApiResponse = {
  accessToken?: string;
  refreshToken?: string;
  username?: string;
  role?: string;
  expiresAtUtc?: string;
  refreshTokenExpiresAtUtc?: string;
  data?: LoginApiResponse;
  message?: string;
};

export type RefreshTokenRequest = {
  refreshToken: string;
};

export type MeApiResponse = {
  id?: number | string;
  userId?: number | string;
  staffId?: number | string;
  firstName?: string;
  lastName?: string;
  username?: string;
  role?: string;
  data?: MeApiResponse;
};