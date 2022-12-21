import axios from "axios";
import {getBearerToken} from '@/plugins/Cookies'

const bearerToken = getBearerToken()
axios.defaults.headers.common['Authorization'] = 'Bearer '+bearerToken;
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';

export const axiosClient = axios;