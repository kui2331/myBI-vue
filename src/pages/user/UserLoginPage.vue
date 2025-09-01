<template>
  <div class="login-container fade-in">
    <div class="login-card">
      <!-- 登录头部 -->
      <div class="login-header">
        <div class="logo-container">
          <div class="logo-icon">📊</div>
          <div class="logo-text">智能BI</div>
        </div>
        <h1 class="login-title">欢迎登录</h1>
        <p class="login-subtitle">智能数据分析平台，助您洞察数据价值</p>
      </div>
      
      <!-- 登录表单 -->
      <a-form
        :model="formState"
        name="normal_login"
        class="login-form"
        @finish="handleSubmit"
        layout="vertical"
      >
        <!-- 账号输入框 -->
        <a-form-item
          label="账号名"
          name="userAccount"
          :rules="[
            { required: true, message: '请输入账号！' },
            { min: 4, message: '账号至少需要4个字符' }
          ]"
          has-feedback
        >
          <a-input 
            ref="accountInputRef"
            v-model:value="formState.userAccount"
            placeholder="请输入您的账号"
            class="login-input"
            size="large"
            autocomplete="username"
            @keydown.enter="focusPassword"
          >
            <template #prefix>
              <UserOutlined class="login-icon" />
            </template>
          </a-input>
        </a-form-item>

        <!-- 密码输入框 -->
        <a-form-item
          label="密码"
          name="userPassword"
          :rules="[
            { required: true, message: '请输入密码！' },
            { min: 8, message: '密码至少需要8个字符' },
            { 
              validator: validatePassword, 
              trigger: 'blur'
            }
          ]"
          has-feedback
        >
          <a-input-password 
            ref="passwordInputRef"
            v-model:value="formState.userPassword"
            placeholder="请输入您的密码"
            class="login-input"
            size="large"
            visibilityToggle
            autocomplete="current-password"
            @visibility-change="handlePasswordVisibilityChange"
            @keydown.enter="handleSubmit"
          >
            <template #prefix>
              <LockOutlined class="login-icon" />
            </template>
          </a-input-password>
          
          <!-- 密码强度指示器 -->
          <div v-if="showPasswordStrength && formState.userPassword" class="password-strength-container">
            <div class="strength-meter">
              <div 
                class="strength-bar"
                :class="{
                  'weak': passwordStrength === 'weak',
                  'medium': passwordStrength === 'medium',
                  'strong': passwordStrength === 'strong'
                }"
                :style="{ width: passwordStrengthWidth }"
              ></div>
            </div>
            <span class="strength-text">{{ getStrengthText() }}</span>
          </div>
        </a-form-item>
        
        <!-- 记住我和忘记密码 -->
        <a-form-item class="remember-me">
          <a-checkbox v-model:checked="rememberMe" size="large" class="remember-checkbox">
            记住我 30天
          </a-checkbox>
          <a @click="handleForgotPassword" class="forgot-password" href="javascript:;">
            忘记密码？
          </a>
        </a-form-item>
        
        <!-- 错误提示 -->
        <div v-if="loginError" class="error-message">
          <a-alert 
            :message="loginError" 
            type="error" 
            showIcon 
            closable 
            @close="clearLoginError"
            banner
          />
        </div>
        
        <!-- 登录按钮 -->
        <a-form-item>
          <a-button 
            :disabled="disabled"
            type="primary" 
            html-type="submit" 
            class="login-button"
            size="large"
            :loading="isLoading"
          >
            <template v-if="isLoading">
              <LoadingOutlined />
              登录中...
            </template>
            <template v-else>
              登录
            </template>
          </a-button>
        </a-form-item>
        
        <!-- 注册链接 -->
        <div class="register-link">
          还没有账号？
          <a @click="navigateToRegister" class="link-btn">立即注册</a>
        </div>
      </a-form>
    </div>
    
    <!-- 页脚 -->
    <div class="login-footer">
      <p class="copyright">© 2023 智能BI分析平台 版权所有</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, onMounted, nextTick } from 'vue';
