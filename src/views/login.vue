<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { ElMessage, FormInstance } from 'element-plus'
import { decrypt, encrypt } from '../utils/jsencrypt'
import { useCookies } from '@vueuse/integrations/useCookies'
import { encryptPasswordToMD5 } from '../hook/encrypt'
import { login } from '../api/auth'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../store/modules/user'
import { DURATION_TIME } from '../settings'
import { getMenuList } from '../api/menu'
import { MenuEntity } from '../types/entity'
import { cloneDeep } from 'lodash'

interface Login {
  username: string
  password: string
  remember_me: boolean
}

const cookie = useCookies()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const params: { loading: boolean; redirect: string } = reactive({
  loading: false,
  redirect: ''
})
const ruleFormRef = ref<FormInstance>()
const loginForm: Login = reactive({
  username: '',
  password: '',
  remember_me: false
})
const handleLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async (valid) => {
    if (valid) {
      params.loading = true
      if (loginForm.remember_me) {
        const expires: Date = new Date(new Date().getTime() + 60 * 60 * 1000)
        cookie.remove('username')
        cookie.remove('password')
        cookie.remove('remember_me')
        cookie.set('username', loginForm.username, { expires })
        cookie.set('password', encrypt(loginForm.password), { expires })
        cookie.set('remember_me', loginForm.remember_me, { expires })
      } else {
        cookie.remove('username')
        cookie.remove('password')
        cookie.remove('remember_me')
      }
      login({
        username: loginForm.username,
        password: encryptPasswordToMD5(loginForm.password),
        rememberMe: loginForm.remember_me
      })
        .then(async ({ data, status }) => {
          if (data.code === 200 && status === 200) {
            userStore.setUserInfo(data)
            await router.push(params.redirect || '/')
            ElMessage.success({ message: '登陆成功', duration: DURATION_TIME })
          } else {
            ElMessage.warning({
              message: data.message || '登陆失败，请重试！',
              duration: DURATION_TIME
            })
          }
        })
        .catch(({ response }) =>
          ElMessage.error({
            message: response.data.message,
            duration: DURATION_TIME
          })
        )
        .finally(() => (params.loading = false))
    }
  })
}
const getCookie = async () => {
  loginForm.username = cookie.get('username')
  loginForm.password = cookie.get('password')
    ? decrypt(cookie.get('password'))
    : ''
  loginForm.remember_me = Boolean(cookie.get('remember_me'))
}
watch(
  () => route,
  () => (params.redirect = route.query && (route.query.redirect as string)),
  { deep: true, immediate: true }
)
onMounted(() => getCookie())
</script>

<template>
  <div class="login-content">
    <div class="login-box">
      <div class="login-box-left"></div>
      <div class="login-box-right">
        <div class="title-box">
          <div class="line" />
          <div class="title">欢迎回来</div>
          <div class="line" />
        </div>
        <el-form ref="ruleFormRef" :model="loginForm">
          <el-form-item
            prop="username"
            :rules="{
              required: true,
              message: '账号不能为空',
              trigger: 'blur'
            }"
          >
            <el-input
              v-model="loginForm.username"
              placeholder="账号"
              prefix-icon="user"
            />
          </el-form-item>
          <el-form-item
            prop="password"
            :rules="{
              required: true,
              message: '密码不能为空',
              trigger: 'blur'
            }"
          >
            <el-input
              v-model="loginForm.password"
              placeholder="密码"
              prefix-icon="lock"
              show-password
            />
          </el-form-item>
          <el-form-item>
            <el-checkbox v-model="loginForm.remember_me" label="记住密码" />
          </el-form-item>
          <el-form-item>
            <el-button
              v-loading="params.loading"
              type="primary"
              @click="handleLogin(ruleFormRef)"
              @keyup.enter="handleLogin(ruleFormRef)"
            >
              <span v-if="!params.loading">登 录</span>
              <span v-else>登 陆 中 ...</span>
            </el-button>
          </el-form-item>
        </el-form>
        <div class="other"></div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-content {
  width: 100vw;
  height: 100vh;
  background-color: darksalmon;

  .login-box {
    position: relative;
    width: 1200px;
    height: 600px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #7a8b9a;
    display: flex;
    border-radius: 2rem;

    &-left {
      width: 70%;
      height: 100%;
      background-color: aquamarine;
      border-radius: 2rem 0 0 2rem;
    }

    &-right {
      width: 30%;
      height: 100%;
      background-color: white;
      border-radius: 0 2rem 2rem 0;
      display: flex;
      flex-direction: column;

      .title-box {
        height: 50px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 100px 0 80px 0;

        .line {
          width: 20%;
          height: 1px;
          background-color: #7a8b9a;
          display: flex;
        }

        .title {
          font-size: 28px;
          font-weight: bold;
          margin: 0 5px 0 5px;
          display: flex;
        }
      }
    }
  }
}

:deep(.el-input) {
  width: 250px;
}

:deep(.el-checkbox) {
  width: 250px;
  margin-left: 5px;
}

:deep(.el-form) {
  display: flex;
  flex-direction: column;
  align-items: center;
}

:deep(.el-button) {
  width: 250px;
}
</style>
