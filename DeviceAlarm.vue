<template>
  <div class="device-alarm-page">
    <div class="card">
      <div class="card-header">
        <span class="title">⚠️ 设备告警中心</span>
        <span class="tip">历史记录 / 异常追踪 / 裂缝检测联动</span>
      </div>
      <DeviceAlarm />
    </div>
  </div>
</template>

<script setup>
import DeviceAlarm from '@/components/device/DeviceAlarm.vue'
</script>

<style scoped>
.device-alarm-page {
  height: 100%;
  padding: 24px;
  background: #f5f7fa;
}
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  height: 100%;
}
.card-header {
  padding: 16px 20px;
  background: linear-gradient(to right, #e8f1ff, #f5f9ff);
  border-bottom: 1px solid #edf2f9;
}
.title {
  font-size: 16px;
  font-weight: 600;
  color: #1d7bff;
}
</style>