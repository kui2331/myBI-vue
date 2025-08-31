import {createRouter, createWebHistory, type RouteRecordRaw} from 'vue-router'

import HomeView from '../pages/HomePage.vue'
import UserLoginPage from "../pages/user/UserLoginPage.vue";
import UserRegisterPage from "../pages/user/UserRegisterPage.vue";
import AddChart from "../pages/chart/AddChart.vue";
import MyChart from "../pages/chart/MyChart.vue";

const routes: Array<RouteRecordRaw> = [
    {
        path: "/",
        name: "home",
        component: HomeView,
    },
    {
        path: "/user/login",
        name: "userLogin",
        component: UserLoginPage,
    },
    {
        path: "/user/register",
        name: "userRegister",
        component: UserRegisterPage,
    },
    {
        path: "/chart/add_chart",
        name: "AddChart",
        component: AddChart,
    },
    {
        path: "/chart/my_chart",
        name: "MyChart",
        component: MyChart,
    }
];


const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router