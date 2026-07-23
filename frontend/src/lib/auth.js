import api from "./api";

const TOKEN_KEY = "token";
const AUTH_COOKIE = "pm_token";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `${AUTH_COOKIE}=${token}; path=/; max-age=86400; SameSite=Lax`;
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0`;
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

export function setStoredUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

export function getRole() {
  return getStoredUser()?.role ?? null;
}

export function hasRole(...roles) {
  const role = getRole();
  return role ? roles.includes(role) : false;
}

export async function login(email, password) {
  const { data } = await api.post("/auth/sign-in", { email, password });
  const { user, token } = data.data;

  setToken(token);
  setStoredUser(user);

  return { user, token };
}

export async function getProfile() {
  const { data } = await api.get("/auth/profile");
  const user = data.data;
  setStoredUser(user);
  return user;
}

export function logout() {
  clearAuth();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}
