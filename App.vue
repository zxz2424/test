<template>
 <!-- 登录 -->
  <router-view v-if="$route.path === '/login'" />

  <!-- 注册 -->
  <router-view v-else-if="$route.path === '/register'" />

  <!-- IOC -->
  <router-view v-else-if="$route.path.startsWith('/ioc')" />

  <!-- 业务页面 -->
  <router-view v-else />

</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref(localStorage.getItem('username') || 'admin')

// 🔥 暗黑模式
const isDark = ref(false)

onMounted(() => {
  if (localStorage.getItem('dark') === '1') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
})

// 切换模式
const toggleDark = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('dark', '1')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('dark', '0')
  }
}

// 退出登录
const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  router.push('/login')
}
</script>

<style scoped>
/* 左侧 */
.aside {
  background: #2c3e50;
}

/* 顶栏 */
.header {
  background: url('/header-bg.png') no-repeat center;
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 2px solid #0f3b5f;
  position: relative;
  overflow: hidden;
}

/* ⭐ 遮罩层 */
.header::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}

/* ⭐ 标题层 */
.title {
  position: relative;
  z-index: 2;
  font-size: 32px;
  font-weight: bold;
  color: #fff;
  text-shadow:
    0 0 10px rgba(0,150,255,0.8),
    0 0 20px rgba(0,150,255,0.6);
}
.sub {
  font-size: 14px;
  margin-top: 4px;
  opacity: 0.8;
}

/* 用户信息栏 */
.user-info {
  padding: 20px 10px;
  text-align: center;
  color: #fff;
  border-bottom: 1px solid #445466;
}
.username {
  font-size: 15px;
  margin-bottom: 6px;
}
.logout-btn {
  font-size: 12px;
  color: #ff6b6b;
  cursor: pointer;
}
.logout-btn:hover {
  text-decoration: underline;
}

/* 文字头像 */
.avatar-text {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #409eff;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
}

/* 🔥 主题切换按钮 */
.theme-switch {
  position: absolute;
  top: 20px;
  right: 24px;
  z-index: 99;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}
.theme-switch:hover {
  background: rgba(255,255,255,0.35);
}
.icon {
  width: 20px;
  height: 20px;
  color: #fff;
}

/* 🔥 主内容区明暗样式 */
.main-light {
  background: #f5f7fa;
}
.main-dark {
  background: #1a1a1a;
}

/* 浅色（默认） */
:root {
  --bg-page: #f5f7fa;
  --bg-card: #ffffff;
  --bg-table-header: #fafbfc;
  --bg-progress: #e5e7eb;
  --text-primary: #1f2937;
  --text-secondary: #909399;
}

/* 暗黑模式（自动切换） */
.dark {
  --bg-page: #141414;
  --bg-card: #1e1e1e;
  --bg-table-header: #2a2a2a;
  --bg-progress: #333;
  --text-primary: #ffffff;
  --text-secondary: #999999;
}
</style>