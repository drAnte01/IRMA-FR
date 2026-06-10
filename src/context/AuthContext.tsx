import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { loginRequest, logoutRequest, meRequest, refreshTokenRequest } from "../api/auth";
import { setAccessToken, setRefreshAccessTokenHandler } from "../api/API";
import type { AuthSession, AuthUser, LoginCredentials } from "../interface/auth";

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  accessToken: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
};

const STORAGE_KEY = "irma.auth.session";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawSession = window.localStorage.getItem(STORAGE_KEY);
  if (!rawSession) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawSession) as AuthSession;
    if (typeof parsed.accessToken !== "string" || !parsed.accessToken.trim()) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function isFutureIsoDate(value?: string): boolean {
  if (!value) {
    return true;
  }

  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return true;
  }

  return timestamp > Date.now();
}

function isSessionValid(session: AuthSession | null): boolean {
  if (!session) {
    return false;
  }

  if (!isFutureIsoDate(session.expiresAtUtc)) {
    return false;
  }

  if (!isFutureIsoDate(session.refreshTokenExpiresAtUtc)) {
    return false;
  }

  return true;
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => {
    const stored = readStoredSession();
    return isSessionValid(stored) ? stored : null;
  });
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const refreshRequestRef = useRef<Promise<string | null> | null>(null);

  useEffect(() => {
    setAccessToken(session?.accessToken ?? null);

    if (typeof window === "undefined") {
      return;
    }

    if (session) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
  }, [session]);

  const login = async (credentials: LoginCredentials) => {
    const nextSession = await loginRequest(credentials);

    // Ensure `/me` immediately uses the fresh token, without waiting for effect flush.
    setAccessToken(nextSession.accessToken);
    setSession(nextSession);

    try {
      const profile = await meRequest();

      setSession((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          user: profile,
        };
      });
    } catch {
      setSession((prev) => prev ?? nextSession);
    }
  };

  const refreshAccessToken = useMemo(
    () => async (): Promise<string | null> => {
      if (!session?.refreshToken || !isFutureIsoDate(session.refreshTokenExpiresAtUtc)) {
        setSession(null);
        return null;
      }

      if (refreshRequestRef.current) {
        return refreshRequestRef.current;
      }

      const refreshPromise = (async () => {
        try {
          const refreshed = await refreshTokenRequest({
            refreshToken: session.refreshToken,
          });

          // Apply refreshed token before calling `/me` in the same async flow.
          setAccessToken(refreshed.accessToken);
          setSession((prev) => ({
            ...refreshed,
            user: refreshed.user ?? prev?.user ?? null,
          }));
          return refreshed.accessToken;
        } catch {
          setSession(null);
          return null;
        } finally {
          refreshRequestRef.current = null;
        }
      })();

      refreshRequestRef.current = refreshPromise;
      return refreshPromise;
    },
    [session]
  );

  useEffect(() => {
    setRefreshAccessTokenHandler(refreshAccessToken);

    return () => {
      setRefreshAccessTokenHandler(null);
    };
  }, [refreshAccessToken]);

  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = async () => {
      if (!session || !isSessionValid(session)) {
        if (isMounted) {
          setSession(null);
          setIsBootstrapping(false);
        }
        return;
      }

      try {
        const user = await meRequest();

        if (!isMounted) {
          return;
        }

        setSession((prev) => {
          if (!prev) {
            return prev;
          }

          return {
            ...prev,
            user,
          };
        });
      } catch {
        if (!isMounted) {
          return;
        }

        if (!session.refreshToken || !isFutureIsoDate(session.refreshTokenExpiresAtUtc)) {
          setSession(null);
          setIsBootstrapping(false);
          return;
        }

        try {
          const refreshed = await refreshTokenRequest({
            refreshToken: session.refreshToken,
          });

          if (!isMounted) {
            return;
          }

          // Apply refreshed token before calling `/me` in the same async flow.
          setAccessToken(refreshed.accessToken);
          setSession((prev) => ({
            ...refreshed,
            user: refreshed.user ?? prev?.user ?? null,
          }));

          try {
            const user = await meRequest();

            if (!isMounted) {
              return;
            }

            setSession((prev) => {
              if (!prev) {
                return prev;
              }

              return {
                ...prev,
                user,
              };
            });
          } catch {
            if (isMounted) {
              setSession((prev) => {
                if (!prev) {
                  return prev;
                }

                return {
                  ...prev,
                  user: prev.user,
                };
              });
            }
          }
        } catch {
          if (isMounted) {
            setSession(null);
          }
        }
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    };

    void bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const logout = async () => {
    const currentRefreshToken = session?.refreshToken;
    if (currentRefreshToken) {
      await logoutRequest({ refreshToken: currentRefreshToken });
    }

    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(session?.accessToken) && isSessionValid(session),
        isLoading: isBootstrapping,
        user: session?.user ?? null,
        accessToken: session?.accessToken ?? null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}

export { AuthProvider, useAuth };