import { 
  UserOutlined, 
  LockOutlined, 
  LoadingOutlined 
} from '@ant-design/icons-vue';
import { userLogin } from '../../api/user';
import { useLoginUserStore } from '../../store/useLoginUserStore';
import { useRouter } from 'vue-router';
import { message, FormInstance } from 'ant-design-vue';

// 表单实例引用
const formRef = ref<FormInstance>();
// 输入框引用
const accountInputRef = ref();
const passwordInputRef = ref();

// 表单数据
const formState = reactive({
  userAccount: '',
  userPassword: '',
});

// 状态管理
const rememberMe = ref(false);
const isLoading = ref(false);
const loginError = ref('');
const showPasswordStrength = ref(false);
const passwordStrength = ref<'weak' | 'medium' | 'strong'>('weak');
const passwordStrengthWidth = ref('0%');

// 路由和用户状态
const router = useRouter();
const loginUserStore = useLoginUserStore();

// 计算登录按钮是否禁用
const disabled = computed(() => {
  return !(formState.userAccount && formState.userPassword && !isLoading.value);
});

// 密码验证器
const validatePassword = (_: any, value: string) => {
  if (!value) {
    return Promise.resolve();
  }
  
  // 密码强度检查逻辑
  const hasNumber = /\d/.test(value);
  const hasLetter = /[a-zA-Z]/.test(value);
  const hasSpecial = /[^\dA-Za-z]/.test(value);
  
  // 更新密码强度
  updatePasswordStrength(hasNumber, hasLetter, hasSpecial, value.length);
  
  return Promise.resolve();
};

// 更新密码强度
const updatePasswordStrength = (hasNumber: boolean, hasLetter: boolean, hasSpecial: boolean, length: number) => {
  // 计算密码强度分数
  let score = 0;
  if (length >= 8) score += 1;
  if (hasNumber) score += 1;
  if (hasLetter) score += 1;
  if (hasSpecial) score += 1;
  
  // 更新密码强度状态
  if (score <= 1) {
    passwordStrength.value = 'weak';
    passwordStrengthWidth.value = '33%';
  } else if (score <= 2) {
    passwordStrength.value = 'medium';
    passwordStrengthWidth.value = '66%';
  } else {
    passwordStrength.value = 'strong';
    passwordStrengthWidth.value = '100%';
  }
};

// 获取密码强度文本
const getStrengthText = () => {
  const strengthMap = {
    weak: '弱',
    medium: '中',
    strong: '强'
  };
  return `密码强度：${strengthMap[passwordStrength.value]}`;
};

// 处理密码可见性变化
const handlePasswordVisibilityChange = (visible: boolean) => {
  if (visible && formState.userPassword) {
    showPasswordStrength.value = true;
  }
};

// 聚焦到密码输入框
const focusPassword = () => {
  nextTick(() => {
    passwordInputRef.value?.focus();
  });
};

// 清除登录错误
const clearLoginError = () => {
  loginError.value = '';
};

// 处理忘记密码
const handleForgotPassword = () => {
  message.info('忘记密码功能开发中');
};

// 跳转到注册页面
const navigateToRegister = () => {
  router.push('/user/register');
};

// 从本地存储加载用户信息
const loadUserInfoFromStorage = () => {
  try {
    const savedUser = localStorage.getItem('rememberedUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      formState.userAccount = userData.userAccount || '';
      rememberMe.value = true;
      
      // 预填充账号后自动聚焦到密码输入框
      nextTick(() => {
        passwordInputRef.value?.focus();
      });
    }
  } catch (error) {
    console.error('加载用户信息失败:', error);
  }
};

