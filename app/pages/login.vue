<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'

definePageMeta({
  layout: 'default',
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/',
  },
})

const { signIn } = useAuth()
const router = useRouter()

const formRef = ref<FormInstance>()
const loading = ref(false)
const form = reactive({
  email: '',
  password: '',
})

const rules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
  ],
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await signIn({ email: form.email, password: form.password }, { redirect: false })
    router.push('/')
  }
  catch (error: any) {
    ElMessage.error(error?.data?.message || '登录失败')
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <el-card class="auth-card">
      <template #header>
        <h2>登录</h2>
      </template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="0" @submit.prevent="handleSubmit">
        <el-form-item prop="email">
          <el-input v-model="form.email" placeholder="邮箱" size="large" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" size="large" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" :loading="loading" style="width: 100%" @click="handleSubmit">
            登录
          </el-button>
        </el-form-item>
      </el-form>
      <div class="auth-links">
        <NuxtLink to="/forgot-password">忘记密码？</NuxtLink>
        <NuxtLink to="/register">注册账号</NuxtLink>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.auth-card {
  width: 400px;
}

h2 {
  margin: 0;
  text-align: center;
}

.auth-links {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.auth-links a {
  color: #409eff;
  text-decoration: none;
}

.auth-links a:hover {
  text-decoration: underline;
}
</style>
