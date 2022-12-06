import axios from "axios";
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Authorization'] = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMyIsImV4cCI6MTY3MDMyMjgwOSwiaWF0IjoxNjcwMjM2NDA5fQ.dproTgvMLh26I_pmTdRPqDOYPdPVfELtyKBk8BRZzas';
axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
export const axiosClient = axios;