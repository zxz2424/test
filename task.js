import request from '@/utils/Request.js'

// 任务接口（真实后端）
export async function getTaskList() {
  return request.get('/api/task')
}

export async function getTaskHistory() {
  return request.get('/api/task/history')
}

export async function createTask(data) {
  return request.post('/api/task', data)
}

export async function controlTask(data) {
  return request.post('/api/task/control', data)
}

export async function deleteTask(id) {
  // 注意：这里通常遵循 RESTful 规范使用 delete 方法
  // 如果你的后端接口地址不同（例如 /api/task/delete），请相应修改
  return request.delete(`/api/task/${id}`)
}