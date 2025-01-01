import axios from "axios";
const TOKEN_NAME = "nol_token";
import { jwtDecode } from "jwt-decode";

const ApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_HOST,
  responseType: "json",
});

ApiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status || 500;
    if (status === 401 && window.location.pathname != "/login") {
      deleteToken();
      window.location.href =
        window.location.protocol + "//" + window.location.host + "/login";
    } else {
      return Promise.reject(error); // Delegate error to calling side
    }
  }
);

ApiClient.interceptors.request.use((request) => {
  request.headers.Authorization = `Bearer ${getToken()}`;
  return request;
});

ApiClient.defaults.headers.common["Content-Type"] =
  "application/json;charset=utf-8";
export default ApiClient;

export function deleteToken() {
  localStorage.removeItem(TOKEN_NAME);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_NAME, token);
}

export function getToken(): string {
  return localStorage.getItem(TOKEN_NAME) ?? "";
}

export function isUserLoggedIn(): boolean {
  return getToken() != "";
}

export type TokenData = {
  id: number;
  exp: number;
  user_name: string;
};

export function getTokenData(): TokenData | null {
  const token = getToken();
  if (token === "") {
    return null;
  } else {
    return jwtDecode<TokenData>(token);
  }
}
