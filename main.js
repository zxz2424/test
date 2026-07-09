// 全局键盘调试 + IME 兼容
// ============================================
// 全局键盘注册（尽早绑定，独立于 Vue 生命周期）
// 多层降级：window 捕获 → document 捕获 → keypress
// ============================================
const WASD_CODES = ['KeyW','KeyA','KeyS','KeyD','KeyI','KeyJ','KeyK','KeyL']
const isWASD = (e) => WASD_CODES.includes(e.code)

// 逐层上报给 window.__keys（响应式兼容）
if (!window.__keys) window.__keys = new Set()

// 层1：window 捕获
window.addEventListener('keydown', (e) => {
  if (isWASD(e)) { e.preventDefault(); window.__keys.add(e.code) }
}, true)
window.addEventListener('keyup', (e) => {
  if (isWASD(e)) { e.preventDefault(); window.__keys.delete(e.code) }
}, true)

// 层2：document 捕获（绕过可能的 window 层拦截）
document.addEventListener('keydown', (e) => {
  if (isWASD(e)) { e.preventDefault(); window.__keys.add(e.code) }
}, true)
document.addEventListener('keyup', (e) => {
  if (isWASD(e)) { e.preventDefault(); window.__keys.delete(e.code) }
}, true)
// 层3：keypress 兜底
document.addEventListener('keypress', (e) => {
  if (isWASD(e)) e.preventDefault()
}, true)

// 调试日志
window.addEventListener('keydown', e => {
  console.log('ROOT', 'key='+e.key, 'code='+e.code,
    'keyCode='+e.keyCode, 'trusted='+e.isTrusted,
    'ts='+e.timeStamp, 'ime='+(e.isComposing||false))
}, true)
import { createApp } from 'vue'
import App from './App.vue'

import { createPinia } from 'pinia'
import router from './router'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 全局样式
import './styles/global.css'
import './styles/ioc.css'

const app = createApp(App)

// UI库
app.use(ElementPlus)

// 状态管理
app.use(createPinia())

// 路由
app.use(router)

app.mount('#app')