// 保存用户信息到本地存储
const saveUserInfoToStorage = () => {
  try {
    if (rememberMe.value) {
      const userData = {
        userAccount: formState.userAccount,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem('rememberedUser', JSON.stringify(userData));
    } else {
      localStorage.removeItem('rememberedUser');
    }
  } catch (error) {
    console.error('保存用户信息失败:', error);
  }
};

// 清除过期的用户信息
const clearExpiredUserInfo = () => {
  try {
    const savedUser = localStorage.getItem('rememberedUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      const savedDate = new Date(userData.savedAt);
      const now = new Date();
      const daysPassed = (now.getTime() - savedDate.getTime()) / (1000 * 60 * 60 * 24);
      
      // 超过30天清除
      if (daysPassed > 30) {
        localStorage.removeItem('rememberedUser');
      }
    }
  } catch (error) {
    console.error('清除过期用户信息失败:', error);
  }
};

// 提交表单
const handleSubmit = async () => {
  try {
    // 清除之前的错误信息
    clearLoginError();
    
    // 表单验证
    await formRef.value?.validateFields();
    
    // 显示加载状态
    isLoading.value = true;
    
    // 提交登录请求
    const res = await userLogin(formState);
    
    // 登录成功，跳转到主页
    if (res.data.code === 0 && res.data.data) {
      // 保存用户信息
      saveUserInfoToStorage();
      
      // 更新用户状态
      await loginUserStore.fetchLoginUser();
      
      // 显示成功消息
      message.success('登录成功，正在跳转...');
      
      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        router.push({
          path: '/',
          replace: true,
        });
      }, 800);
    } else {
      // 显示错误消息
      loginError.value = res.data.description || '登录失败，请检查账号密码是否正确';
      
      // 清空密码
      formState.userPassword = '';
      
      // 聚焦到账号输入框
      nextTick(() => {
        accountInputRef.value?.focus();
      });
    }
  } catch (error: any) {
    // 处理表单验证错误
    if (error.errorFields && error.errorFields.length > 0) {
      const firstError = error.errorFields[0];
      loginError.value = firstError.errors[0] || '请检查表单输入';
    } else {
      // 处理网络或其他错误
      loginError.value = error.message || '登录失败，请稍后重试';
      console.error('登录错误:', error);
    }
  } finally {
    // 隐藏加载状态
    isLoading.value = false;
  }
};

// 组件挂载时的逻辑
onMounted(() => {
  // 清除过期的用户信息
  clearExpiredUserInfo();
  
  // 加载保存的用户信息
  loadUserInfoFromStorage();
  
  // 自动聚焦到账号输入框（如果没有预填充）
  if (!formState.userAccount) {
    nextTick(() => {
      accountInputRef.value?.focus();
    });
  }
});
</script>

<style scoped>
/* 登录页面容器 */
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-tertiary);
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(0, 150, 255, 0.05) 0%, transparent 20%),
    radial-gradient(circle at 80% 60%, rgba(82, 196, 26, 0.05) 0%, transparent 20%),
    radial-gradient(circle at 40% 80%, rgba(250, 173, 20, 0.05) 0%, transparent 20%);
  padding: 24px;
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.login-container::before {
  content: '';
  position: absolute;
  top: -10%;
  left: -10%;
  width: 120%;
  height: 120%;
  background: 
    radial-gradient(circle at 10% 20%, rgba(0, 150, 255, 0.03) 0%, transparent 20%),
    radial-gradient(circle at 80% 60%, rgba(82, 196, 26, 0.03) 0%, transparent 20%),
    radial-gradient(circle at 40% 80%, rgba(250, 173, 20, 0.03) 0%, transparent 20%);
  z-index: 0;
  animation: backgroundMove 20s ease-in-out infinite alternate;
}

@keyframes backgroundMove {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(10px, 10px);
  }
}

/* 登录卡片 */
.login-card {
  background-color: var(--bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  padding: 40px;
  width: 100%;
  max-width: 450px;
  transition: 
    transform 0.3s ease,
    box-shadow 0.3s ease,
    border-color 0.3s ease;
  position: relative;
  z-index: 1;
  border: 1px solid var(--border-light);
}

.login-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  border-color: var(--primary-light);
}

