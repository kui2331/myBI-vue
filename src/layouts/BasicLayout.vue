<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider v-model:collapsed="collapsed" collapsible>
        <div class="user-login-status">
          <div v-if="loginUserStore.loginUser.id">
            <a-button type="primary">已登录：{{ loginUserStore.loginUser.userAccount ?? "无名" }}</a-button>
          </div>
          <div v-else>
            <a-button type="primary" @click="doMenuClick({key: '/user/login'})">请登录</a-button>
          </div>
        </div>
      <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
        <a-sub-menu key="sub1">
          <template #title>
            <span>
              <user-outlined />
              <span>用户管理</span>
            </span>
          </template>
          <a-menu-item key="3">
            <RouterLink to="/user/login">
              登录
            </RouterLink>
          </a-menu-item>
          <a-menu-item key="4">
            <a href="http://localhost:5173/user/login">重新登录</a>
          </a-menu-item>
        </a-sub-menu>
        <a-menu-item key="1" >
          <pie-chart-outlined />
          <span @click="doMenuClick({key: '/chart/add_chart'})">智能分析</span>
        </a-menu-item>
        <a-menu-item key="2">
          <desktop-outlined />
          <span @click="doMenuClick({key: '/chart/my_chart'})">我的图表</span>
        </a-menu-item>

        <a-sub-menu key="sub2">
          <template #title>
            <span>
              <team-outlined />
              <span>Team</span>
            </span>
          </template>
          <a-menu-item key="6">Team 1</a-menu-item>
          <a-menu-item key="8">Team 2</a-menu-item>
        </a-sub-menu>
        <a-menu-item key="9">
          <file-outlined />
          <span>File</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header style="background: #fff; padding: 0">
        <div>
          <h1>智能BI平台</h1>
        </div>
      </a-layout-header>
        <a-layout-content style="margin: 0 16px" class="content">
        <router-view />
      </a-layout-content>
      <a-layout-footer style="text-align: center">
        智能BI平台 Created by kui233
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>
<script lang="ts" setup>
import {
  PieChartOutlined,
  DesktopOutlined,
  UserOutlined,
  TeamOutlined,
  FileOutlined,
} from '@ant-design/icons-vue';
import { ref } from 'vue';
import router from "@/router";
import {useLoginUserStore} from "../store/useLoginUserStore.ts";

const collapsed = ref<boolean>(false);
const selectedKeys = ref<string[]>([]);
const loginUserStore = useLoginUserStore();

// 路由跳转事件
const doMenuClick = ({ key }: { key: string }) => {
  router.push({
    path: key
  });
};

//重新登录
const relogin = () => {
  router.replace({
    path: '/user/login',
  });
};
</script>
<style scoped>
.logo {
  height: 32px;
  margin: 16px;
  background: rgba(255, 255, 255, 0.3);
}

.site-layout .site-layout-background {
  background: #fff;
}
[data-theme='dark'] .site-layout .site-layout-background {
  background: #141414;
}
</style>




