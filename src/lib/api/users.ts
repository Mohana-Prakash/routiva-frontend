import { httpClient } from "./client";
import type { User } from "@/types/user";

export interface UpdateProfileInput {
  name?: string;
  timezone?: string;
}

export const usersApi = {
  me: () => httpClient.get<User>("/users/me").then((r) => r.data),
  updateMe: (input: UpdateProfileInput) => httpClient.patch<User>("/users/me", input).then((r) => r.data),
};
