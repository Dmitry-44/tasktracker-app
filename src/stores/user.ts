import { defineStore } from "pinia";
import type { SimpleObject } from "./interface";
import { envConfig } from "../plugins/envConfig";
import { axiosClient } from "../plugins/axios";

type User = {
  id: number;
  fio: string;
  rights: SimpleObject;
} | null;

interface State {
  is_auth: boolean;
  user: User;
}

export const useUserStore = defineStore({
  id: "user",
  state: (): State => ({
    user: null,
    is_auth: false,
  }),
  getters: {
    getRights: (state): SimpleObject => state?.user?.rights || {},
    getUser: (state): User => state.user,
  },
  actions: {
    logout(): Promise<boolean> {
      return axiosClient
        .get(`${envConfig.API_URL}/auth/logout`)
        .then(() => true);
    },
    checkAuth(): Promise<boolean> {
      return axiosClient
        .post(`${envConfig.API_URL}auth`)
        .then((resp) => {
          console.log('resp', resp)
          this.is_auth = true;
          this.user = resp.data.auth;
          return true;
        })
        .catch((err) => {
          console.log('err')
          this.is_auth = true;
          this.user = null;
          return false;
        });
    },
  },
});
