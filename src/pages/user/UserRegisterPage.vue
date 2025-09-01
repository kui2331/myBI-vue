<template>
  <div class="register-container">
    <div class="register-card animate-fade-in">
      <!-- 注册头部 -->
      <div class="register-header">
        <h2 class="register-title">创建账号</h2>
        <p class="register-subtitle">加入智能BI平台，开启数据分析之旅</p>
      </div>

      <!-- 注册表单 -->
      <a-form
        class="register-form"
        :model="formState"
        name="register"
        label-align="left"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
        autocomplete="off"
        @finish="handleSubmit"
      >
        <!-- 账号输入 -->
        <a-form-item
          label="账号"
          name="userAccount"
          :rules="[
            { required: true, message: '请输入账号' },
            { min: 3, max: 20, message: '账号长度应在3-20个字符之间' }
          ]"
        >
          <a-input
            class="register-input"
            v-model:value="formState.userAccount"
            placeholder="请输入账号"
            prefix-icon="user"
          />
        </a-form-item>

        <!-- 密码输入 -->
        <a-form-item
          label="密码"
          name="userPassword"
          :rules="[
            { required: true, message: '请输入密码' },
            { min: 8, message: '密码不能小于 8 位' },
          ]"
        >
          <a-input-password
            class="register-input"
            v-model:value="formState.userPassword"
            placeholder="请输入密码"
            visibility-toggle
          />
        </a-form-item>

        <!-- 确认密码输入 -->
        <a-form-item
          label="确认密码"
          name="checkPassword"
          :rules="[
            { required: true, message: '请输入确认密码' },
            { min: 8, message: '确认密码不能小于 8 位' },
          ]"
        >
          <a-input-password
            class="register-input"
            v-model:value="formState.checkPassword"
            placeholder="请输入确认密码"
            visibility-toggle
          />
        </a-form-item>

        <!-- 用户协议 -->
        <a-form-item
          class="agreement"
          name="agreement"
          :wrapper-col="{ span: 24 }"
          :rules="[{ required: true, message: '请阅读并同意用户协议和隐私政策' }]"
        >
          <a-checkbox v-model:checked="agreeTerms">
            我已阅读并同意 <a href="#" class="agreement-link">用户协议</a> 和 <a href="#" class="agreement-link">隐私政策</a>
          </a-checkbox>
        </a-form-item>

        <!-- 注册按钮 -->
        <a-form-item :wrapper-col="{ span: 24 }">
          <a-button
            class="register-button"
            type="primary"
            html-type="submit"
            :loading="loading"
            block
          >
            注册账号
          </a-button>
        </a-form-item>
      </a-form>

      <!-- 登录链接 -->
      <div class="login-link">
        已有账号？<a href="/user/login" class="link-btn" @click.prevent="handleLogin">立即登录</a>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { reactive, ref } from "vue";
import { userRegister } from "@/api/user";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";

// 表单状态类型定义
interface FormState {
  userAccount: string;
  userPassword: string;
  checkPassword: string;
}

// 表单数据
const formState = reactive<FormState>({
  userAccount: "",
  userPassword: "",
  checkPassword: "",
});

// 附加状态
const agreeTerms = ref(false);
const loading = ref(false);

// 路由
const router = useRouter();

/**
 * 提交表单
 * @param values 表单数据
 */
const handleSubmit = async (values: FormState) => {
  // 判断两次输入的密码是否一致
  if (formState.userPassword !== formState.checkPassword) {
    message.error("两次输入的密码不一致");
    return;
  }

  // 提交中状态
  loading.value = true;
  try {
    const res = await userRegister(values);
    // 注册成功，跳转到登录页面
    if (res.data.code === 0 && res.data.data) {
      message.success("注册成功");
      // 添加延迟以确保用户看到成功消息
      setTimeout(() => {
        router.push({
          path: "/user/login",
          replace: true,
        });
      }, 1000);
    } else {
      message.error("注册失败，" + (res.data.description || "请稍后重试"));
    }
  } catch (error) {
    message.error("网络异常，请检查网络连接后重试");
    console.error("注册失败:", error);
  } finally {
    loading.value = false;
  }
};

/**
 * 处理登录跳转
 */
const handleLogin = () => {
  router.push({
    path: "/user/login",
    replace: true,
  });
};
</script>

<style scoped>
/* 注册页面容器 */
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-tertiary);
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(0, 150, 255, 0.05) 0%, transparent 25%),
    radial-gradient(circle at 70% 40%, rgba(82, 196, 26, 0.05) 0%, transparent 25%),
    radial-gradient(circle at 30% 70%, rgba(250, 173, 20, 0.05) 0%, transparent 25%);
  padding: 24px;
}

/* 注册卡片 */
.register-card {
  background-color: var(--bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  padding: 40px;
  width: 100%;
  max-width: 500px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.register-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* 注册头部 */
.register-header {
  text-align: center;
  margin-bottom: 32px;
}

.register-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.register-subtitle {
  font-size: 14px;
  color: var(--text-tertiary);
  margin: 0;
}

/* 注册表单 */
.register-form {
  width: 100%;
}

/* 表单标签 */
.ant-form-item-label > label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 14px;
}

/* 输入框样式 */
.register-input {
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
}

.register-input:hover {
  border-color: var(--primary-light);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.register-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

/* 图标样式 */
.register-icon {
  color: var(--text-tertiary);
}

/* 用户协议 */
.agreement {
  margin-bottom: 24px;
}

.agreement-link {
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.3s ease;
}

.agreement-link:hover {
  color: var(--primary-light);
  text-decoration: underline;
}

/* 注册按钮 */
.register-button {
  width: 100%;
  height: 44px;
  border-radius: var(--radius-md);
  font-size: 16px;
  font-weight: 500;
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  transition: all 0.3s ease;
}

.register-button:hover:not(:disabled) {
  background-color: var(--primary-light);
  border-color: var(--primary-light);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.35);
}

.register-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.35);
}

/* 登录链接 */
.login-link {
  text-align: center;
  margin-top: 24px;
  color: var(--text-secondary);
  font-size: 14px;
}

.link-btn {
  color: var(--primary-color);
  font-weight: 500;
  margin-left: 4px;
  transition: color 0.3s ease;
}

.link-btn:hover {
  color: var(--primary-light);
  text-decoration: underline;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .register-card {
    padding: 24px;
  }
  
  .register-title {
    font-size: 24px;
  }
  
  .register-container {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .register-card {
    padding: 20px;
    border-radius: var(--radius-lg);
  }
  
  .register-title {
    font-size: 22px;
  }
  
  .agreement {
    font-size: 12px;
  }
}
</style>
