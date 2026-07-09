import request from '@/utils/Request.js'

// ==============================
// 1. 设备管理接口 (Device)
// ==============================
export async function getDeviceList() {
  return request.get('/api/device')
}

export async function addDevice(data) {
  return request.post('/api/device', data)
}

export async function updateDevice(data) {
  return request.put('/api/device', data)
}

export async function deleteDevice(id) {
  return request.delete(`/api/device/${id}`)
}

// ==============================
// 2. 告警管理接口 (Alarm)
// ==============================

// 获取所有告警（包含实时生成的和 JSON 里的历史记录）
export async function fetchAlarmList() {
  return request.get('/api/alarm')
}

// 标记告警为已解决（会同步更新 JSON 文件）
export async function resolveAlarm(id) {
  return request.post(`/api/alarm/resolve/${id}`)
}

// 导出告警（目前后端未实现流下载，仅保留占位）
export async function exportAlarmList() { 
  return { success: true } 
}

// ==============================
// 3. 任务管理接口 (Task) —— 新增
// ==============================

// 获取当前正在进行的任务 (pending, running, paused)
export async function getTaskList() {
  return request.get('/api/task')
}

// 获取历史任务记录 (completed, failed, terminated)
export async function getTaskHistory() {
  return request.get('/api/task/history')
}

// 创建新任务
export async function createTask(data) {
  return request.post('/api/task', data)
}

// 控制任务状态（启动/暂停/停止）
// data 格式: { id: 11, action: 'start' }
export async function controlTask(data) {
  return request.post('/api/task/control', data)
}

// ==============================
// 4. 其他辅助接口
// ==============================

// 如果需要控制设备行为，可以在此处扩展
export async function controlDevice(data) { 
  return request.post('/api/device/control', data) 
}

// 清理函数（如果需要清空本地/临时状态）
export function resetDevices() {}