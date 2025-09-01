<template>
  <div class="add-chart-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">创建数据分析图表</h2>
      <p class="page-subtitle">上传数据文件，AI将自动生成分析报告和可视化图表</p>
    </div>

    <div class="main-content">
      <!-- 左侧表单区域 -->
      <div class="form-section">
        <div class="form-card">
          <a-form
            class="analysis-form"
            :model="formState"
            name="addChartForm"
            v-bind="formItemLayout"
            @finishFailed="onFinishFailed"
            @finish="onFinish"
          >
            <!-- 分析目标 -->
            <a-form-item
              name="goal"
              label="分析目标"
              tooltip="请描述您想要分析的问题或达成的目标"
              :rules="[{ required: true, message: '请输入分析目标' }]"
            >
              <a-textarea
                v-model:value="formState.goal"
                placeholder="例如：分析近三个月的销售趋势，找出增长或下降的原因"
                :rows="4"
                class="form-textarea"
              />
            </a-form-item>

            <!-- 图表类型 -->
            <a-form-item
              name="chartType"
              label="图表类型"
              has-feedback
              tooltip="选择您希望生成的图表类型"
              :rules="[{ required: true, message: '请选择图表类型' }]"
            >
              <a-select
                v-model:value="formState.chartType"
                placeholder="请选择图表类型"
                class="form-select"
              >
                <a-select-option value="折线图">折线图</a-select-option>
                <a-select-option value="柱状图">柱状图</a-select-option>
                <a-select-option value="堆叠图">堆叠图</a-select-option>
                <a-select-option value="饼图">饼图</a-select-option>
                <a-select-option value="散点图">散点图</a-select-option>
              </a-select>
            </a-form-item>

            <!-- 图表名称 -->
            <a-form-item
              name="name"
              label="图表名称"
              tooltip="为您的图表设置一个便于识别的名称"
            >
              <a-input
                v-model:value="formState.name"
                placeholder="请输入图表名称（选填）"
                class="form-input"
              />
            </a-form-item>

            <!-- 文件上传 -->
            <a-form-item
              name="file"
              label="数据文件"
              :extra="fileList.length > 0 ? `已选择: ${fileList[0].name}` : '支持CSV、Excel格式，单个文件最大10MB'"
              :rules="[{ required: true, message: '请上传数据文件' }]"
            >
              <a-upload
                v-model:file-list="fileList"
                :max-count="1"
                :before-upload="beforeUpload"
                :custom-request="dummyRequest"
                accept=".csv,.xlsx,.xls"
              >
                <a-button class="upload-button">
                  <UploadOutlined />
                  {{ fileList.length > 0 ? '更换文件' : '选择数据文件' }}
                </a-button>
              </a-upload>
            </a-form-item>

            <!-- 操作按钮 -->
            <a-form-item :wrapper-col="{ span: 24 }" class="form-actions">
              <a-button
                type="primary"
                html-type="submit"
                :loading="submitting"
                class="submit-button"
                block
              >
                <LoadingOutlined v-if="submitting" />
                {{ submitting ? '分析中...' : '开始分析' }}
              </a-button>
              <a-button
                html-type="reset"
                @click="handleReset"
                class="reset-button"
                :disabled="submitting"
                block
              >
                重置
              </a-button>
            </a-form-item>
          </a-form>
        </div>
      </div>

      <!-- 右侧结果展示区域 -->
      <div class="result-section">
        <!-- 分析结果卡片 -->
        <div class="result-card">
          <h3 class="result-title">
            <PieChartOutlined /> 分析结果
          </h3>
          <div v-if="showResult" class="result-content">
            <div class="result-text">
              {{ genResult || '暂无分析结果' }}
            </div>
          </div>
          <div v-else class="result-placeholder">
            <div class="placeholder-icon">📊</div>
            <p>完成数据分析后，结果将显示在这里</p>
          </div>
        </div>

        <!-- 图表展示卡片 -->
        <div class="chart-card">
          <h3 class="chart-title">
            <LineChartOutlined /> 生成图表
          </h3>
          <div v-if="showChart" class="chart-container">
            <v-chart class="chart" :option="chartOptions" autoresize />
          </div>
          <div v-else class="chart-placeholder">
            <div class="placeholder-icon">📈</div>
            <p>完成数据分析后，图表将显示在这里</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { 
  UploadOutlined, 
  LoadingOutlined, 
  PieChartOutlined, 
  LineChartOutlined 
} from '@ant-design/icons-vue';
import VChart from 'vue-echarts';
import { addChart } from '../../api/chart';
import {message, Upload, type UploadFile} from 'ant-design-vue';

// 文件列表
const fileList = ref<UploadFile[]>([]);

// 表单状态
const formState = reactive<{
  chartType: string;
  goal: string;
  name: string;
  rate?: number;
}>({
  chartType: '',
  goal: '',
  name: '',
});

// 分析结果
const genResult = ref<string>('');
const chartOptions = ref<any>({
});

// 上传文件数据
const formFile = reactive<{
  data?: File;
}>({});

// 提交状态
const submitting = ref<boolean>(false);

