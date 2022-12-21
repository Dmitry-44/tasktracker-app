import {createRouter, createWebHistory} from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
       {
        path: '/',
        name: "Главная",
        component: DefaultLayout,
        children: [
          {
            path: "/",
            name: "Доска",
            component: () => import("../pages/Kanban/Index.vue"),
          },
          {
            path: "/login",
            name: "login",
            component: () => import("../pages/Login/Index.vue"),
          },
        ]
       } 
    ]
})

export default router