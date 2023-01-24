import { axiosClient } from './../plugins/axios';
import { defineStore } from "pinia";
import type { SimpleObject } from "./interface";
import { envConfig } from "../plugins/envConfig";
import { getBearerToken, clearBearerToken } from '@/plugins/Cookies';

export interface User  {
  id: number;
  username: string;
  name: string;
  email: string,
}

export interface LoginUserDto  {
	username: string,
  password: string,
}

export interface RegisterUserDto  {
	username: string,
  password: string,
  email: string,
  name: string,
}

interface State {
  is_auth: boolean;
  user: User | null;
}

export const useUserStore = defineStore({
  id: "user",
  state: (): State => ({
    user: null,
    is_auth: false,
  }),
  getters: {
    getUser: (state): User|null => state.user,
    getIsAuth: (state): boolean => state.is_auth
  },
  actions: {
    async checkAuth(): Promise<boolean> {
      const newToken = getBearerToken()
      console.log('newToken', newToken)
      axiosClient.defaults.headers.common['Authorization'] = 'Bearer '+newToken;
      return axiosClient
        .post(`${envConfig.API_URL}/auth`)
        .then((resp) => {
          if(resp.status === 200) {
            this.is_auth = true;
            this.user = resp.data.user;
            return true;
          } else if(resp.status === 401) {
            this.is_auth = false;
            this.user = null;
            return false
          }
          return false
        })
        .catch((err) => {
          console.log('server error')
          this.is_auth = false;
          this.user = null;
          return false;
        });
    },
    async Logup(user: LoginUserDto): Promise<boolean> {
      return axiosClient
        .post(`${envConfig.API_URL}/logup`, user)
        .then((resp) => {
          this.is_auth = true;
          this.user = resp.data.user;
          const newToken = getBearerToken()
          axiosClient.defaults.headers.common['Authorization'] = 'Bearer '+newToken;
          return true;
        })
        .catch((err) => {
          this.is_auth = false;
          this.user = null;
          return false;
        });
    },
    async Login(user: LoginUserDto): Promise<boolean> {
      return axiosClient
        .post(`${envConfig.API_URL}/login`, user)
        .then((resp) => {
          this.is_auth = true;
          this.user = resp.data.user;
          const newToken = getBearerToken()
          axiosClient.defaults.headers.common['Authorization'] = 'Bearer '+newToken;
          return true;
        })
        .catch((err) => {
          this.is_auth = false;
          this.user = null;
          return false;
        });
    },
    Logout():void {
      clearBearerToken()
      this.is_auth = false;
      this.user = null;
      const newToken = getBearerToken()
      axiosClient.defaults.headers.common['Authorization'] = 'Bearer '+newToken;
    },
  },
});
