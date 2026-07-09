<template>
<div class="analysis-page">
  <!-- ========== 页头 ========== -->
  <div class="page-header">
    <h1 class="page-title">模型评估与数据分析报告</h1>
    <p class="page-subtitle">YOLOv8 路面裂缝检测 · 训练总结 &amp; 性能评估</p>
  </div>

  <!-- ========== 指标卡片 ========== -->
  <div class="metric-grid">
    <div class="metric-card" v-for="m in metrics" :key="m.label">
      <div class="metric-value" :style="{ color: m.color }">{{ m.value }}</div>
      <div class="metric-label">{{ m.label }}</div>
      <div class="metric-desc">{{ m.desc }}</div>
    </div>
  </div>

  <!-- ========== 训练曲线 (ECharts) ========== -->
  <div class="section">
    <h2 class="section-title">训练过程曲线</h2>
    <div class="chart-row">
      <div class="chart-box"><div ref="lossChart" class="chart"></div></div>
      <div class="chart-box"><div ref="metricChart" class="chart"></div></div>
    </div>
  </div>

  <!-- ========== YOLO 结果总览 ========== -->
  <div class="section">
    <h2 class="section-title">YOLO 训练结果总览</h2>
    <div class="img-card">
      <img src="/analysis/results.png" alt="Training Results" />
    </div>
  </div>

  <!-- ========== 裂缝检测验证 ========== -->
  <div class="section">
    <h2 class="section-title">裂缝检测验证（标签 vs 预测）</h2>
    <p class="section-desc">三组验证批次对比：左侧为标注标签（Ground Truth），右侧为模型预测结果（Prediction）</p>
    <div class="batch-tabs">
      <button v-for="(b, i) in crackBatches" :key="i"
        class="tab-btn" :class="{ active: activeBatch === i }"
        @click="activeBatch = i">{{ b.name }}</button>
    </div>
    <div class="compare-row">
      <div class="compare-item">
        <div class="compare-label">标注标签 (Ground Truth)</div>
        <img :src="crackBatches[activeBatch].label" />
      </div>
      <div class="compare-item">
        <div class="compare-label">模型预测 (Prediction)</div>
        <img :src="crackBatches[activeBatch].pred" />
      </div>
    </div>
  </div>

  <!-- ========== 混淆矩阵 ========== -->
  <div class="section">
    <h2 class="section-title">混淆矩阵分析</h2>
    <div class="matrix-row">
      <div class="matrix-item">
        <div class="matrix-label">原始混淆矩阵</div>
        <img src="/analysis/confusion_matrix.png" />
      </div>
      <div class="matrix-item">
        <div class="matrix-label">归一化混淆矩阵</div>
        <img src="/analysis/confusion_matrix_normalized.png" />
      </div>
    </div>
  </div>

  <!-- ========== 性能曲线 ========== -->
  <div class="section">
    <h2 class="section-title">性能评估曲线</h2>
    <div class="curve-grid">
      <div class="curve-item"><img src="/analysis/BoxPR_curve.png" /><span>PR 曲线</span></div>
      <div class="curve-item"><img src="/analysis/BoxF1_curve.png" /><span>F1 曲线</span></div>
      <div class="curve-item"><img src="/analysis/BoxP_curve.png" /><span>精确率曲线</span></div>
      <div class="curve-item"><img src="/analysis/BoxR_curve.png" /><span>召回率曲线</span></div>
    </div>
  </div>

  <!-- ========== 车道检测 ========== -->
  <div class="section">
    <h2 class="section-title">车道线检测</h2>
    <div class="img-card">
      <img src="/analysis/lane/labels.jpg" />
    </div>
  </div>

  <!-- ========== 训练数据样本 ========== -->
  <div class="section">
    <h2 class="section-title">训练数据样本展示</h2>
    <div class="sample-grid">
      <img v-for="s in samples" :key="s" :src="s" />
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'

// ==========================================
// 指标数据（从 CSV 末行提取）
// ==========================================
const metrics = ref([
  { label: 'Precision (精确率)', value: '87.9%', color: '#00d9ff', desc: '预测为正例中实际为正例的比例' },
  { label: 'Recall (召回率)', value: '79.7%', color: '#52c41a', desc: '实际为正例中被正确召回的比例' },
  { label: 'mAP@50', value: '83.7%', color: '#ffd93d', desc: 'IoU=0.5 时的平均精度' },
  { label: 'mAP@50:95', value: '53.7%', color: '#ff6b6b', desc: 'IoU=0.5~0.95 的平均精度' },
])

