<template>
  <a-layout class="bi-layout" style="min-height: 100vh">
    <!-- 侧边栏 -->
    <a-layout-sider
      v-model:collapsed="collapsed"
      collapsible
      class="bi-sidebar"
      trigger=""
      width="250"
      :zero-width-trigger-style="{ top: '64px' }"
    >
      <!-- 侧边栏Logo -->
      <div :class="['sidebar-logo', { collapsed }]">
        <img :src="logoSrc" alt="Logo" class="logo-image" />
        <span v-if="!collapsed" class="logo-text">智能BI平台</span>
      </div>

      <!-- 用户登录状态 -->
      <div class="user-login-status">
        <div v-if="loginUserStore.loginUser.id" class="user-info">
          <a-avatar class="user-avatar">
            {{ getAvatarText(loginUserStore.loginUser.userAccount) }}
          </a-avatar>
          <div v-if="!collapsed" class="user-details">
            <div class="user-name">
              {{ loginUserStore.loginUser.userAccount ?? "无名" }}
            </div>
            <div class="user-status">已登录</div>
          </div>
        </div>
        <div v-else>
          <a-button type="primary" class="login-btn" @click="doMenuClick({key: '/user/login'})">
            <LoginOutlined />
            <span v-if="!collapsed">请登录</span>
          </a-button>
        </div>
      </div>

      <!-- 导航菜单 -->
      <div class="menu-container">
        <a-menu
          v-model:selectedKeys="selectedKeys"
          v-model:openKeys="openKeys"
          theme="dark"
          mode="inline"
          @openChange="onOpenChange"
          @click="doMenuClick"
        >
          <!-- 首页 -->
          <a-menu-item key="/" class="menu-item">
            <HomeOutlined />
            <span @click.stop="doMenuClick({key: '/'})">首页</span>
          </a-menu-item>

          <!-- 用户管理 -->
          <a-sub-menu key="sub-user">
            <template #title>
              <span>
                <UserOutlined />
                <span v-if="!collapsed">用户管理</span>
              </span>
            </template>
            <a-menu-item key="/user/login">
              <UserOutlined />
              <span>登录</span>
            </a-menu-item>
            <a-menu-item key="/user/register">
              <UserAddOutlined />
              <span>注册</span>
            </a-menu-item>
          </a-sub-menu>

          <!-- 图表管理 -->
          <a-sub-menu key="sub-chart">
            <template #title>
              <span>
                <PieChartOutlined />
                <span v-if="!collapsed">图表管理</span>
              </span>
            </template>
            <a-menu-item key="/chart/add_chart">
              <PlusCircleOutlined />
              <span>添加图表</span>
            </a-menu-item>
            <a-menu-item key="/chart/my_chart">
              <DesktopOutlined />
              <span>我的图表</span>
            </a-menu-item>
          </a-sub-menu>

          <!-- 团队管理 -->
          <a-sub-menu key="sub-team">
            <template #title>
              <span>
                <TeamOutlined />
                <span v-if="!collapsed">团队管理</span>
              </span>
            </template>
            <a-menu-item key="team1">Team 1</a-menu-item>
            <a-menu-item key="team2">Team 2</a-menu-item>
          </a-sub-menu>

          <!-- 文件管理 -->
          <a-menu-item key="file">
            <FileOutlined />
            <span v-if="!collapsed">文件管理</span>
          </a-menu-item>
        </a-menu>
      </div>
    </a-layout-sider>

    <!-- 主内容区域 -->
    <a-layout class="bi-main">
      <!-- 顶部导航栏 -->
      <a-layout-header class="bi-header">
        <div class="header-left">
          <!-- 折叠按钮 -->
          <a-button
            type="text"
            icon=""
            class="trigger-btn"
            @click="toggleCollapsed"
          >
            <template v-if="collapsed">
              <MenuUnfoldOutlined />
            </template>
            <template v-else>
              <MenuFoldOutlined />
            </template>
          </a-button>
          <!-- 页面标题 -->
          <h1 class="header-title">{{ getPageTitle() }}</h1>
        </div>

        <div class="header-right">
          <!-- 用户下拉菜单 -->
          <a-dropdown v-if="loginUserStore.loginUser.id">
            <template #overlay>
              <a-menu @click="handleLogout">
                <a-menu-item key="logout">
                  <LogoutOutlined />
                  <span>退出登录</span>
                </a-menu-item>
              </a-menu>
            </template>
            <div class="user-dropdown">
              <a-avatar>
                {{ getAvatarText(loginUserStore.loginUser.userAccount) }}
              </a-avatar>
              <span class="user-name-header">{{ loginUserStore.loginUser.userAccount }}</span>
              <DownOutlined />
            </div>
          </a-dropdown>

          <!-- 未登录状态 -->
          <div v-else>
            <a-button type="primary" @click="doMenuClick({key: '/user/login'})">
              <LoginOutlined />
              登录
            </a-button>
          </div>
        </div>
      </a-layout-header>

      <!-- 内容区域 -->
      <a-layout-content class="bi-content">
        <transition name="fade" mode="out-in">
          <div class="router-view">
            <router-view />
          </div>
        </transition>
      </a-layout-content>

      <!-- 页脚 -->
      <a-layout-footer class="bi-footer">
        <div class="footer-content">
          <p>智能BI平台</p>
          <p class="footer-desc">Created by kui233</p>
        </div>
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
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LoginOutlined,
  UserAddOutlined,
  PlusCircleOutlined,
  HomeOutlined,
  DownOutlined
} from '@ant-design/icons-vue';
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useLoginUserStore } from '../store/useLoginUserStore';
import { onMounted } from 'vue';