// 显示结果状态
const showResult = computed(() => !!genResult.value);
const showChart = computed(() => !!chartOptions.value?.series?.length);

// 路由
const router = useRouter();

// 表单布局
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

// 上传前的拦截：仅存储文件，不自动上传
const beforeUpload = (file: UploadFile) => {
  // 文件类型校验
  const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv');
  const isExcel = file.type.includes('spreadsheetml') || 
                 file.type.includes('excel') || 
                 file.name.endsWith('.xlsx') || 
                 file.name.endsWith('.xls');

  if (!isCSV && !isExcel) {
    message.error('仅支持CSV、Excel格式文件!');
    fileList.value = [];
    return Upload.LIST_IGNORE;
  }

  // 文件大小校验
  const isLt10M = file.size / 1024 / 1024 < 10;
  if (!isLt10M) {
    message.error('文件大小不能超过10MB!');
    fileList.value = [];
    return Upload.LIST_IGNORE;
  }

  // 存储文件
  setTimeout(() => {
    formFile.data = file.originFileObj as File;
  }, 0);

  return false; // 阻止默认上传
};

// 伪上传函数（实际提交在表单的 onFinish 中处理）
const dummyRequest = () => {};

// 处理表单提交
const onFinish = async () => {
  // 避免重复提交
  if (submitting.value) {
    return;
  }

  // 检查是否有文件
  if (!fileList.value.length || !formFile.data) {
    message.error('请上传数据文件');
    return;
  }

  submitting.value = true;

  // 对接后端，上传数据
  try {
    const res = await addChart(formState, formFile.data);
    
    if (!res?.data || res.data.code !== 0) {
      message.error('分析失败：' + (res?.data?.message || '未知错误'));
      return;
    }

    message.success('分析成功');
    
    // 处理返回的图表数据
    if (res.data.data?.genChart) {
      try {
        const parsedChart = JSON.parse(res.data.data.genChart);
        chartOptions.value = parsedChart;
      } catch (e) {
        message.error('图表数据解析错误');
        console.error('图表数据解析失败:', e);
      }
    }

    // 处理返回的分析结果
    if (res.data.data?.genResult) {
      genResult.value = res.data.data.genResult;
    }

  } catch (e: any) {
    message.error('分析失败：' + (e.message || '网络异常'));
    console.error('分析请求失败:', e);
  } finally {
    submitting.value = false;
  }
};

// 处理表单重置
const handleReset = () => {
  formState.chartType = '';
  formState.goal = '';
  formState.name = '';
  fileList.value = [];
  formFile.data = undefined;
  genResult.value = '';
  // 保留示例图表，不重置
};

// 处理表单验证失败
const onFinishFailed = (errorInfo: any) => {
  console.log('表单验证失败:', errorInfo);
  message.error('请检查表单填写是否正确');
};
</script>

<style scoped>
/* 页面容器 */
.add-chart-container {
  min-height: 100vh;
  background-color: var(--bg-tertiary);
  padding: 24px;
}

/* 页面标题 */
.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 14px;
  color: var(--text-tertiary);
  margin: 0;
}

/* 主内容区域 */
.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 表单区域 */
.form-section {
  display: flex;
  align-items: flex-start;
}

.form-card {
  background-color: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: 32px;
  width: 100%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.form-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* 表单样式 */
.analysis-form {
  width: 100%;
}

.form-textarea {
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
}

.form-textarea:hover {
  border-color: var(--primary-light);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.form-textarea:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.form-select {
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
}

.form-select:hover {
  border-color: var(--primary-light);
}

.form-select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.form-input {
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
}

.form-input:hover {
  border-color: var(--primary-light);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.form-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

/* 上传按钮 */
.upload-button {
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
}

.upload-button:hover {
  color: var(--primary-color);
  border-color: var(--primary-color);
}

/* 表单操作按钮 */
.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.submit-button {
  flex: 2;
  height: 40px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.35);
}

.reset-button {
  flex: 1;
  height: 40px;
  border-radius: var(--radius-md);
  font-size: 14px;
  transition: all 0.3s ease;
}

.reset-button:hover:not(:disabled) {
  color: var(--text-primary);
  border-color: var(--border-primary);
}

/* 结果展示区域 */
.result-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 结果卡片 */
.result-card,
.chart-card {
  background-color: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: 24px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.result-card:hover,
.chart-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.result-title,
.chart-title {
  font-size: 18px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 结果内容 */
.result-content {
  min-height: 150px;
}

.result-text {
  line-height: 1.8;
  color: var(--text-secondary);
  font-size: 14px;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 图表容器 */
.chart-container {
  min-height: 300px;
}

.chart {
  width: 100%;
  height: 300px;
}

/* 占位符样式 */
.result-placeholder,
.chart-placeholder {
  min-height: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 24px;
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .form-section,
  .result-section {
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
  }
}

@media (max-width: 768px) {
  .add-chart-container {
    padding: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .form-card,
  .result-card,
  .chart-card {
    padding: 20px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .submit-button,
  .reset-button {
    flex: 1;
    width: 100%;
  }
  
  .chart {
    height: 250px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 20px;
  }
  
  .chart {
    height: 200px;
  }
}
</style>