// ==========================================
// 裂缝验证批次数据
// ==========================================
const crackBatches = [
  { name: '批次 0', label: '/analysis/crack/val_batch0_labels.jpg', pred: '/analysis/crack/val_batch0_pred.jpg' },
  { name: '批次 1', label: '/analysis/crack/val_batch1_labels.jpg', pred: '/analysis/crack/val_batch1_pred.jpg' },
  { name: '批次 2', label: '/analysis/crack/val_batch2_labels.jpg', pred: '/analysis/crack/val_batch2_pred.jpg' },
]
const activeBatch = ref(0)

// ==========================================
// 训练数据样本
// ==========================================
const samples = [
  '/analysis/video/train_batch0.jpg',
  '/analysis/video/train_batch1.jpg',
  '/analysis/video/train_batch2.jpg',
  '/analysis/video/train_batch8160.jpg',
  '/analysis/video/train_batch8161.jpg',
  '/analysis/video/train_batch8162.jpg',
]

// ==========================================
// ECharts 引用
// ==========================================
const lossChart = ref(null)
const metricChart = ref(null)

// ==========================================
// 解析 CSV
// ==========================================
const parseCSV = async () => {
  try {
    const res = await fetch('/analysis/results.csv')
    const text = await res.text()
    const lines = text.trim().split('\n')
    const heads = lines[0].split(',').map(h => h.trim())
    const rows = lines.slice(1).map(l =>
      l.split(',').map((v, i) =>
        i === 0 ? parseInt(v) : parseFloat(v)
      )
    )
    return { heads, rows }
  } catch {
    return null
  }
}

// ==========================================
// 绘制训练曲线
// ==========================================
const plotCharts = async () => {
  const csv = await parseCSV()
  if (!csv || !csv.rows.length) return
  const { heads, rows } = csv

  const epochs = rows.map(r => r[0])
  const trainBoxLoss = rows.map(r => r[2])
  const trainClsLoss = rows.map(r => r[3])
  const trainDflLoss = rows.map(r => r[4])
  const valBoxLoss = rows.map(r => r[9])
  const valClsLoss = rows.map(r => r[10])
  const valDflLoss = rows.map(r => r[11])
  const precision = rows.map(r => r[5])
  const recall = rows.map(r => r[6])
  const mAP50 = rows.map(r => r[7])
  const mAP50_95 = rows.map(r => r[8])

  await nextTick()

  // 损失曲线
  if (lossChart.value) {
    const c = echarts.init(lossChart.value)
    c.setOption({
      title: { text: '训练损失曲线', textStyle: { color: '#333333', fontSize: 14 } },
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,.8)', borderColor: '#00d9ff' },
      legend: { textStyle: { color: '#ccc' }, data: ['box_loss(训练)', 'cls_loss(训练)', 'dfl_loss(训练)', 'box_loss(验证)'] },
      xAxis: { type: 'category', data: epochs, axisLabel: { color: '#999' }, name: 'Epoch',nameLocation: 'end', nameGap: 35,  nameTextStyle: { color: '#999' } },
      yAxis: { type: 'value', axisLabel: { color: '#999' }, name: 'Loss', nameTextStyle: { color: '#999' } },
      grid: { left: '12%', right: '5%', top: '18%', bottom: '18%' },
      series: [
        { name: 'box_loss(训练)', type: 'line', smooth: true, symbol: 'none', data: trainBoxLoss, lineStyle: { color: '#00d9ff', width: 1.5 } },
        { name: 'cls_loss(训练)', type: 'line', smooth: true, symbol: 'none', data: trainClsLoss, lineStyle: { color: '#52c41a', width: 1.5 } },
        { name: 'dfl_loss(训练)', type: 'line', smooth: true, symbol: 'none', data: trainDflLoss, lineStyle: { color: '#ffd93d', width: 1.5 } },
        { name: 'box_loss(验证)', type: 'line', smooth: true, symbol: 'none', data: valBoxLoss, lineStyle: { color: '#ff6b6b', width: 1.5, type: 'dashed' } },
      ]
    })
    window.addEventListener('resize', () => c.resize())
  }

  // 性能曲线
  if (metricChart.value) {
    const c = echarts.init(metricChart.value)
    c.setOption({
      title: { text: '性能指标曲线', textStyle: { color: '#333333', fontSize: 14 } },
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,.8)', borderColor: '#00d9ff' },
      legend: { textStyle: { color: '#ccc' }, data: ['Precision', 'Recall', 'mAP@50', 'mAP@50:95'] },
      xAxis: { type: 'category', data: epochs, axisLabel: { color: '#999' }, name: 'Epoch', nameLocation: 'end  ', nameGap: 35,  nameTextStyle: { color: '#999' } },
      yAxis: { type: 'value', axisLabel: { color: '#999' }, name: 'Score', nameTextStyle: { color: '#999' }, min: 0, max: 1 },
      grid: { left: '12%', right: '5%', top: '18%', bottom: '18%' },
      series: [
        { name: 'Precision', type: 'line', smooth: true, symbol: 'none', data: precision, lineStyle: { color: '#00d9ff', width: 1.5 } },
        { name: 'Recall', type: 'line', smooth: true, symbol: 'none', data: recall, lineStyle: { color: '#52c41a', width: 1.5 } },
        { name: 'mAP@50', type: 'line', smooth: true, symbol: 'none', data: mAP50, lineStyle: { color: '#ffd93d', width: 1.5 } },
        { name: 'mAP@50:95', type: 'line', smooth: true, symbol: 'none', data: mAP50_95, lineStyle: { color: '#ff6b6b', width: 1.5 } },
      ]
    })
    window.addEventListener('resize', () => c.resize())
  }
}

