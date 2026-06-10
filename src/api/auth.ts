import axios from "axios";
import { apiClient } from "./API";
import { AuthAPI_URL } from "../help/enpoints";
import type {
  AuthSession,
  AuthUser,
  LoginApiResponse,
  LoginCredentials,
  LogoutRequest,
  MeApiResponse,
  RefreshTokenRequest,
} from "../interface/auth";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function pickString(source: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return undefined;
}

function pickNumber(source: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return undefined;
}

function pickUser(source: Record<string, unknown>): AuthUser | undefined {
  const id = pickNumber(source, ["id", "userId", "staffId"]);
  const firstName = pickString(source, ["firstName", "first_name", "Fname"]);
  const lastName = pickString(source, ["lastName", "last_name", "Lname"]);
  const username = pickString(source, ["username"]);
  const role = pickString(source, ["role"]);

  if (!username || !role) {
    return undefined;
  }

  return {
    id,
    firstName,
    lastName,
    username,
    role,
  };
}

function normalizeMeResponse(payload: MeApiResponse): AuthUser {
  const root = isRecord(payload) ? payload : {};
  const nested = isRecord(root.data) ? root.data : {};

  const user = pickUser(root) ?? pickUser(nested);

  if (!user) {
    throw new Error("Profile response does not include username and role.");
  }

  return user;
}

function normalizeAuthResponse(payload: LoginApiResponse): AuthSession {
  const root = isRecord(payload) ? payload : {};
  const nested = isRecord(root.data) ? root.data : {};

  const accessToken =
    pickString(root, ["accessToken"]) ?? pickString(nested, ["accessToken"]);

  if (!accessToken) {
    throw new Error("Login response does not include an access token.");
  }

  const refreshToken = pickString(root, ["refreshToken"]) ?? pickString(nested, ["refreshToken"]);

  if (!refreshToken) {
    throw new Error("Login response does not include a refresh token.");
  }

  const expiresAtUtc = pickString(root, ["expiresAtUtc"]) ?? pickString(nested, ["expiresAtUtc"]);

  const refreshTokenExpiresAtUtc =
    pickString(root, ["refreshTokenExpiresAtUtc"]) ??
    pickString(nested, ["refreshTokenExpiresAtUtc"]);

  const user = pickUser(root) ?? pickUser(nested) ?? null;

  return {
    accessToken,
    refreshToken,
    expiresAtUtc,
    refreshTokenExpiresAtUtc,
    user,
  };
}

function getBackendErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data;

    if (isRecord(message) && typeof message.message === "string" && message.message.trim()) {
      return message.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Login failed. Please try again.";
}

async function loginRequest(credentials: LoginCredentials): Promise<AuthSession> {
  try {
    const response = await apiClient.post<LoginApiResponse>(`${AuthAPI_URL}/login`, credentials);
    return normalizeAuthResponse(response.data);
  } catch (error) {
    throw new Error(getBackendErrorMessage(error));
  }
}

async function refreshTokenRequest(payload: RefreshTokenRequest): Promise<AuthSession> {
  try {
    const response = await apiClient.post<LoginApiResponse>(`${AuthAPI_URL}/refresh`, payload);
    return normalizeAuthResponse(response.data);
  } catch (error) {
    throw new Error(getBackendErrorMessage(error));
  }
}

async function meRequest(): Promise<AuthUser> {
  try {
    const response = await apiClient.get<MeApiResponse>(`${AuthAPI_URL}/me`);
    return normalizeMeResponse(response.data);
  } catch (error) {
    throw new Error(getBackendErrorMessage(error));
  }
}

async function logoutRequest(payload: LogoutRequest): Promise<void> {
  try {
    await apiClient.post(`${AuthAPI_URL}/logout`, payload);
  } catch {
    // Local logout should still proceed if backend invalidation fails.
  }
}

export { loginRequest, refreshTokenRequest, meRequest, logoutRequest };