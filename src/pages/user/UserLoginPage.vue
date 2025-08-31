<template>
  <a-form
      :model="formState"
      name="normal_login"
      class="login-form"
      @finish="handleSubmit"
  >
    <h2 class="title">用户登录</h2>
    <a-form-item
        label="账号名"
        name="userAccount"
        :rules="[{ required: true, message: '请输入账号！' }]"
    >
      <a-input v-model:value="formState.userAccount">
        <template #prefix>
          <UserOutlined class="site-form-item-icon" />
        </template>
      </a-input>
    </a-form-item>

    <a-form-item
        label="密码"
        name="userPassword"
        :rules="[
            { required: true, message: '请输入密码！' },
            { min: 8, message: '密码至少要五位！' }
            ]"
    >
      <a-input-password v-model:value="formState.userPassword">
        <template #prefix>
          <LockOutlined class="site-form-item-icon" />
        </template>
      </a-input-password>
    </a-form-item>
    <a-form-item>
      <a-button :disabled="disabled" type="primary" html-type="submit" class="login-form-button">
        登录
      </a-button>
      或
      <a @click="doMenuClick({key: '/user/register'})">注册</a>
    </a-form-item>
  </a-form>
</template>
<script lang="ts" setup>
import {computed, reactive} from 'vue';
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue';
import {userLogin} from "../../api/user.ts";
import {useLoginUserStore} from "../../store/useLoginUserStore.ts";
import {useRouter} from "vue-router";
import {message} from "ant-design-vue";


const formState = reactive({
  userAccount: '',
  userPassword: '',
});

const disabled = computed(() => {
  return !(formState.userAccount && formState.userPassword);
});

const router = useRouter();
const loginUserStore = useLoginUserStore();
//提交表单
const handleSubmit = async () => {
  const res = await userLogin(formState);
  // 登录成功，跳转到主页
  if (res.data.code === 0 && res.data.data) {
    await loginUserStore.fetchLoginUser();
    message.success("登录成功");
    router.push({
      path: "/",
      replace: true,
    });
  } else {
    message.error("登录失败");
  }
};

// 路由跳转事件
const doMenuClick = ({ key }: { key: string }) => {
  router.push({
    path: key
  });
};
</script>
<style scoped>
#components-form-demo-normal-login .login-form {
  max-width: 300px;
}
#components-form-demo-normal-login .login-form-forgot {
  float: right;
}
#components-form-demo-normal-login .login-form-button {
  width: 100%;
}
</style>
