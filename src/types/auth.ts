import type { User } from "./user";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  timezone: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthSession {
  user: User;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}