/* 登录头部 */
.login-header {
  text-align: center;
  margin-bottom: 32px;
}

/* Logo 区域 */
.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  gap: 8px;
}

.logo-icon {
  font-size: 28px;
  animation: logoBounce 2s ease-in-out infinite;
}

@keyframes logoBounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-color);
}

.login-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-subtitle {
  font-size: 14px;
  color: var(--text-tertiary);
  margin: 0;
}

/* 登录表单 */
.login-form {
  width: 100%;
}

/* 表单标签 */
.ant-form-item-label > label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 14px;
}

/* 输入框样式 */
.login-input {
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
  height: 44px;
}

.login-input:hover {
  border-color: var(--primary-light);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

.login-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  transform: translateY(-1px);
}

/* 图标样式 */
.login-icon {
  color: var(--text-tertiary);
  font-size: 16px;
}

/* 记住我和忘记密码 */
.remember-me {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.remember-checkbox {
  font-size: 14px;
  color: var(--text-secondary);
}

.forgot-password {
  color: var(--primary-color);
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 14px;
}

.forgot-password:hover {
  color: var(--primary-light);
  text-decoration: underline;
  transform: translateY(-1px);
}

/* 错误提示 */
.error-message {
  margin-bottom: 16px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 密码强度指示器 */
.password-strength-container {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.strength-meter {
  flex: 1;
  height: 4px;
  background-color: var(--border-light);
  border-radius: 2px;
  overflow: hidden;
}

.strength-bar {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.strength-bar.weak {
  background-color: var(--error-color);
}

.strength-bar.medium {
  background-color: var(--warning-color);
}

.strength-bar.strong {
  background-color: var(--success-color);
}

.strength-text {
  font-size: 12px;
  color: var(--text-tertiary);
  min-width: 60px;
}

/* 登录按钮 */
.login-button {
  width: 100%;
  height: 44px;
  border-radius: var(--radius-md);
  font-size: 16px;
  font-weight: 500;
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.login-button:hover:not(:disabled) {
  background-color: var(--primary-light);
  border-color: var(--primary-light);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(24, 144, 255, 0.4);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 3px 8px rgba(24, 144, 255, 0.3);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 登录按钮加载动画 */
.login-button .anticon-loading {
  margin-right: 8px;
}

/* 注册链接 */
.register-link {
  text-align: center;
  margin-top: 24px;
  color: var(--text-secondary);
  font-size: 14px;
}

.link-btn {
  color: var(--primary-color);
  font-weight: 500;
  margin-left: 4px;
  transition: all 0.3s ease;
  display: inline-block;
}

.link-btn:hover {
  color: var(--primary-light);
  text-decoration: underline;
  transform: translateY(-1px);
}

/* 页脚 */
.login-footer {
  margin-top: 24px;
  text-align: center;
  z-index: 1;
  position: relative;
}

.copyright {
  font-size: 12px;
  color: var(--text-tertiary);
  margin: 0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .login-card {
    padding: 32px 24px;
  }
  
  .login-title {
    font-size: 24px;
  }
  
  .login-container {
    padding: 16px;
  }
  
  .logo-icon {
    font-size: 24px;
  }
  
  .logo-text {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 24px 20px;
    border-radius: var(--radius-lg);
    margin: 16px;
  }
  
  .login-title {
    font-size: 22px;
  }
  
  .login-subtitle {
    font-size: 12px;
  }
  
  .login-input {
    height: 40px;
  }
  
  .login-button {
    height: 40px;
    font-size: 14px;
  }
  
  .remember-me {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .password-strength-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .strength-text {
    min-width: auto;
  }
}

@media (max-height: 600px) {
  .login-container {
    padding: 16px;
    min-height: auto;
    height: 100vh;
  }
  
  .login-footer {
    margin-top: 16px;
  }
}
</style>