// 状态管理
const router = useRouter();
const route = useRoute();
const loginUserStore = useLoginUserStore();

// 响应式数据
const collapsed = ref<boolean>(false);
const selectedKeys = ref<string[]>([]);
const openKeys = ref<string[]>([]);
const logoSrc = ref('/logo.jpeg');

// 计算当前路由
const currentRoute = computed(() => route.path);

// 获取头像文字
const getAvatarText = (text?: string) => {
  if (!text) return '未';
  return text.charAt(0).toUpperCase();
};

// 路由跳转事件
const doMenuClick = (e: any) => {
  // 获取点击项的key
  const key = e.key || e;
  // 只有以/开头的key才进行路由跳转
  if (key.startsWith('/')) {
    router.push({
      path: key
    });
  }
};

// 处理退出登录
const handleLogout = async () => {
  try {
    // 清除用户信息
    loginUserStore.setLoginUser({});
    // 跳转到登录页
    router.replace('/user/login');
  } catch (error) {
    console.error('退出登录失败:', error);
  }
};

// 切换侧边栏展开/折叠
const toggleCollapsed = () => {
  collapsed.value = !collapsed.value;
};

// 处理菜单展开/折叠
const onOpenChange = (keys: string[]) => {
  openKeys.value = keys;
};

// 根据路由获取页面标题
const getPageTitle = () => {
  const titleMap: Record<string, string> = {
    '/': '首页',
    '/user/login': '用户登录',
    '/user/register': '用户注册',
    '/chart/add_chart': '添加图表',
    '/chart/my_chart': '我的图表'
  };
  
  for (const path in titleMap) {
    if (currentRoute.value === path || currentRoute.value.includes(path)) {
      return titleMap[path];
    }
  }
  
  return '智能BI平台';
};

// 组件挂载时初始化
onMounted(() => {
  // 初始选中当前路由
  selectedKeys.value = [currentRoute.value];
  // 临时注释掉用户信息加载，避免后端服务未启动时页面空白
  // loginUserStore.fetchLoginUser().catch(error => {
  //   console.log('用户信息加载失败:', error);
  // });
  
  // 监听路由变化，更新选中状态
  router.afterEach(() => {
    selectedKeys.value = [currentRoute.value];
  });
});
</script>

<style scoped>
/* 基础布局样式 */
.bi-layout {
  overflow: hidden;
}

/* 侧边栏样式 */
.bi-sidebar {
  background: #001529;
  transition: all 0.3s ease;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

/* 侧边栏Logo */
.sidebar-logo {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #1f2f3f;
  transition: all 0.3s ease;
}

.sidebar-logo.collapsed {
  justify-content: center;
  padding: 16px 8px;
}

.logo-image {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
}

.logo-text {
  margin-left: 12px;
  font-size: 18px;
  font-weight: 500;
  color: #fff;
}

/* 用户登录状态 */
.user-login-status {
  padding: 16px;
  text-align: center;
  border-bottom: 1px solid #1f2f3f;
}

.user-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.user-avatar {
  width: 48px;
  height: 48px;
}

.user-details {
  text-align: left;
}

.user-name {
  color: #fff;
  font-weight: 500;
}

.user-status {
  color: #8c8c8c;
  font-size: 12px;
}

.login-btn {
  width: 100%;
}

/* 菜单容器 */
.menu-container {
  padding-top: 16px;
}

.menu-container .ant-menu-item {
  transition: all 0.3s ease;
  border-radius: 6px;
  margin: 4px 12px;
}

.menu-container .ant-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.menu-container .ant-menu-item.active {
  background-color: #1890ff;
}

.menu-container .ant-menu-submenu-title {
  border-radius: 6px;
  margin: 4px 12px;
  transition: all 0.3s ease;
}

.menu-container .ant-menu-submenu-title:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* 主内容区域 */
.bi-main {
  display: flex;
  flex-direction: column;
  background-color: var(--bg-tertiary);
}

/* 顶部导航 */
.bi-header {
  background: var(--bg-primary);
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.trigger-btn {
  font-size: 16px;
  height: 64px;
  display: flex;
  align-items: center;
}

.header-title {
  font-size: 18px;
  font-weight: 500;
  color: var(--text-primary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.user-dropdown:hover {
  background-color: var(--bg-secondary);
}

.user-name-header {
  color: var(--text-primary);
  font-weight: 500;
}

/* 内容区域 */
.bi-content {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

/* 路由视图 */
.router-view {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-xl);
  min-height: calc(100vh - 120px);
}

/* 页脚 */
.bi-footer {
  background: var(--bg-primary);
  border-top: 1px solid var(--border-color);
  padding: 16px 24px;
}

.footer-content {
  text-align: center;
}

.footer-content p {
  margin: 0;
  color: var(--text-tertiary);
}

.footer-desc {
  font-size: 12px;
  margin-top: 4px !important;
}

/* 动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .bi-content {
    padding: 16px;
  }
  
  .router-view {
    padding: 16px;
  }
  
  .header-title {
    font-size: 16px;
  }
  
  .user-name-header {
    display: none;
  }
}

/* 自定义滚动条 */
.bi-content::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.bi-content::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: 3px;
}

.bi-content::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.bi-content::-webkit-scrollbar-thumb:hover {
  background: var(--border-dark);
}


.site-layout .site-layout-background {
  background: #fff;
}
[data-theme='dark'] .site-layout .site-layout-background {
  background: #141414;
}
</style>




