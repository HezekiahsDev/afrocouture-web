import api from "./api";
import type { User, UserRole } from "@/types";

export const AUTH_KEYS = {
  ACCESS_TOKEN: "afrocouture_access_token",
  REFRESH_TOKEN: "afrocouture_refresh_token",
  USER: "afrocouture_user",
};

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(AUTH_KEYS.USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveAuthSession(
  accessToken: string,
  refreshToken: string,
  user: User,
) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_KEYS.ACCESS_TOKEN, accessToken);
  localStorage.setItem(AUTH_KEYS.REFRESH_TOKEN, refreshToken);
  localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(user));
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(AUTH_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(AUTH_KEYS.USER);
}

export async function loginWithEmail(email: string, role?: UserRole) {
  const response = await api.post("/auth/login", { email, role });
  const { accessToken, refreshToken, user } = response.data;
  saveAuthSession(accessToken, refreshToken, user);
  return { accessToken, refreshToken, user };
}

export async function logout() {
  try {
    await api.post("/auth/logout");
  } finally {
    clearAuthSession();
  }
}
