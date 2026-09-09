import { apiRequest } from "./client";

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export const authApi = {
  register: (email: string, password: string, full_name: string = "") =>
    apiRequest<TokenResponse>("/auth/register", {
      method: "POST",
      body: { email, password, full_name },
      auth: false,
    }),

  login: (email: string, password: string) =>
    apiRequest<TokenResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    }),
};
