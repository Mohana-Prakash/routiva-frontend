import { httpClient } from "./client";
import type { AuthSession, ForgotPasswordInput, LoginInput, RegisterInput, ResetPasswordInput } from "@/types/auth";
import type { User } from "@/types/user";

export const authApi = {
  register: (input: RegisterInput) => httpClient.post<AuthSession>("/auth/register", input).then((r) => r.data),

  login: (input: LoginInput) => httpClient.post<AuthSession>("/auth/login", input).then((r) => r.data),

  logout: () => httpClient.post<void>("/auth/logout").then((r) => r.data),

  logoutAll: () => httpClient.post<void>("/auth/logout-all").then((r) => r.data),

  forgotPassword: (input: ForgotPasswordInput) => httpClient.post<void>("/auth/forgot-password", input).then((r) => r.data),

  resetPassword: (input: ResetPasswordInput) => httpClient.post<void>("/auth/reset-password", input).then((r) => r.data),

  me: () => httpClient.get<User>("/auth/me").then((r) => r.data),
};