onMounted(() => plotCharts())
</script>

<style scoped>
.analysis-page {
  min-height: 100vh;
  background: #f5f7fa;
  color: #333;
  padding: 30px 40px 60px;
  font-family: "Microsoft Yahei", sans-serif;
}

/* ---- 页头 ---- */
.page-header { margin-bottom: 32px; }
.page-title { font-size: 28px; font-weight: 700; color: #00d9ff; margin: 0 0 6px; }
.page-subtitle { font-size: 14px; color: #909399; margin: 0; }

/* ---- 指标卡片 ---- */
.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}
.metric-card {
  background: #fff;
  border: 1px solid #e8ecf1;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,.04);
}
.metric-value { font-size: 36px; font-weight: 700; font-variant-numeric: tabular-nums; }
.metric-label { font-size: 14px; font-weight: 600; color: #333; margin: 6px 0 4px; }
.metric-desc { font-size: 12px; color: #909399; }

/* ---- 章节 ---- */
.section { margin-bottom: 36px; }
.section-title { font-size: 20px; font-weight: 600; color: #00d9ff; margin: 0 0 4px; }
.section-desc { font-size: 13px; color: #909399; margin: 0 0 14px; }

/* ---- 图表 ---- */
.chart-row { display: flex; gap: 16px; }
.chart-box {
  flex: 1;
  background: #fff;
  border: 1px solid #e8ecf1;
  border-radius: 10px;
  padding: 12px;
}
.chart { width: 100%; height: 340px; }

/* ---- 图片容器 ---- */
.img-card {
  background: #fff;
  border: 1px solid #e8ecf1;
  border-radius: 10px;
  padding: 12px;
}
.img-card img { width: 100%; display: block; border-radius: 6px; }

/* ---- 裂缝对比 ---- */
.batch-tabs { display: flex; gap: 8px; margin-bottom: 14px; }
.tab-btn {
  padding: 6px 18px;
  border-radius: 8px;
  background: #f0f2f5;
  border: 1px solid #dcdfe6;
  color: #606266;
  cursor: pointer;
  font-size: 13px;
  transition: .2s;
}
.tab-btn.active { background: #e6f7ff; border-color: #00d9ff; color: #0099cc; }

.compare-row { display: flex; gap: 16px; }
.compare-item {
  flex: 1;
  background: #fff;
  border: 1px solid #e8ecf1;
  border-radius: 10px;
  overflow: hidden;
}
.compare-label {
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  border-bottom: 1px solid #e8ecf1;
  background: #fafbfc;
}
.compare-item img { width: 100%; display: block; }

/* ---- 混淆矩阵 ---- */
.matrix-row { display: flex; gap: 16px; }
.matrix-item {
  flex: 1;
  background: #fff;
  border: 1px solid #e8ecf1;
  border-radius: 10px;
  overflow: hidden;
}
.matrix-label {
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  border-bottom: 1px solid #e8ecf1;
  background: #fafbfc;
}
.matrix-item img { width: 100%; display: block; }

/* ---- 曲线网格 ---- */
.curve-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.curve-item {
  background: #fff;
  border: 1px solid #e8ecf1;
  border-radius: 10px;
  overflow: hidden;
}
.curve-item img { width: 100%; display: block; }
.curve-item span {
  display: block;
  padding: 6px 12px;
  font-size: 12px;
  color: #909399;
  border-top: 1px solid #e8ecf1;
}

/* ---- 训练样本 ---- */
.sample-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.sample-grid img {
  width: 100%;
  display: block;
  border-radius: 8px;
  border: 1px solid #e8ecf1;
  box-shadow: 0 2px 6px rgba(0,0,0,.04);
}

/* ---- 响应式 ---- */
@media (max-width: 900px) {
  .metric-grid { grid-template-columns: repeat(2, 1fr); }
  .chart-row { flex-direction: column; }
  .compare-row { flex-direction: column; }
  .matrix-row { flex-direction: column; }
  .curve-grid { grid-template-columns: 1fr; }
  .sample-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .metric-grid { grid-template-columns: 1fr; }
  .sample-grid { grid-template-columns: 1fr; }
  .analysis-page { padding: 16px; }
}
</style>






